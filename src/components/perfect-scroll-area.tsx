"use client";

import { forwardRef, type ReactNode } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import { cn } from "~/lib/utils";

const SCROLL_OPTIONS = {
  suppressScrollX: true,
  wheelPropagation: false,
} as const;

type PerfectScrollAreaProps = {
  children: ReactNode;
  className?: string;
};

/** Perfect Scrollbar region for modals, panels, sidebars, and nested lists. */
export const PerfectScrollArea = forwardRef<
  PerfectScrollbar,
  PerfectScrollAreaProps
>(function PerfectScrollArea({ children, className }, ref) {
  return (
    <PerfectScrollbar
      ref={ref}
      className={cn("site-perfect-scroll-area", className)}
      options={SCROLL_OPTIONS}
    >
      {children}
    </PerfectScrollbar>
  );
});
