import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "~/app/(auth)/login/login-form";
import { AuthFooterLinks, AuthLink, AuthScreen } from "~/components/auth/auth-screen";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthScreen
      title="Sign in"
      description="Studio and client portal access for invited team members and clients."
      footer={
        <AuthFooterLinks
          primary={
            <p>
              Accounts are created by the studio. Need access?{" "}
              <AuthLink href="mailto:hello@simplycode.io">Email us</AuthLink>
            </p>
          }
          secondary={
            <p>
              <Link
                href="/"
                className="font-semibold text-[#57524a] underline-offset-4 transition-colors hover:text-[#15130f] hover:underline"
              >
                Back to simplycode.io
              </Link>
            </p>
          }
        />
      }
    >
      <Suspense
        fallback={<p className="text-sm text-[#6f6a60]">Loading sign-in…</p>}
      >
        <LoginForm />
      </Suspense>
    </AuthScreen>
  );
}
