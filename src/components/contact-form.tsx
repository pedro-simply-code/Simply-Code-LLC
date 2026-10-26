"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { submitContact } from "~/app/(site)/contact/actions";
import { INITIAL_CONTACT_STATE } from "~/app/(site)/contact/schema";
import { SITE } from "~/content/site";
import { appInputLg, appPanel } from "~/lib/surface";
import { cn } from "~/lib/utils";

const SERVICE_OPTIONS = [
  { value: "ux-design", label: "UX & Design" },
  { value: "full-stack", label: "Full Stack & Systems" },
  { value: "wordpress-development", label: "WordPress Development" },
  { value: "agency-partnerships", label: "Agency Partnership" },
  { value: "other", label: "Something else" },
];

const inputClass = appInputLg;

function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p id={id} className="text-[12px] font-medium text-red-700">
      {messages[0]}
    </p>
  );
}

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContact,
    INITIAL_CONTACT_STATE,
  );
  const startedAtRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Client-only timestamp used as a time trap. Kept out of render state so
    // server and client markup match during hydration.
    if (startedAtRef.current) {
      startedAtRef.current.value = Date.now().toString();
    }
  }, []);

  if (state.status === "success") {
    return (
      <div
        role="status"
        className={cn(
          appPanel,
          "flex h-full flex-col justify-center p-8 sm:p-10",
        )}
      >
        <CheckCircle2 className="text-sc-accent size-10" />
        <h3 className="mt-6 text-2xl font-black tracking-tight uppercase">
          Message sent
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-[#57524a]">
          {state.message ??
            "Thanks — your message is on its way. We reply within one business day."}
        </p>
        <p className="mt-6 text-[13px] text-[#6f6a60]">
          Need to add something? Email us at{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="hover:text-sc-accent font-semibold text-[#15130f] underline underline-offset-4"
          >
            {SITE.email}
          </a>
          .
        </p>
      </div>
    );
  }

  const errors = state.errors ?? {};

  return (
    <form action={formAction} className={cn(appPanel, "p-6 sm:p-8")} noValidate>
      <input
        ref={startedAtRef}
        type="hidden"
        name="startedAt"
        defaultValue=""
      />

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {state.status === "error" && state.message ? (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 border border-red-600/25 bg-red-50 p-4 text-[13px] leading-relaxed text-red-800"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-[11px] font-bold tracking-[0.16em] uppercase"
          >
            Full Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={inputClass}
            placeholder="John Smith"
          />
          <FieldError id="name-error" messages={errors.name} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-[11px] font-bold tracking-[0.16em] uppercase"
          >
            Email Address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClass}
            placeholder="john@company.com"
          />
          <FieldError id="email-error" messages={errors.email} />
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="company"
            className="text-[11px] font-bold tracking-[0.16em] uppercase"
          >
            Company
          </label>
          <input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            aria-invalid={Boolean(errors.company)}
            aria-describedby={errors.company ? "company-error" : undefined}
            className={inputClass}
            placeholder="Company name"
          />
          <FieldError id="company-error" messages={errors.company} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="service"
            className="text-[11px] font-bold tracking-[0.16em] uppercase"
          >
            What Do You Need? *
          </label>
          <select
            id="service"
            name="service"
            required
            defaultValue=""
            aria-invalid={Boolean(errors.service)}
            aria-describedby={errors.service ? "service-error" : undefined}
            className={cn(inputClass, "appearance-none")}
          >
            <option value="" disabled>
              Select a service
            </option>
            {SERVICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError id="service-error" messages={errors.service} />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <label
          htmlFor="message"
          className="text-[11px] font-bold tracking-[0.16em] uppercase"
        >
          Project Details *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : "message-hint"}
          className={cn(inputClass, "resize-y")}
          placeholder="Tell us about your project, goals and timeline."
        />
        {errors.message ? (
          <FieldError id="message-error" messages={errors.message} />
        ) : (
          <p id="message-hint" className="text-[12px] text-[#6f6a60]">
            The more context you share, the more useful our first reply will be.
          </p>
        )}
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-[#6f6a60]">
          By sending this form you agree to our{" "}
          <a
            href="/privacy"
            className="hover:text-sc-accent underline underline-offset-4"
          >
            privacy policy
          </a>
          .
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="hover:bg-sc-accent inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#15130f] px-7 py-3.5 text-[12px] font-bold tracking-[0.16em] text-white uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Sending…" : "Send Message"}
          <ArrowRight className="size-4" />
        </button>
      </div>
    </form>
  );
}
