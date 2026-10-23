import { redirect } from "next/navigation";
import {
  Field,
  StudioHeader,
  StudioInput,
  StudioSelect,
  StudioTextarea,
} from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { canManageReviews } from "~/lib/roles";
import { createReview } from "~/server/studio/actions";
import { getReviews, getStudioProjects } from "~/server/studio/queries";
import { ReviewsListView } from "~/components/studio/reviews-list-view";
import { StudioFormDialog } from "~/components/studio/studio-form-dialog";
import { appPanelMuted } from "~/lib/surface";
import { cn } from "~/lib/utils";
import { StudioViewToolbar } from "~/components/studio/studio-view-toggle";
import { StudioPagination } from "~/components/studio/studio-pagination";
import { paginateStudio, parseStudioPage, studioPageSummary } from "~/lib/studio-pagination";
import { parseStudioView } from "~/lib/studio-view";

export const dynamic = "force-dynamic";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; page?: string }>;
}) {
  const session = await auth();
  if (!canManageReviews(session?.user.role)) redirect("/studio");

  const { view: viewParam, page: pageParam } = await searchParams;
  const view = parseStudioView(viewParam);
  const page = parseStudioPage(pageParam);
  const [reviews, projects] = await Promise.all([getReviews(), getStudioProjects()]);
  const paginated = paginateStudio(reviews, page);

  return (
    <div>
      <StudioHeader
        title="Reviews"
        description="Client portal submissions stay pending until you approve them. Reviews you add manually (Upwork, etc.) publish immediately. Once published, unpublish instead of sending back to pending."
        actions={
          <StudioFormDialog
            triggerLabel="Add review"
            title="Add review"
            description="Import real feedback for your marketing site—especially when Upwork does not show every review publicly."
            contentClassName="sm:max-w-2xl"
          >
            <form action={createReview} className="grid gap-4">
              <div
                className={cn(
                  appPanelMuted,
                  "space-y-2 px-4 py-3 text-xs leading-relaxed text-[#57524a]",
                )}
              >
                <p className="font-semibold text-sc-ink">Before you save</p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>
                    Paste the <strong className="text-sc-ink">exact quote</strong> from Upwork,
                    Google, or the client—never paraphrase or invent text.
                  </li>
                  <li>
                    Match <strong className="text-sc-ink">author, role, company, rating, and dates</strong>{" "}
                    to what appears on the original platform.
                  </li>
                  <li>
                    Add a <strong className="text-sc-ink">source URL</strong> when you have one (Upwork
                    contract/profile or Google review link).
                  </li>
                  <li>
                    Choose <strong className="text-sc-ink">Upwork</strong> or <strong className="text-sc-ink">Google</strong>{" "}
                    for imported reviews. Client portal submissions use the portal flow and stay pending
                    until approved—do not re-enter those here.
                  </li>
                  <li>
                    Reviews you add here <strong className="text-sc-ink">publish immediately</strong> on
                    the home page. Only founders should import external quotes.
                  </li>
                </ul>
              </div>
              <Field
                label="Quote"
                hint="Copy/paste verbatim from Upwork or the client message. This is shown publicly on the site."
              >
                <StudioTextarea name="quote" required className="min-h-28" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Author name" hint="As shown on Upwork or the signed testimonial.">
                  <StudioInput name="authorName" placeholder="Client" />
                </Field>
                <Field label="Author role" hint="Optional title line under the name on the site.">
                  <StudioInput name="authorRole" placeholder="Founder, Acme" />
                </Field>
                <Field label="Company">
                  <StudioInput name="company" placeholder="Client company" />
                </Field>
                <Field label="Project title" hint="Engagement or job title if it differs from a linked studio project.">
                  <StudioInput name="projectTitle" placeholder="OC WordPress Site" />
                </Field>
                <Field label="Project" hint="Optional link to a studio project for internal reference.">
                  <StudioSelect name="projectId" defaultValue="">
                    <option value="">No linked project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </StudioSelect>
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
                <Field
                  label="Source"
                  hint="Upwork/Google for archived platform reviews. Manual for other written permission. Avoid Client—that path is for portal submissions."
                >
                  <StudioSelect name="source" defaultValue="upwork">
                    <option value="upwork">Upwork</option>
                    <option value="google">Google</option>
                    <option value="manual">Manual</option>
                    <option value="client">Client (legacy)</option>
                  </StudioSelect>
                </Field>
                <Field
                  label="Period"
                  hint="Contract or engagement dates as listed on Upwork (e.g. Jun 2021 – Aug 2023)."
                >
                  <StudioInput name="period" placeholder="Jun 2021 – Aug 2023" />
                </Field>
                <Field
                  label="Source URL"
                  className="sm:col-span-2"
                  hint="Strongly recommended for Upwork: profile, contract, or job link visitors can verify when possible."
                >
                  <StudioInput name="sourceUrl" placeholder="https://www.upwork.com/..." />
                </Field>
              </div>
              <button
                type="submit"
                className="w-fit rounded-md bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase hover:bg-sc-accent"
              >
                Add review
              </button>
            </form>
          </StudioFormDialog>
        }
      />

      <StudioViewToolbar
        summary={<span className="font-semibold text-[#15130f]">{reviews.length} reviews</span>}
        pageSummary={studioPageSummary(paginated.page, paginated.pageSize, paginated.total)}
      />
      <ReviewsListView reviews={paginated.items} view={view} />
      <StudioPagination page={paginated.page} totalPages={paginated.totalPages} />
    </div>
  );
}
