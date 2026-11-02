"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";

export function SiteScrollRoot({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const scrollRef = useRef<PerfectScrollbar | null>(null);

  useEffect(() => {
    scrollRef.current?.updateScroll();
  }, [pathname]);

  return (
    <PerfectScrollbar
      ref={scrollRef}
      className="site-perfect-scroll-root"
      options={{
        suppressScrollX: true,
        wheelPropagation: false,
      }}
    >
      {children}
    </PerfectScrollbar>
  );
}
