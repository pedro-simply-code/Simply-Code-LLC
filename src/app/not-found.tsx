import { SiteStatusPage } from "~/components/site-status-page";

export default function NotFound() {
  return (
    <SiteStatusPage
      eyebrow="404"
      title="Page not found"
      description="The page you are looking for does not exist or may have moved."
      action={{ href: "/", label: "Back to home" }}
    />
  );
}
