import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X } from "lucide-react";
import {
  Field,
  StudioCard,
  StudioHeader,
  StudioInput,
  StudioSelect,
  StudioTextarea,
} from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { projectDisplayDate } from "~/lib/project-year";
import { createClientReview, createPortalRequest } from "~/server/studio/actions";
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

  const { project, updates, requests, lead, review } = detail;

  return (
    <div>
      <StudioHeader
        title={project.title}
        description={project.summary}
        actions={
          <Link
            href="/portal"
            className="inline-flex border border-[#15130f]/20 px-3 py-2 text-[10px] font-bold tracking-[0.14em] uppercase hover:border-[#b8770a]"
          >
            All projects
          </Link>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StudioCard title="Status">
          <p className="text-sm font-semibold capitalize">{project.status}</p>
        </StudioCard>
        <StudioCard title="Your lead">
          <p className="text-sm font-semibold">{lead?.name ?? "Simply Code team"}</p>
        </StudioCard>
        <StudioCard title="Timeline">
          <p className="text-sm font-semibold">{projectDisplayDate(project.createdAt)}</p>
        </StudioCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
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

          <StudioCard title="Your requests">
            {requests.length === 0 ? (
              <p className="text-sm text-[#6f6a60]">You have not submitted any requests yet.</p>
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
                        {request.status === "completed" ? <Check className="size-3" /> : null}
                        {request.status === "rejected" ? <X className="size-3" /> : null}
                        {request.status}
                      </span>
                    </div>
                    {request.description ? (
                      <p className="mt-1 text-xs leading-relaxed whitespace-pre-wrap text-[#57524a]">
                        {request.description}
                      </p>
                    ) : null}
                    {request.resolutionNote ? (
                      <p
                        className={
                          request.status === "rejected"
                            ? "mt-2 border-l-2 border-[#9a3b2e]/40 pl-3 text-xs leading-relaxed text-[#9a3b2e]"
                            : "mt-2 border-l-2 border-[#2e7d32]/30 pl-3 text-xs leading-relaxed text-[#57524a]"
                        }
                      >
                        <strong>
                          {request.status === "rejected" ? "Rejected reason: " : "Note: "}
                        </strong>
                        {request.resolutionNote}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[10px] text-[#9a9488]">
                      {request.type} · {request.priority} ·{" "}
                      {new Date(request.createdAt).toLocaleDateString()}
                      {request.resolvedAt
                        ? ` · resolved ${new Date(request.resolvedAt).toLocaleDateString()}`
                        : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </StudioCard>
        </div>

        <StudioCard title="Send a request" description="Add a new item or ask for a change. Your project lead receives it.">
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
              className="w-full bg-[#15130f] px-4 py-3 text-[10px] font-bold tracking-[0.16em] text-white uppercase hover:bg-[#b8770a]"
            >
              Submit request
            </button>
          </form>
        </StudioCard>

        {project.status === "completed" ? (
          <StudioCard
            title="Your review"
            description="Your project is complete. Reviews appear on the public site after the studio approves them."
          >
            {reviewStatus === "submitted" ? (
              <p className="mb-4 border border-[#2e7d32]/25 bg-[#e8f5e9] px-3 py-2 text-sm text-[#2e7d32]">
                Thanks — your review was sent for approval.
              </p>
            ) : null}

            {review ? (
              <div>
                <p className="text-[10px] font-bold tracking-[0.12em] text-[#b8770a] uppercase">
                  {review.status} · {review.rating}/5
                </p>
                <blockquote className="mt-2 text-sm leading-relaxed text-[#15130f]">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>
                <p className="mt-2 text-[11px] text-[#6f6a60]">
                  Submitted {new Date(review.createdAt).toLocaleDateString()}
                </p>
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
                  className="w-full border border-[#15130f]/20 px-4 py-3 text-[10px] font-bold tracking-[0.16em] uppercase hover:border-[#b8770a]"
                >
                  Submit review
                </button>
              </form>
            )}
          </StudioCard>
        ) : null}
      </div>
    </div>
  );
}
