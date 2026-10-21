"use client";

import { useQuery } from "@tanstack/react-query";

type PostRow = {
  id: string;
  title: string;
  body: string | null;
  createdAt: string;
};

async function fetchPosts(): Promise<PostRow[]> {
  const res = await fetch("/api/posts");
  if (!res.ok) throw new Error("Failed to load posts");
  const data = (await res.json()) as { posts: PostRow[] };
  return data.posts;
}

export function DashboardPosts() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-medium">Your posts (TanStack Query)</h2>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
      {error ? <p className="text-sm text-destructive">Could not load posts.</p> : null}
      {data && data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts yet — add a `posts` row in Drizzle Studio to try the API.</p>
      ) : null}
      <ul className="space-y-2">
        {data?.map((post) => (
          <li key={post.id} className="rounded-md border px-4 py-3 text-sm">
            <p className="font-medium">{post.title}</p>
            {post.body ? <p className="text-muted-foreground mt-1">{post.body}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
