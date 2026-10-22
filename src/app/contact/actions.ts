"use server";

import { env } from "~/env";
import { sendEmail } from "~/server/email/sendEmail";
import { contactSchema, type ContactState } from "~/app/contact/schema";

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

  const submittedAt = new Date().toLocaleString("en-US", { timeZone: "UTC" });

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
    message: "Thanks — your message is on its way. We reply within one business day.",
  };
}
