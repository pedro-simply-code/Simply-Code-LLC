import "server-only";

import nodemailer, { type Transporter } from "nodemailer";
import { env } from "~/env";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const user = env.GOOGLE_SMTP_USER;
  const pass = env.GOOGLE_SMTP_APP_PASSWORD;
  if (!user || !pass) return null;

  transporter ??= nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  return transporter;
}

/**
 * Sends transactional email through Google Workspace / Gmail SMTP.
 *
 * Create an App Password for the Google account and set
 * `GOOGLE_SMTP_USER` + `GOOGLE_SMTP_APP_PASSWORD`. `CONTACT_FROM_EMAIL`
 * should be the same address (or an authorised alias).
 */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  const smtpUser = env.GOOGLE_SMTP_USER;
  const mailer = getTransporter();

  if (!smtpUser || !mailer) {
    if (env.NODE_ENV === "development") {
      const links = [
        ...new Set(
          [...input.html.matchAll(/href="([^"]+)"/g)]
            .map((match) => match[1])
            .filter((link): link is string => Boolean(link)),
        ),
      ];
      console.info(
        "[sendEmail] Google SMTP is not configured — logging instead of sending",
        {
          to: input.to,
          subject: input.subject,
          links,
        },
      );
      return;
    }

    throw new Error(
      "Email provider not configured. Set GOOGLE_SMTP_USER and GOOGLE_SMTP_APP_PASSWORD.",
    );
  }

  await mailer.sendMail({
    from: env.CONTACT_FROM_EMAIL ?? `Simply Code <${smtpUser}>`,
    to: input.to,
    subject: input.subject,
    html: input.html,
    ...(input.replyTo ? { replyTo: input.replyTo } : {}),
  });
}
