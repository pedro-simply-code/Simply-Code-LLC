import { redirect } from "next/navigation";
import {
  Field,
  StudioCard,
  StudioHeader,
  StudioInput,
  StudioSelect,
  StudioTextarea,
} from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { canManageReviews } from "~/lib/roles";
import { createReview, setReviewStatus } from "~/server/studio/actions";
import { getReviews, getStudioProjects } from "~/server/studio/queries";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const session = await auth();
  if (!canManageReviews(session?.user.role)) redirect("/studio");

  const [reviews, projects] = await Promise.all([getReviews(), getStudioProjects()]);

  return (
    <div>
      <StudioHeader
        title="Reviews"
        description="Client reviews and manually imported Upwork feedback. Approved reviews are shown on the home page."
      />

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <StudioCard title="Add review" description="Use the exact wording from Upwork or the client. Do not invent quotes.">
          <form action={createReview} className="grid gap-4">
            <Field label="Quote">
              <StudioTextarea name="quote" required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Author name">
                <StudioInput name="authorName" placeholder="Client" />
              </Field>
              <Field label="Author role">
                <StudioInput name="authorRole" placeholder="Founder, Acme" />
              </Field>
              <Field label="Company">
                <StudioInput name="company" />
              </Field>
              <Field label="Project title">
                <StudioInput name="projectTitle" placeholder="OC WordPress Site" />
              </Field>
              <Field label="Project">
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
              <Field label="Source">
                <StudioSelect name="source" defaultValue="upwork">
                  <option value="upwork">Upwork</option>
                  <option value="client">Client</option>
                  <option value="manual">Manual</option>
                  <option value="google">Google</option>
                </StudioSelect>
              </Field>
              <Field label="Period">
                <StudioInput name="period" placeholder="Jun 2021 – Aug 2023" />
              </Field>
              <Field label="Source URL" className="sm:col-span-2">
                <StudioInput name="sourceUrl" placeholder="https://www.upwork.com/..." />
              </Field>
            </div>
            <button
              type="submit"
              className="w-fit bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase hover:bg-[#b8770a]"
            >
              Add review
            </button>
          </form>
        </StudioCard>

        <StudioCard title={`All reviews (${reviews.length})`}>
          <ul className="divide-y divide-[#15130f]/10">
            {reviews.length === 0 ? (
              <li className="py-4 text-sm text-[#6f6a60]">
                No reviews yet. Import the existing Upwork reviews from the studio overview.
              </li>
            ) : (
              reviews.map((review) => (
                <li key={review.id} className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[10px] font-bold tracking-[0.12em] uppercase">
                      {review.source} · {review.rating}/5 · {review.status}
                    </p>
                    <p className="text-[10px] text-[#9a9488]">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <blockquote className="mt-2 text-sm leading-relaxed text-[#15130f]">
                    &ldquo;{review.quote}&rdquo;
                  </blockquote>
                  <p className="mt-2 text-[11px] text-[#6f6a60]">
                    {review.authorName}
                    {review.authorRole ? ` · ${review.authorRole}` : ""}
                    {review.company ? ` · ${review.company}` : ""}
                    {review.projectTitle ? ` · ${review.projectTitle}` : ""}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.status !== "approved" ? (
                      <form action={setReviewStatus}>
                        <input type="hidden" name="reviewId" value={review.id} />
                        <input type="hidden" name="status" value="approved" />
                        <button
                          type="submit"
                          className="bg-[#15130f] px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-white uppercase hover:bg-[#b8770a]"
                        >
                          Approve
                        </button>
                      </form>
                    ) : null}
                    {review.status !== "pending" ? (
                      <form action={setReviewStatus}>
                        <input type="hidden" name="reviewId" value={review.id} />
                        <input type="hidden" name="status" value="pending" />
                        <button
                          type="submit"
                          className="border border-[#15130f]/20 px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] uppercase hover:border-[#b8770a]"
                        >
                          Pending
                        </button>
                      </form>
                    ) : null}
                    {review.status !== "hidden" ? (
                      <form action={setReviewStatus}>
                        <input type="hidden" name="reviewId" value={review.id} />
                        <input type="hidden" name="status" value="hidden" />
                        <button
                          type="submit"
                          className="border border-[#9a3b2e]/30 px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-[#9a3b2e] uppercase hover:border-[#9a3b2e]"
                        >
                          Hide
                        </button>
                      </form>
                    ) : null}
                  </div>
                </li>
              ))
            )}
          </ul>
        </StudioCard>
      </div>
    </div>
  );
}
