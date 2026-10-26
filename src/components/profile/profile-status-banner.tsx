import { cn } from "~/lib/utils";
import { appPanelMuted } from "~/lib/surface";

const MESSAGES: Record<string, { tone: "ok" | "error"; text: string }> = {
  saved: { tone: "ok", text: "Profile saved." },
  name: { tone: "error", text: "Name is required." },
  "avatar-upload": {
    tone: "error",
    text: "Could not upload photo. Try a smaller image.",
  },
  url: {
    tone: "error",
    text: "Check your link URLs — use https:// addresses.",
  },
};

export function ProfileStatusBanner({ code }: { code?: string | null }) {
  if (!code) return null;
  const message = MESSAGES[code];
  if (!message) return null;

  return (
    <p
      className={cn(
        appPanelMuted,
        "mb-6 px-4 py-3 text-sm font-medium",
        message.tone === "ok"
          ? "text-sc-accent-deep ring-sc-accent/30"
          : "text-[#9a3b2e] ring-red-500/25",
      )}
      role="status"
    >
      {message.text}
    </p>
  );
}
