import Link from "next/link";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import { auth } from "~/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">SimplyCode boilerplate</h1>
        <ThemeToggle />
      </div>
      <p className="text-muted-foreground leading-relaxed">
        Next.js 16.4, React 19.3, Auth.js v5, Drizzle ORM 0.45, Neon/Vercel Postgres, TanStack Query 5, shadcn/Radix,
        Jotai 3, dnd-kit, Uploadthing 7, and Tailwind CSS 4.3.
      </p>
      <div className="flex flex-wrap gap-3">
        {session?.user ? (
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        ) : (
          <>
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Create account</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
