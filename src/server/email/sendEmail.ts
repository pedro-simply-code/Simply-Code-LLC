import "server-only";

/**
 * Stub for transactional email. Wire Postmark, Resend, etc. when needed.
 * Keep secrets in server env only (`POSTMARK_SERVER_TOKEN`, etc.).
 */
export async function sendEmail(input: { to: string; subject: string; html: string }): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.info("[sendEmail stub] Skipped in development", { to: input.to, subject: input.subject });
    return;
  }
  throw new Error("Email provider not configured. Implement sendEmail in src/server/email/sendEmail.ts");
}
