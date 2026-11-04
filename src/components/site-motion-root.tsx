"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function motionDisabledOnDocument(): boolean {
  const level = document.documentElement.dataset.siteMotion ?? "balanced";
  if (level === "none") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const PENDING_REVEAL = ".site-reveal:not(.site-reveal-visible)";

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

    const register = (node: Node) => {
      if (!(node instanceof Element)) return;
      if (node.matches(PENDING_REVEAL)) observer.observe(node);
      node.querySelectorAll(PENDING_REVEAL).forEach((el) => observer.observe(el));
    };

    const unregister = (node: Node) => {
      if (!(node instanceof Element)) return;
      if (node.matches(".site-reveal")) observer.unobserve(node);
      node.querySelectorAll(".site-reveal").forEach((el) => observer.unobserve(el));
    };

    const scan = () => {
      if (motionDisabledOnDocument()) return;
      document.querySelectorAll(PENDING_REVEAL).forEach((el) => observer.observe(el));
    };

    scan();

    /**
     * Client-rendered reveal blocks (portfolio filters, pagination, tabs…) mount
     * after this effect ran, so they would stay at `opacity: 0` forever. Watch
     * the DOM and register/unregister them as they appear and disappear.
     */
    const mutations = new MutationObserver((records) => {
      if (motionDisabledOnDocument()) return;
      for (const record of records) {
        record.removedNodes.forEach(unregister);
        record.addedNodes.forEach(register);
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

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
      mutations.disconnect();
      observer.disconnect();
      reduced.removeEventListener("change", onReducedMotion);
    };
  }, [pathname]);

  return children;
}
