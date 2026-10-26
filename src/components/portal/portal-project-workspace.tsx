import Link from "next/link";
import { Check, X } from "lucide-react";
import { ProjectActivityFeed } from "~/components/projects/project-activity-feed";
import { ProjectDeliverablesPanel } from "~/components/projects/project-deliverables-panel";
import { ProjectMilestonesPanel } from "~/components/projects/project-milestones-panel";
import { StudioTabs } from "~/components/studio/studio-tabs";
import {
  Field,
  StudioCard,
  StudioHeader,
  StudioInput,
  StudioSelect,
  StudioTextarea,
} from "~/components/studio/ui";
import { projectDisplayDate } from "~/lib/project-year";
import { reviewStatusLabel } from "~/lib/reviews";
import { appGhostButtonLg } from "~/lib/surface";
import { cn } from "~/lib/utils";
import {
  createClientReview,
  createPortalRequest,
} from "~/server/studio/actions";
import type { getPortalProject } from "~/server/studio/queries";

type PortalDetail = NonNullable<Awaited<ReturnType<typeof getPortalProject>>>;

export function PortalProjectWorkspace({
  detail,
  reviewStatus,
}: {
  detail: PortalDetail;
  reviewStatus?: string;
}) {
  const {
    project,
    updates,
    requests,
    milestones,
    deliverables,
    activity,
    milestoneProgress,
    lead,
    review,
  } = detail;

  const overviewPanel = (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <StudioCard title="Status">
          <p className="text-sm font-semibold capitalize">{project.status}</p>
        </StudioCard>
        <StudioCard title="Your lead">
          <p className="text-sm font-semibold">
            {lead?.name ?? "Simply Code team"}
          </p>
        </StudioCard>
        <StudioCard title="Started">
          <p className="text-sm font-semibold">
            {projectDisplayDate(project.createdAt)}
          </p>
        </StudioCard>
      </div>
      {milestoneProgress !== null ? (
        <StudioCard title="Milestone progress">
          <p className="text-2xl font-black tracking-tight">
            {milestoneProgress}%
          </p>
          <p className="mt-1 text-xs text-[#6f6a60]">
            Based on completed milestones
          </p>
        </StudioCard>
      ) : null}
      <StudioCard title="Latest activity">
        <ProjectActivityFeed items={activity.slice(0, 5)} />
      </StudioCard>
    </div>
  );

  const updatesPanel = (
    <StudioCard title="Progress updates">
      {updates.length === 0 ? (
        <p className="text-sm text-[#6f6a60]">No updates published yet.</p>
      ) : (
        <ul className="divide-y divide-[#15130f]/10">
          {updates.map((update) => (
            <li key={update.id} className="py-4">
              <p className="text-sm font-semibold">{update.title}</p>
              {update.body ? (
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-[#57524a]">
                  {update.body}
                </p>
              ) : null}
              <p className="mt-2 text-[10px] text-[#9a9488]">
                {update.authorName ?? "Simply Code"} ·{" "}
                {new Date(update.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </StudioCard>
  );

  const requestsPanel = (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <StudioCard title="Your requests">
        {requests.length === 0 ? (
          <p className="text-sm text-[#6f6a60]">
            You have not submitted any requests yet.
          </p>
        ) : (
          <ul className="divide-y divide-[#15130f]/10">
            {requests.map((request) => (
              <li key={request.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{request.title}</p>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.12em] uppercase ${
                      request.status === "completed"
                        ? "text-[#2e7d32]"
                        : request.status === "rejected"
                          ? "text-[#9a3b2e]"
                          : "text-[#6f6a60]"
                    }`}
                  >
                    {request.status === "completed" ? (
                      <Check className="size-3" />
                    ) : null}
                    {request.status === "rejected" ? (
                      <X className="size-3" />
                    ) : null}
                    {request.status}
                  </span>
                </div>
                {request.description ? (
                  <p className="mt-1 text-xs leading-relaxed whitespace-pre-wrap text-[#57524a]">
                    {request.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </StudioCard>

      <StudioCard
        title="Send a request"
        description="Your project lead receives it in studio."
      >
        <form action={createPortalRequest} className="space-y-4">
          <input type="hidden" name="projectId" value={project.id} />
          <Field label="Title">
            <StudioInput name="title" required />
          </Field>
          <Field label="What do you need?">
            <StudioTextarea name="description" />
          </Field>
          <Field label="Type">
            <StudioSelect name="type" defaultValue="request">
              <option value="request">New item / request</option>
              <option value="change">Change to existing work</option>
            </StudioSelect>
          </Field>
          <Field label="Priority">
            <StudioSelect name="priority" defaultValue="normal">
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </StudioSelect>
          </Field>
          <button
            type="submit"
            className="hover:bg-sc-accent w-full rounded-md bg-[#15130f] px-4 py-3 text-[10px] font-bold tracking-[0.16em] text-white uppercase"
          >
            Submit request
          </button>
        </form>
      </StudioCard>
    </div>
  );

  const milestonesPanel = (
    <ProjectMilestonesPanel
      projectId={project.id}
      milestones={milestones}
      canManage={false}
      isMember={false}
      audience="portal"
    />
  );

  const deliverablesPanel = (
    <ProjectDeliverablesPanel
      projectId={project.id}
      deliverables={deliverables}
      isMember={false}
      canManage={false}
      canPublishToClient={false}
      audience="portal"
    />
  );

  const activityPanel = (
    <StudioCard
      title="Activity"
      description="Updates, requests, deliverables, and completed milestones."
    >
      <ProjectActivityFeed items={activity} />
    </StudioCard>
  );

  const reviewPanel =
    project.status === "completed" ? (
      <StudioCard
        title="Your review"
        description="Reviews appear on the public site after the studio approves them."
      >
        {reviewStatus === "submitted" ? (
          <p className="mb-4 border border-[#2e7d32]/25 bg-[#e8f5e9] px-3 py-2 text-sm text-[#2e7d32]">
            Thanks — your review was sent for approval.
          </p>
        ) : null}
        {review ? (
          <div>
            <p className="text-sc-accent text-[10px] font-bold tracking-[0.12em] uppercase">
              {reviewStatusLabel(review.status, "portal")} · {review.rating}/5
            </p>
            <blockquote className="mt-2 text-sm leading-relaxed text-[#15130f]">
              &ldquo;{review.quote}&rdquo;
            </blockquote>
          </div>
        ) : (
          <form action={createClientReview} className="space-y-4">
            <input type="hidden" name="projectId" value={project.id} />
            <Field label="How did we do?">
              <StudioTextarea name="quote" required />
            </Field>
            <Field label="Rating">
              <StudioSelect name="rating" defaultValue="5">
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
              </StudioSelect>
            </Field>
            <button
              type="submit"
              className={cn(
                "w-full",
                appGhostButtonLg,
                "px-4 py-3 tracking-[0.16em]",
              )}
            >
              Submit review
            </button>
          </form>
        )}
      </StudioCard>
    ) : null;

  const tabs = [
    { id: "overview", label: "Overview", panel: overviewPanel },
    { id: "activity", label: "Activity", panel: activityPanel },
    { id: "milestones", label: "Milestones", panel: milestonesPanel },
    { id: "deliverables", label: "Files", panel: deliverablesPanel },
    { id: "updates", label: "Updates", panel: updatesPanel },
    { id: "requests", label: "Requests", panel: requestsPanel },
    ...(reviewPanel
      ? [{ id: "review", label: "Review", panel: reviewPanel }]
      : []),
  ];

  return (
    <div>
      <StudioHeader
        title={project.title}
        description={project.summary}
        actions={
          <Link href="/portal" className={cn("inline-flex", appGhostButtonLg)}>
            All projects
          </Link>
        }
      />
      <StudioTabs items={tabs} defaultTab="overview" />
    </div>
  );
}
