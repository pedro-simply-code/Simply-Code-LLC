import { LogOut } from "lucide-react";
import { signOut } from "~/lib/auth";
import { clearTwoFactorCookieOnSignOut } from "~/server/auth/two-factor-actions";
import { Button } from "~/components/ui/button";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form
      action={async () => {
        "use server";
        await clearTwoFactorCookieOnSignOut();
        await signOut({ redirectTo: "/" });
      }}
    >
      <Button
        type="submit"
        variant="outline"
        size={compact ? "icon" : "sm"}
        aria-label="Sign out"
        title="Sign out"
        className={
          compact
            ? "hover:bg-sc-section-alt rounded-none border-[#15130f]/15 bg-white text-[#15130f] hover:text-[#15130f]"
            : undefined
        }
      >
        {compact ? <LogOut className="size-4" /> : "Sign out"}
      </Button>
    </form>
  );
}
