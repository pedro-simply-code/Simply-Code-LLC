import { MaintenanceScreen } from "~/components/maintenance-screen";
import { SiteMotionRoot } from "~/components/site-motion-root";
import { getSiteSettings } from "~/server/site-settings/queries";

export const dynamic = "force-dynamic";

/** Public marketing routes: full maintenance page when enabled. */
export default async function PublicSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  if (!settings.maintenanceMode) {
    return <SiteMotionRoot>{children}</SiteMotionRoot>;
  }

  return <MaintenanceScreen message={settings.maintenanceMessage} />;
}
