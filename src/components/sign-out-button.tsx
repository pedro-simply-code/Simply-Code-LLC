import { LogOut } from "lucide-react";
import { signOut } from "~/lib/auth";
import { Button } from "~/components/ui/button";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form
      action={async () => {
        "use server";
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
            ? "rounded-none border-[#15130f]/15 bg-white text-[#15130f] hover:bg-sc-section-alt hover:text-[#15130f]"
            : undefined
        }
      >
        {compact ? <LogOut className="size-4" /> : "Sign out"}
      </Button>
    </form>
  );
}
