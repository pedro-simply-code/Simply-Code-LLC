import { MaintenanceScreen } from "~/components/maintenance-screen";
import { getSiteSettings } from "~/server/site-settings/queries";

export const dynamic = "force-dynamic";

/** Public marketing routes: full maintenance page when enabled. */
export default async function PublicSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  if (!settings.maintenanceMode) return children;

  return <MaintenanceScreen message={settings.maintenanceMessage} />;
}
