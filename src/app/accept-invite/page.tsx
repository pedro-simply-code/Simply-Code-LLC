import type { Metadata } from "next";
import Link from "next/link";
import { acceptInvite } from "~/server/studio/actions";
import { getInviteByToken } from "~/server/invites";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const metadata: Metadata = {
  title: "Accept invitation",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  validation:
    "Check the form and try again. The password needs upper, lower and a number.",
  match: "The passwords do not match.",
  expired: "This invitation has expired or has already been used.",
};

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token = "", error } = await searchParams;
  const invite = await getInviteByToken(token);
  const errorMessage = error ? ERROR_MESSAGES[error] : null;

  if (!invite) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation unavailable</CardTitle>
            <CardDescription>
              This invitation link is invalid, expired, or has already been
              used.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4 text-sm">
            <p>Ask the Simply Code team to send you a new invitation.</p>
            <Button asChild className="w-full">
              <Link href="/login">Go to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accept invitation</CardTitle>
          <CardDescription>
            {invite.clientName
              ? `Set your password to join the ${invite.clientName} portal.`
              : "Set your password to join the Simply Code studio."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={acceptInvite} className="space-y-4">
            <input type="hidden" name="token" value={token} />

            {errorMessage ? (
              <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border px-3 py-2 text-sm">
                {errorMessage}
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={invite.name ?? ""}
                autoComplete="name"
                required
                maxLength={120}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={invite.email}
                readOnly
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
              />
              <p className="text-muted-foreground text-xs">
                At least 8 characters with an uppercase letter, a lowercase
                letter and a number.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
              />
            </div>

            <Button type="submit" className="w-full">
              Create account
            </Button>

            <p className="text-muted-foreground text-center text-xs">
              This invitation expires in 7 days and can only be used once.
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
