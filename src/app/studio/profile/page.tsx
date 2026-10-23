import { redirect } from "next/navigation";
import { ProfileForm } from "~/components/profile/profile-form";
import { RefreshSessionAfterSave } from "~/components/profile/refresh-session-after-save";
import { StudioHeader } from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { isTeam } from "~/lib/roles";
import { getUserProfile } from "~/server/profile/queries";

export const dynamic = "force-dynamic";

export default async function StudioProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/studio/profile");
  if (!isTeam(session.user.role)) redirect("/portal/profile");

  const { saved, error } = await searchParams;
  const user = await getUserProfile(session.user.id);
  if (!user) redirect("/studio");

  return (
    <div>
      <RefreshSessionAfterSave saved={saved === "1"} />
      <StudioHeader
        title="Your profile"
        description="Update your name, photo, and how you appear on the public About page."
      />
      {error === "name" ? (
        <p className="mb-6 border border-[#9a3b2e]/25 bg-[#fdf1ef] px-4 py-3 text-sm text-[#9a3b2e]">
          Name is required.
        </p>
      ) : null}
      {error === "avatar-upload" ? (
        <p className="mb-6 border border-[#9a3b2e]/25 bg-[#fdf1ef] px-4 py-3 text-sm text-[#9a3b2e]">
          The photo could not be saved. Try again or use a smaller file.
        </p>
      ) : null}
      {saved === "1" ? (
        <p className="mb-6 border border-[#2e7d32]/25 bg-[#e8f5e9] px-4 py-3 text-sm text-[#2e7d32]">
          Profile saved.
        </p>
      ) : null}
      <ProfileForm user={user} showAboutFields />
    </div>
  );
}
