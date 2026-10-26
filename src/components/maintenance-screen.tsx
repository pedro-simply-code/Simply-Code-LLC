import { SiteStatusPage } from "~/components/site-status-page";

export function MaintenanceScreen({ message }: { message: string }) {
  const text =
    message.trim() || "We are making improvements. Please check back soon.";

  return (
    <SiteStatusPage
      eyebrow="Maintenance"
      title="We'll be right back"
      description={text}
    />
  );
}
