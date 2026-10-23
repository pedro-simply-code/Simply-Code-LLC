import { redirect } from "next/navigation";
import { SiteSettingsForm } from "~/components/studio/site-settings-form";
import { StudioHeader } from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { isFounder } from "~/lib/roles";
import { getSiteSettings } from "~/server/site-settings/queries";

export const dynamic = "force-dynamic";

export default async function StudioSettingsPage() {
  const session = await auth();
  if (!isFounder(session?.user.role)) redirect("/studio");

  const settings = await getSiteSettings();

  return (
    <div>
      <StudioHeader
        title="Site settings"
        description="Global appearance and maintenance options for the public site, studio, and client portal. Only founders can change these."
        descriptionClassName="max-w-none"
      />

      {settings.maintenanceMode ? (
        <p className="mb-6 rounded-lg bg-sc-accent/10 px-4 py-3 text-sm font-medium text-sc-accent-deep ring-1 ring-sc-accent/30">
          Maintenance mode is <strong>on</strong> — public pages show the maintenance screen at{" "}
          <a href="/" className="underline hover:text-sc-ink" target="_blank" rel="noreferrer">
            /
          </a>
          .
        </p>
      ) : null}

      <SiteSettingsForm settings={settings} />
    </div>
  );
}
