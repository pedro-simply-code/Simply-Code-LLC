"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

/** Runs once after profile save: refresh JWT + server layout, then drop `?saved=1`. */
export function RefreshSessionAfterSave({ saved }: { saved: boolean }) {
  const { update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const handled = useRef(false);

  useEffect(() => {
    if (!saved || handled.current) return;
    handled.current = true;

    void (async () => {
      try {
        await update();
      } finally {
        router.replace(pathname, { scroll: false });
        router.refresh();
      }
    })();
    // `update` is intentionally omitted — its identity changes after each session fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per `saved=1` visit
  }, [saved, pathname, router]);

  return null;
}
