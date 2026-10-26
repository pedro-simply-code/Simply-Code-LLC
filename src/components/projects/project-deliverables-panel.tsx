import { ProjectDeliverablesForm } from "~/components/projects/project-deliverables-form";
import { StudioCard } from "~/components/studio/ui";
import {
  addProjectDeliverable,
  removeProjectDeliverable,
} from "~/server/projects/actions";

type Deliverable = {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  visibility: string;
  createdAt: Date;
  uploaderName: string | null;
};

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function ProjectDeliverablesPanel({
  projectId,
  deliverables,
  isMember,
  canManage,
  canPublishToClient,
  audience,
}: {
  projectId: string;
  deliverables: Deliverable[];
  isMember: boolean;
  canManage: boolean;
  canPublishToClient: boolean;
  audience: "studio" | "portal";
}) {
  const visible =
    audience === "studio"
      ? deliverables
      : deliverables.filter((item) => item.visibility === "client");

  return (
    <StudioCard
      title="Deliverables"
      description={
        audience === "portal"
          ? "Files shared by your project team."
          : "Designs, documents, and builds for the client or internal reference."
      }
    >
      {visible.length === 0 ? (
        <p className="text-sm text-[#6f6a60]">No deliverables yet.</p>
      ) : (
        <ul className="divide-y divide-[#15130f]/10">
          {visible.map((item) => (
            <li key={item.id} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  {item.description ? (
                    <p className="mt-1 text-xs leading-relaxed text-[#57524a]">
                      {item.description}
                    </p>
                  ) : null}
                  <p className="mt-2 text-[10px] text-[#9a9488]">
                    {item.fileName} · {formatBytes(item.fileSize)}
                    {audience === "studio" ? ` · ${item.visibility}` : ""}
                    {item.uploaderName ? ` · ${item.uploaderName}` : ""}
                  </p>
                </div>
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-sc-accent rounded-md bg-[#15130f] px-3 py-2 text-[10px] font-bold tracking-[0.12em] text-white uppercase"
                >
                  Download
                </a>
              </div>
              {canManage && audience === "studio" ? (
                <form action={removeProjectDeliverable} className="mt-2">
                  <input type="hidden" name="projectId" value={projectId} />
                  <input type="hidden" name="deliverableId" value={item.id} />
                  <button
                    type="submit"
                    className="text-[10px] font-bold tracking-[0.12em] text-[#9a3b2e] uppercase hover:underline"
                  >
                    Remove
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {isMember && audience === "studio" ? (
        <ProjectDeliverablesForm
          projectId={projectId}
          action={addProjectDeliverable}
          canPublishToClient={canPublishToClient}
        />
      ) : null}
    </StudioCard>
  );
}
