"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function motionDisabledOnDocument(): boolean {
  const level = document.documentElement.dataset.siteMotion ?? "balanced";
  if (level === "none") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Observes `.site-reveal` on the public marketing site when motion is enabled. */
export function SiteMotionRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("site-motion-js");

    if (motionDisabledOnDocument()) {
      document.querySelectorAll(".site-reveal").forEach((el) => {
        el.classList.add("site-reveal-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("site-reveal-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );

    const scan = () => {
      if (motionDisabledOnDocument()) return;
      document
        .querySelectorAll(".site-reveal:not(.site-reveal-visible)")
        .forEach((el) => {
          observer.observe(el);
        });
    };

    scan();
    const onReducedMotion = (event: MediaQueryListEvent) => {
      if (event.matches) {
        document.querySelectorAll(".site-reveal").forEach((el) => {
          el.classList.add("site-reveal-visible");
        });
        observer.disconnect();
      }
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.addEventListener("change", onReducedMotion);

    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", onReducedMotion);
    };
  }, [pathname]);

  return children;
}
