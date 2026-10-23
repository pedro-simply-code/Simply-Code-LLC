import { setTeamMemberShowOnAbout } from "~/server/studio/actions";
import { appGhostButtonLg } from "~/lib/surface";
import { cn } from "~/lib/utils";

export function TeamAboutToggle({
  userId,
  showOnAbout,
  returnTo,
}: {
  userId: string;
  showOnAbout: boolean;
  returnTo: string;
}) {
  return (
    <form action={setTeamMemberShowOnAbout} className="mt-2">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="showOnAbout" value={showOnAbout ? "0" : "1"} />
      <button type="submit" className={cn(appGhostButtonLg, "text-[10px]")}>
        {showOnAbout ? "Hide from About" : "Show on About"}
      </button>
    </form>
  );
}
