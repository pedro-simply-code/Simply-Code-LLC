"use server";

import { headers } from "next/headers";
import { getClientIp } from "~/lib/client-ip";
import { env } from "~/env";
import { consumeRateLimit } from "~/server/rate-limit";
import { sendEmail } from "~/server/email/sendEmail";
import { contactSchema, type ContactState } from "~/app/(site)/contact/schema";
import { db } from "~/server/db";
import { contactMessages } from "~/server/db/schema";
import { notifyFounders } from "~/server/notifications";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function submitContact(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company") ?? "",
    service: formData.get("service"),
    message: formData.get("message"),
    website: formData.get("website") ?? "",
    startedAt: formData.get("startedAt") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      status: "error",
      message: "Please check the highlighted fields and try again.",
      errors: {
        name: fieldErrors.name,
        email: fieldErrors.email,
        company: fieldErrors.company,
        service: fieldErrors.service,
        message: fieldErrors.message,
      },
    };
  }

  const data = parsed.data;

  // Honeypot field plus a minimum time on the form: bots fill both instantly.
  const startedAt = Number(data.startedAt);
  const tooFast = Number.isFinite(startedAt) && Date.now() - startedAt < 2500;

  if (data.website || tooFast) {
    // Pretend it worked so the bot does not retry.
    return { status: "success", message: "Thanks — we received your message." };
  }

  const ip = getClientIp(await headers());
  const contactAllowed = await consumeRateLimit(
    `contact:ip:${ip}`,
    8,
    60 * 60 * 1000,
  );
  if (!contactAllowed) {
    return {
      status: "error",
      message:
        "Too many messages from your network. Please try again in about an hour.",
    };
  }

  const submittedAt = new Date().toLocaleString("en-US", { timeZone: "UTC" });

  try {
    await db.insert(contactMessages).values({
      name: data.name,
      email: data.email,
      company: data.company || null,
      service: data.service,
      message: data.message,
      attachments: [],
    });

    await notifyFounders({
      type: "contact",
      title: `New enquiry from ${data.name}`,
      body: `${data.service}${data.company ? ` · ${data.company}` : ""} — ${data.message.slice(0, 160)}`,
      href: "/studio/messages",
    });
  } catch (error) {
    // Email is still the source of truth if the notification write fails.
    console.error("[contact] Failed to persist enquiry", error);
  }

  const html = `
    <h1>New project enquiry</h1>
    <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Company:</strong> ${escapeHtml(data.company || "—")}</p>
    <p><strong>Service:</strong> ${escapeHtml(data.service)}</p>
    <p><strong>Submitted:</strong> ${escapeHtml(submittedAt)} UTC</p>
    <hr />
    <p style="white-space: pre-wrap">${escapeHtml(data.message)}</p>
  `;

  try {
    await sendEmail({
      to: env.CONTACT_EMAIL,
      replyTo: data.email,
      subject: `Project enquiry — ${data.name}${data.company ? ` (${data.company})` : ""}`,
      html,
    });
  } catch (error) {
    console.error("[contact] Failed to send enquiry", error);
    return {
      status: "error",
      message: `We couldn't send your message. Please email ${env.CONTACT_EMAIL} directly and we'll pick it up from there.`,
    };
  }

  return {
    status: "success",
    message:
      "Thanks — your message is on its way. We reply within one business day.",
  };
}
