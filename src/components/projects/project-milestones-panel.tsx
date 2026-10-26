import {
  createProjectMilestone,
  deleteProjectMilestone,
  updateProjectMilestone,
} from "~/server/projects/actions";
import { Field, StudioCard, StudioInput, StudioSelect, StudioTextarea } from "~/components/studio/ui";

type Milestone = {
  id: string;
  title: string;
  description: string;
  status: string;
  sortOrder: number;
  targetDate: Date | null;
  completedAt: Date | null;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
};

export function ProjectMilestonesPanel({
  projectId,
  milestones,
  canManage,
  isMember,
  audience = "studio",
}: {
  projectId: string;
  milestones: Milestone[];
  canManage: boolean;
  isMember: boolean;
  audience?: "studio" | "portal";
}) {
  const completed = milestones.filter((m) => m.status === "completed").length;
  const progress =
    milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : null;

  return (
    <div className="space-y-6">
      <StudioCard
        title="Milestones"
        description={
          audience === "portal"
            ? "Where your project is headed. Completed milestones appear in your activity feed."
            : "Phases clients see in the portal when marked completed. Track delivery progress internally."
        }
      >
        {progress !== null ? (
          <div className="mb-4">
            <div className="flex items-center justify-between text-[11px] font-bold tracking-[0.1em] text-[#6f6a60] uppercase">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#15130f]/10">
              <div
                className="h-full rounded-full bg-sc-accent transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}

        {milestones.length === 0 ? (
          <p className="text-sm text-[#6f6a60]">No milestones yet.</p>
        ) : (
          <ul className="divide-y divide-[#15130f]/10">
            {milestones.map((milestone) => (
              <li key={milestone.id} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{milestone.title}</p>
                    {milestone.description ? (
                      <p className="mt-1 text-xs leading-relaxed whitespace-pre-wrap text-[#57524a]">
                        {milestone.description}
                      </p>
                    ) : null}
                    <p className="mt-2 text-[10px] text-[#9a9488]">
                      {STATUS_LABEL[milestone.status] ?? milestone.status}
                      {milestone.targetDate
                        ? ` · target ${milestone.targetDate.toLocaleDateString()}`
                        : ""}
                      {milestone.completedAt
                        ? ` · completed ${milestone.completedAt.toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                  {isMember ? (
                    <form action={updateProjectMilestone} className="flex flex-wrap items-end gap-2">
                      <input type="hidden" name="projectId" value={projectId} />
                      <input type="hidden" name="milestoneId" value={milestone.id} />
                      <input type="hidden" name="title" value={milestone.title} />
                      <input type="hidden" name="description" value={milestone.description} />
                      <StudioSelect name="status" defaultValue={milestone.status} className="min-w-[9rem]">
                        <option value="pending">Pending</option>
                        <option value="in_progress">In progress</option>
                        <option value="completed">Completed</option>
                      </StudioSelect>
                      <button
                        type="submit"
                        className="rounded-md bg-[#15130f] px-3 py-2 text-[10px] font-bold tracking-[0.12em] text-white uppercase hover:bg-sc-accent"
                      >
                        Save
                      </button>
                    </form>
                  ) : null}
                </div>
                {canManage ? (
                  <form action={deleteProjectMilestone} className="mt-2">
                    <input type="hidden" name="projectId" value={projectId} />
                    <input type="hidden" name="milestoneId" value={milestone.id} />
                    <button
                      type="submit"
                      className="text-[10px] font-bold tracking-[0.12em] text-[#9a3b2e] uppercase hover:underline"
                    >
                      Remove milestone
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {isMember ? (
          <form
            action={createProjectMilestone}
            className="mt-4 space-y-3 border-t border-[#15130f]/10 pt-4"
          >
            <input type="hidden" name="projectId" value={projectId} />
            <Field label="New milestone title">
              <StudioInput name="title" required />
            </Field>
            <Field label="Description (optional)">
              <StudioTextarea name="description" />
            </Field>
            <Field label="Target date (optional)">
              <StudioInput name="targetDate" type="date" />
            </Field>
            <button
              type="submit"
              className="rounded-md bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase hover:bg-sc-accent"
            >
              Add milestone
            </button>
          </form>
        ) : null}
      </StudioCard>
    </div>
  );
}
