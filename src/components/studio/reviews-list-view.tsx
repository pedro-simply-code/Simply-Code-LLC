import { setReviewStatus } from "~/server/studio/actions";
import type { StudioViewMode } from "~/lib/studio-view";
import { reviewSourceLabel, reviewStatusLabel } from "~/lib/reviews";
import { appPanel, appPanelHover } from "~/lib/surface";
import { cn } from "~/lib/utils";

type ReviewRow = {
  id: string;
  source: string;
  rating: number;
  status: string;
  createdAt: Date;
  quote: string;
  authorName: string | null;
  authorRole: string | null;
  company: string | null;
  projectTitle: string | null;
};

function ReviewStatusBadge({
  status,
  source,
}: {
  status: string;
  source: string;
}) {
  const needsModeration = status === "pending" && source === "client";
  const published = status === "approved";
  const hidden = status === "hidden";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={cn(
          "rounded-md px-2 py-1 text-[10px] font-bold tracking-[0.1em] uppercase",
          published && "bg-[#e8f5e9] text-[#2e7d32]",
          status === "pending" && "bg-[#fff8e6] text-[#b45309]",
          hidden && "bg-sc-section-alt text-[#6f6a60]",
        )}
      >
        {reviewStatusLabel(status)}
      </span>
      <span className="text-[10px] font-bold tracking-[0.1em] text-[#9a9488] uppercase">
        {reviewSourceLabel(source)} ·{" "}
        {needsModeration ? "needs approval" : "curated"}
      </span>
    </div>
  );
}

function ReviewModerationActions({ review }: { review: ReviewRow }) {
  if (review.status === "pending") {
    return (
      <div className="flex flex-wrap gap-2">
        <form action={setReviewStatus}>
          <input type="hidden" name="reviewId" value={review.id} />
          <input type="hidden" name="status" value="approved" />
          <button
            type="submit"
            className="hover:bg-sc-accent rounded-md bg-[#15130f] px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-white uppercase"
          >
            Approve & publish
          </button>
        </form>
        <form action={setReviewStatus}>
          <input type="hidden" name="reviewId" value={review.id} />
          <input type="hidden" name="status" value="hidden" />
          <button
            type="submit"
            className="rounded-md bg-white px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-[#9a3b2e] uppercase shadow-[0_1px_2px_rgba(154,59,46,0.15)] hover:shadow-[0_2px_8px_rgba(154,59,46,0.2)]"
          >
            Hide
          </button>
        </form>
      </div>
    );
  }

  if (review.status === "approved") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] text-[#6f6a60]">
          Live on the marketing site.
        </p>
        <form action={setReviewStatus}>
          <input type="hidden" name="reviewId" value={review.id} />
          <input type="hidden" name="status" value="hidden" />
          <button
            type="submit"
            className="rounded-md bg-white px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-[#9a3b2e] uppercase shadow-[0_1px_2px_rgba(154,59,46,0.15)] hover:shadow-[0_2px_8px_rgba(154,59,46,0.2)]"
          >
            Unpublish
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <p className="text-[11px] text-[#6f6a60]">Not shown publicly.</p>
      <form action={setReviewStatus}>
        <input type="hidden" name="reviewId" value={review.id} />
        <input type="hidden" name="status" value="approved" />
        <button
          type="submit"
          className="hover:bg-sc-accent rounded-md bg-[#15130f] px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-white uppercase"
        >
          Approve & publish
        </button>
      </form>
    </div>
  );
}

export function ReviewsListView({
  reviews,
  view,
}: {
  reviews: ReviewRow[];
  view: StudioViewMode;
}) {
  if (reviews.length === 0) {
    return (
      <p className={cn(appPanel, "px-4 py-8 text-sm text-[#6f6a60]")}>
        No reviews yet. Use <strong>Add review</strong> above.
      </p>
    );
  }

  const card = (review: ReviewRow) => (
    <>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <ReviewStatusBadge status={review.status} source={review.source} />
        <p className="text-[10px] text-[#9a9488]">
          {review.rating}/5 · {new Date(review.createdAt).toLocaleDateString()}
        </p>
      </div>
      <blockquote className="mt-3 line-clamp-4 text-sm leading-relaxed text-[#15130f]">
        &ldquo;{review.quote}&rdquo;
      </blockquote>
      <p className="mt-2 text-[11px] text-[#6f6a60]">
        {review.authorName}
        {review.authorRole ? ` · ${review.authorRole}` : ""}
        {review.company ? ` · ${review.company}` : ""}
        {review.projectTitle ? ` · ${review.projectTitle}` : ""}
      </p>
      <div className="mt-4 border-t border-[#15130f]/8 pt-3">
        <ReviewModerationActions review={review} />
      </div>
    </>
  );

  if (view === "grid") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <article
            key={review.id}
            className={cn(appPanel, appPanelHover, "p-4")}
          >
            {card(review)}
          </article>
        ))}
      </div>
    );
  }

  return (
    <ul className={cn(appPanel, "divide-y divide-[#15130f]/10")}>
      {reviews.map((review) => (
        <li key={review.id} className="px-4 py-4">
          {card(review)}
        </li>
      ))}
    </ul>
  );
}
