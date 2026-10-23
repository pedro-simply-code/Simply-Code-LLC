import { redirect } from "next/navigation";
import { ProfileForm } from "~/components/profile/profile-form";
import { ProfileStatusBanner } from "~/components/profile/profile-status-banner";
import { StudioHeader } from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { isTeam } from "~/lib/roles";
import { getUserProfile } from "~/server/profile/queries";

export const dynamic = "force-dynamic";

export default async function PortalProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const statusCode = params.saved === "1" ? "saved" : params.error ?? null;
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/portal/profile");
  if (isTeam(session.user.role)) redirect("/studio/profile");

  const user = await getUserProfile(session.user.id);
  if (!user) redirect("/portal");

  return (
    <div className="flex w-full min-h-0 flex-col">
      <StudioHeader
        title="Your profile"
        description="Your name, photo, and how the Simply Code team can reach you."
        descriptionClassName="max-w-none"
      />
      <ProfileStatusBanner code={statusCode} />
      <ProfileForm user={user} showAboutFields={false} />
    </div>
  );
}
