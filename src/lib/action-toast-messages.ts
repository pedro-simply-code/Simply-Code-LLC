import type { AppToastVariant } from "~/lib/app-toast";

export type ResolvedActionToast = {
  variant: AppToastVariant;
  message: string;
  /** Query keys to remove after showing the toast. */
  clearParams: string[];
  /** Refresh Auth.js session after save (profile pages). */
  refreshSession?: boolean;
};

export const ACTION_ERROR_MESSAGES: Record<string, string> = {
  validation: "Check your input and try again.",
  name: "Name is required.",
  "avatar-upload": "The photo could not be saved. Try again or use a smaller file.",
  title: "Title is required.",
  "cover-upload": "The cover image could not be saved. Try again or use a smaller file.",
  create: "The project could not be created. Try again.",
  update: "Could not save the project. Check the title and try again.",
  member: "Could not update project members.",
  exists: "That email already has an account.",
  self: "You cannot change your own role.",
  "last-founder": "The studio needs at least one founder.",
  email:
    "Invitation saved, but the email could not be sent. Check the Google SMTP settings.",
  quote: "Review quote is required.",
  "request-reason": "A rejection reason is required.",
  expired: "This invitation link is invalid or has expired.",
};

const LOGIN_AUTH_ERRORS: Record<string, { variant: AppToastVariant; message: string }> = {
  AccessDenied: {
    variant: "warning",
    message: "That email has not been invited. Ask the Simply Code team for an invitation.",
  },
  OAuthAccountNotLinked: {
    variant: "warning",
    message: "Sign in with the method you used to accept the invitation.",
  },
};

function savedMessage(pathname: string): string {
  if (pathname.startsWith("/studio/settings")) {
    return "Settings saved. The site is using the new look.";
  }
  if (pathname.endsWith("/profile")) {
    return "Profile saved.";
  }
  if (pathname.startsWith("/studio/projects")) {
    return "Project saved.";
  }
  if (pathname.startsWith("/studio/clients")) {
    return "Client saved.";
  }
  return "Changes saved.";
}

/** Map URL search params after a server action redirect to a toast. */
export function resolveActionToast(
  pathname: string,
  params: URLSearchParams,
): ResolvedActionToast | null {
  if (params.get("saved") === "1") {
    return {
      variant: "success",
      message: savedMessage(pathname),
      clearParams: ["saved"],
      refreshSession: pathname.endsWith("/profile"),
    };
  }

  if (params.get("invited") === "1") {
    if (pathname.startsWith("/login")) {
      return {
        variant: "success",
        message: "Your account is ready. Sign in with the password you just created.",
        clearParams: ["invited"],
      };
    }
    return {
      variant: "success",
      message: "Invitation sent.",
      clearParams: ["invited"],
    };
  }

  if (params.get("review") === "submitted") {
    return {
      variant: "success",
      message: "Thank you — your review was submitted for approval.",
      clearParams: ["review"],
    };
  }

  const error = params.get("error");
  if (!error) return null;

  if (pathname.startsWith("/login")) {
    const auth = LOGIN_AUTH_ERRORS[error];
    if (auth) {
      return { variant: auth.variant, message: auth.message, clearParams: ["error"] };
    }
    return {
      variant: "error",
      message: "We couldn't sign you in with that account. Ask the studio for an invitation.",
      clearParams: ["error"],
    };
  }

  if (error === "member" && pathname.startsWith("/studio/clients")) {
    return {
      variant: "error",
      message: "Enter a valid client email.",
      clearParams: ["error"],
    };
  }

  if (error === "name" && pathname.startsWith("/studio/clients")) {
    return {
      variant: "error",
      message: "Enter a company name.",
      clearParams: ["error"],
    };
  }

  if (error === "validation" && pathname.startsWith("/studio/settings")) {
    return {
      variant: "error",
      message: "Could not save — check your choices and try again.",
      clearParams: ["error"],
    };
  }

  const message = ACTION_ERROR_MESSAGES[error];
  if (!message) return null;

  const variant: AppToastVariant =
    error === "email" ? "warning" : error === "validation" ? "warning" : "error";

  return { variant, message, clearParams: ["error"] };
}
