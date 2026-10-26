"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "~/lib/auth";
import { isUploadThingImageUrl } from "~/lib/project-image";
import { normalizeOptionalUrl } from "~/lib/profile";
import { homePathForRole, isFounder, isTeam } from "~/lib/roles";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import {
  releaseUserUploadClaims,
  userOwnsUploadClaim,
} from "~/server/uploads/claims";
import {
  discardUploadThingImageUrl,
  resolveUserAvatarFromForm,
} from "~/server/uploadthing-storage";

export async function discardPendingAvatarUpload(url: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  if (!(await userOwnsUploadClaim(session.user.id, url))) return;
  await discardUploadThingImageUrl(url, "user-avatar");
  await releaseUserUploadClaims(session.user.id, [url]);
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function skillList(formData: FormData, key: string): string[] {
  return text(formData, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function checkbox(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

export async function updateUserProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profilePath = isTeam(session.user.role)
    ? "/studio/profile"
    : "/portal/profile";
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  if (!existing) redirect(homePathForRole(session.user.role));

  const name = text(formData, "name");
  if (!name) redirect(`${profilePath}?error=name`);

  const resolvedImage = await resolveUserAvatarFromForm(
    formData,
    existing.image,
    text(formData, "image"),
  );
  if (!resolvedImage.ok) redirect(`${profilePath}?error=avatar-upload`);

  const nextImage = resolvedImage.image;
  if (
    nextImage &&
    nextImage !== existing.image &&
    isUploadThingImageUrl(nextImage) &&
    !(await userOwnsUploadClaim(session.user.id, nextImage))
  ) {
    redirect(`${profilePath}?error=avatar-upload`);
  }

  const teamMember = isTeam(session.user.role);
  const phone = text(formData, "phone") || null;
  const timezone = text(formData, "timezone") || null;
  const bio = text(formData, "bio") || null;

  const linkedinRaw = teamMember ? text(formData, "linkedinUrl") : "";
  const githubRaw = teamMember ? text(formData, "githubUrl") : "";
  const portfolioRaw = teamMember ? text(formData, "portfolioUrl") : "";

  const linkedinUrl = linkedinRaw ? normalizeOptionalUrl(linkedinRaw) : null;
  const githubUrl = githubRaw ? normalizeOptionalUrl(githubRaw) : null;
  const portfolioUrl = portfolioRaw ? normalizeOptionalUrl(portfolioRaw) : null;

  if (linkedinRaw && !linkedinUrl) redirect(`${profilePath}?error=url`);
  if (githubRaw && !githubUrl) redirect(`${profilePath}?error=url`);
  if (portfolioRaw && !portfolioUrl) redirect(`${profilePath}?error=url`);

  await db
    .update(users)
    .set({
      name,
      phone,
      timezone,
      bio,
      title: teamMember ? text(formData, "title") || null : existing.title,
      profileSkills: teamMember
        ? skillList(formData, "profileSkills")
        : existing.profileSkills,
      showOnAbout:
        teamMember && isFounder(session.user.role)
          ? checkbox(formData, "showOnAbout")
          : existing.showOnAbout,
      linkedinUrl: teamMember ? linkedinUrl : existing.linkedinUrl,
      githubUrl: teamMember ? githubUrl : existing.githubUrl,
      portfolioUrl: teamMember ? portfolioUrl : existing.portfolioUrl,
      image: nextImage,
    })
    .where(eq(users.id, session.user.id));

  if (
    nextImage &&
    nextImage !== existing.image &&
    isUploadThingImageUrl(nextImage)
  ) {
    await releaseUserUploadClaims(session.user.id, [nextImage]);
  }

  revalidatePath("/about");
  revalidatePath(profilePath);
  redirect(`${profilePath}?saved=1`);
}
