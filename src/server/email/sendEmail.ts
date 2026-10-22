import "server-only";

import { env } from "~/env";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

/**
 * Sends transactional email through Resend when `RESEND_API_KEY` is set.
 *
 * In development without a key the email is logged instead of sent, so the
 * contact form can be exercised locally. In production a missing key throws so
 * the failure is visible rather than silently swallowing enquiries.
 *
 * Swap the `fetch` call for Postmark/SES if you change provider — keep secrets
 * in server env only.
 */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  const apiKey = env.RESEND_API_KEY;

  if (!apiKey) {
    if (env.NODE_ENV === "development") {
      console.info("[sendEmail] RESEND_API_KEY missing — logging instead of sending", {
        to: input.to,
        subject: input.subject,
      });
      return;
    }

    throw new Error("Email provider not configured. Set RESEND_API_KEY in the environment.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend rejected the email (${response.status}): ${detail.slice(0, 300)}`);
  }
}
