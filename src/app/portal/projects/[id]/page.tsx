import { notFound } from "next/navigation";
import { PortalProjectWorkspace } from "~/components/portal/portal-project-workspace";
import { auth } from "~/lib/auth";
import { getPortalProject } from "~/server/studio/queries";

export const dynamic = "force-dynamic";

export default async function PortalProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ review?: string }>;
}) {
  const { id } = await params;
  const { review: reviewStatus } = await searchParams;
  const session = await auth();
  const detail = session?.user.id ? await getPortalProject(id, session.user.id) : null;
  if (!detail) notFound();

  return <PortalProjectWorkspace detail={detail} reviewStatus={reviewStatus} />;
}
