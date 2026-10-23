"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "~/lib/auth";
import { homePathForRole, isTeam } from "~/lib/roles";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { resolveUserAvatarFromForm } from "~/server/uploadthing-storage";

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function skillList(formData: FormData, key: string): string[] {
  return text(formData, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function checked(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export async function updateUserProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profilePath = isTeam(session.user.role) ? "/studio/profile" : "/portal/profile";
  const [existing] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  if (!existing) redirect(homePathForRole(session.user.role));

  const name = text(formData, "name");
  if (!name) redirect(`${profilePath}?error=name`);

  const resolvedImage = await resolveUserAvatarFromForm(
    formData,
    existing.image,
    text(formData, "image"),
  );
  if (!resolvedImage.ok) redirect(`${profilePath}?error=avatar-upload`);

  const teamMember = isTeam(session.user.role);

  await db
    .update(users)
    .set({
      name,
      title: teamMember ? text(formData, "title") || null : existing.title,
      profileSkills: teamMember ? skillList(formData, "profileSkills") : existing.profileSkills,
      showOnAbout: teamMember ? checked(formData, "showOnAbout") : false,
      image: resolvedImage.image,
    })
    .where(eq(users.id, session.user.id));

  revalidatePath("/about");
  revalidatePath(profilePath);
  redirect(`${profilePath}?saved=1`);
}
