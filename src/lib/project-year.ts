export function projectDisplayYear(createdAt: Date | string): string {
  const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  return String(date.getFullYear());
}

export function projectDisplayDate(createdAt: Date | string): string {
  const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}
