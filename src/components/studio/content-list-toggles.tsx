"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  toggleContentPublished,
  toggleContentShowInNav,
} from "~/server/content/actions";
import type { ContentKindName, ContentStatusName } from "~/lib/content";
import { cn } from "~/lib/utils";

function TogglePill({
  label,
  active,
  disabled,
  onClick,
  title,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-md px-2 py-1 text-[10px] font-bold tracking-[0.08em] uppercase transition-colors",
        active
          ? "bg-[#e8f5e9] text-[#2e7d32]"
          : "bg-sc-section-alt text-[#6f6a60] hover:text-[#15130f]",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {label}
    </button>
  );
}

export function ContentPublishedToggle({
  id,
  status,
}: {
  id: string;
  status: ContentStatusName;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const published = status === "published";

  return (
    <TogglePill
      label={published ? "Published" : "Draft"}
      active={published}
      disabled={pending}
      title={published ? "Set to draft" : "Publish"}
      onClick={() => {
        startTransition(async () => {
          await toggleContentPublished(id);
          router.refresh();
        });
      }}
    />
  );
}

export function ContentNavMenuToggle({
  id,
  kind,
  showInNav,
}: {
  id: string;
  kind: ContentKindName;
  showInNav: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (kind !== "page") {
    return <span className="text-[10px] text-[#9a9488]">—</span>;
  }

  return (
    <TogglePill
      label={showInNav ? "In menu" : "Hidden"}
      active={showInNav}
      disabled={pending}
      title={showInNav ? "Remove from main navigation" : "Show in main navigation"}
      onClick={() => {
        startTransition(async () => {
          await toggleContentShowInNav(id);
          router.refresh();
        });
      }}
    />
  );
}
