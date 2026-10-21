import Link from "next/link";
import { ThemeToggle } from "~/components/theme-toggle";
import { SignOutButton } from "~/components/sign-out-button";
import { auth } from "~/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="font-medium">
              Dashboard
            </Link>
            {session?.user.role === "admin" ? (
              <Link href="/dashboard/admin" className="text-muted-foreground hover:text-foreground">
                Admin
              </Link>
            ) : null}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">{session?.user.email}</span>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
    </div>
  );
}
