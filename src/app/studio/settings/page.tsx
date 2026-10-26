import { redirect } from "next/navigation";
import { AuditLogPanel } from "~/components/studio/audit-log-panel";
import { SiteSettingsForm } from "~/components/studio/site-settings-form";
import { TwoFactorSettings } from "~/components/studio/two-factor-settings";
import { StudioHeader } from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { isFounder } from "~/lib/roles";
import { getRecentAuditEvents } from "~/server/audit/queries";
import { getSiteSettings } from "~/server/site-settings/queries";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function StudioSettingsPage() {
  const session = await auth();
  if (!isFounder(session?.user.role)) redirect("/studio");

  const [settings, auditEvents, security] = await Promise.all([
    getSiteSettings(),
    getRecentAuditEvents(50),
    db
      .select({ totpEnabled: users.totpEnabled })
      .from(users)
      .where(eq(users.id, session!.user!.id))
      .limit(1),
  ]);

  return (
    <div>
      <StudioHeader
        title="Site settings"
        description="Global appearance and maintenance options for the public site, studio, and client portal. Only founders can change these."
        descriptionClassName="max-w-none"
      />

      {settings.maintenanceMode ? (
        <p className="bg-sc-accent/10 text-sc-accent-deep ring-sc-accent/30 mb-6 rounded-lg px-4 py-3 text-sm font-medium ring-1">
          Maintenance mode is <strong>on</strong> — public pages show the
          maintenance screen at{" "}
          <a
            href="/"
            className="hover:text-sc-ink underline"
            target="_blank"
            rel="noreferrer"
          >
            /
          </a>
          .
        </p>
      ) : null}

      <div className="mb-8 space-y-6">
        <TwoFactorSettings enabled={security[0]?.totpEnabled ?? false} />
        <AuditLogPanel events={auditEvents} />
      </div>

      <SiteSettingsForm settings={settings} />
    </div>
  );
}
