import { redirect } from "next/navigation";
import { ProfileForm } from "~/components/profile/profile-form";
import { ProfileStatusBanner } from "~/components/profile/profile-status-banner";
import { StudioHeader } from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { isFounder, isTeam } from "~/lib/roles";
import { getUserProfile } from "~/server/profile/queries";

export const dynamic = "force-dynamic";

export default async function StudioProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const statusCode = params.saved === "1" ? "saved" : params.error ?? null;
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/studio/profile");
  if (!isTeam(session.user.role)) redirect("/portal/profile");

  const user = await getUserProfile(session.user.id);
  if (!user) redirect("/studio");

  return (
    <div className="flex w-full min-h-0 flex-col">
      <StudioHeader
        title="Your profile"
        description="Account details, contact preferences, and your public About page presence."
        descriptionClassName="max-w-none"
      />
      <ProfileStatusBanner code={statusCode} />
      <ProfileForm
        user={user}
        showAboutFields
        canEditAboutVisibility={isFounder(session.user.role)}
      />
    </div>
  );
}
