import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TwoFactorLoginForm } from "~/app/(auth)/login/two-factor/two-factor-login-form";
import { AuthFooterLinks, AuthScreen } from "~/components/auth/auth-screen";
import { auth } from "~/lib/auth";
import { homePathForRole } from "~/lib/roles";

export const metadata: Metadata = {
  title: "Two-factor authentication",
  robots: { index: false, follow: false },
};

export default async function TwoFactorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const home = homePathForRole(session.user.role);
  if (!session.totpRequired) redirect(home);

  const { callbackUrl } = await searchParams;
  const safeCallback =
    callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : home;

  return (
    <AuthScreen
      title="Two-factor authentication"
      description="Enter the 6-digit code from your authenticator app to continue."
      footer={
        <AuthFooterLinks
          secondary={
            <p>
              <Link
                href="/login"
                className="font-semibold text-[#57524a] underline-offset-4 transition-colors hover:text-[#15130f] hover:underline"
              >
                Back to sign in
              </Link>
            </p>
          }
        />
      }
    >
      <TwoFactorLoginForm callbackUrl={safeCallback} />
    </AuthScreen>
  );
}
