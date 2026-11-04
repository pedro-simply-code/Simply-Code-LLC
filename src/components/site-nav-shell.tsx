import { SiteNav } from "~/components/site-nav";
import { listPublishedNavPagesSafe } from "~/server/content/queries";

export async function SiteNavShell() {
  const cmsLinks = await listPublishedNavPagesSafe();
  return <SiteNav cmsLinks={cmsLinks} />;
}
