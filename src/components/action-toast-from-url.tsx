"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { resolveActionToast } from "~/lib/action-toast-messages";
import { appToast } from "~/lib/app-toast";

/**
 * Shows a toast after server-action redirects (`?saved=1`, `?error=…`, etc.)
 * and removes those params from the URL.
 */
export function ActionToastFromUrl() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { update } = useSession();
  const lastHandled = useRef<string | null>(null);

  useEffect(() => {
    const resolved = resolveActionToast(pathname, searchParams);
    if (!resolved) return;

    const fingerprint = `${pathname}?${resolved.clearParams.map((k) => `${k}=${searchParams.get(k)}`).join("&")}`;
    if (lastHandled.current === fingerprint) return;
    lastHandled.current = fingerprint;

    appToast[resolved.variant](resolved.message);

    const next = new URLSearchParams(searchParams.toString());
    for (const key of resolved.clearParams) {
      next.delete(key);
    }
    const query = next.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    router.replace(href, { scroll: false });

    if (resolved.refreshSession) {
      void update().then(() => router.refresh());
    }
  }, [pathname, router, searchParams, update]);

  return null;
}
