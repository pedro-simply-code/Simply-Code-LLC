import type { ProjectActivityItem } from "~/server/projects/activity";

const KIND_LABEL: Record<ProjectActivityItem["kind"], string> = {
  update: "Update",
  request: "Request",
  deliverable: "Deliverable",
  milestone: "Milestone",
};

export function ProjectActivityFeed({
  items,
  projectTitle,
}: {
  items: ProjectActivityItem[];
  projectTitle?: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-[#6f6a60]">No activity yet.</p>;
  }

  return (
    <ul className="divide-y divide-[#15130f]/10">
      {items.map((item) => (
        <li key={item.id} className="py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sc-accent text-[10px] font-bold tracking-[0.12em] uppercase">
              {KIND_LABEL[item.kind]}
            </span>
            {projectTitle ? (
              <span className="text-[10px] font-bold tracking-[0.1em] text-[#9a9488] uppercase">
                {projectTitle}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm font-semibold text-[#15130f]">
            {item.title}
          </p>
          {item.body ? (
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-[#57524a]">
              {item.body}
            </p>
          ) : null}
          <p className="mt-2 text-[10px] text-[#9a9488]">
            {item.meta} · {item.at.toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}
