"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      closeButton
      expand={false}
      gap={10}
      toastOptions={{
        classNames: {
          toast: "app-toast",
          title: "app-toast-title",
          description: "app-toast-description",
          success: "app-toast--success",
          error: "app-toast--error",
          warning: "app-toast--warning",
          info: "app-toast--info",
          closeButton: "app-toast-close",
          actionButton: "app-toast-action",
          cancelButton: "app-toast-cancel",
        },
      }}
    />
  );
}
