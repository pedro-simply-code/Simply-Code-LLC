import { toast as sonner, type ExternalToast } from "sonner";

export type AppToastVariant = "success" | "error" | "warning" | "info";

export type AppToastOptions = ExternalToast;

function show(variant: AppToastVariant, message: string, options?: AppToastOptions) {
  switch (variant) {
    case "success":
      sonner.success(message, options);
      break;
    case "error":
      sonner.error(message, options);
      break;
    case "warning":
      sonner.warning(message, options);
      break;
    case "info":
      sonner.info(message, options);
      break;
  }
}

/** Theme-aware toasts (see `AppToaster` + `.app-toast` in globals.css). */
export const appToast = {
  success: (message: string, options?: AppToastOptions) => show("success", message, options),
  error: (message: string, options?: AppToastOptions) => show("error", message, options),
  warning: (message: string, options?: AppToastOptions) => show("warning", message, options),
  info: (message: string, options?: AppToastOptions) => show("info", message, options),
};
