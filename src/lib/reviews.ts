/** Review moderation states stored in `reviews.status`. */
export type ReviewStatus = "pending" | "approved" | "hidden";

export function reviewStatusLabel(status: string, audience: "studio" | "portal" = "studio"): string {
  if (audience === "portal") {
    switch (status) {
      case "pending":
        return "Under review";
      case "approved":
        return "Published";
      case "hidden":
        return "Not published";
      default:
        return status;
    }
  }

  switch (status) {
    case "pending":
      return "Pending approval";
    case "approved":
      return "Published";
    case "hidden":
      return "Hidden";
    default:
      return status;
  }
}

export function reviewSourceLabel(source: string): string {
  switch (source) {
    case "client":
      return "Client portal";
    case "upwork":
      return "Upwork";
    case "google":
      return "Google";
    case "manual":
      return "Manual";
    default:
      return source;
  }
}
