import type { Metadata } from "next";
import { ContentNavigationWorkspace } from "~/components/studio/content-navigation-workspace";
import { requireContentManager } from "~/server/authz";
import { listNavMenuEditorPages } from "~/server/content/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Navigation · Content",
};

export default async function ContentNavigationPage() {
  await requireContentManager();
  const items = await listNavMenuEditorPages();

  return <ContentNavigationWorkspace items={items} />;
}
