"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Field, StudioInput } from "~/components/studio/ui";
import { appToast } from "~/lib/app-toast";
import { appGhostButtonLg, appPrimaryButtonStudioSubmit } from "~/lib/surface";
import { cn } from "~/lib/utils";
import { loginSchema, type LoginInput } from "~/schemas/auth";
import { credentialsSignIn } from "~/server/auth/credentials-sign-in";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const invitedEmail = searchParams.get("email") ?? "";
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: invitedEmail, password: "" },
  });

  async function onSubmit(values: LoginInput) {
    const result = await credentialsSignIn(values);

    if (!result.ok) {
      if (result.error === "rate_limited") {
        appToast.error("Too many sign-in attempts. Please wait a few minutes.");
      } else {
        appToast.error("Invalid email or password");
      }
      return;
    }

    if (result.needs2fa) {
      const verify = new URL("/login/two-factor", window.location.origin);
      verify.searchParams.set("callbackUrl", callbackUrl);
      router.push(`${verify.pathname}${verify.search}`);
      router.refresh();
      return;
    }

    appToast.success("Signed in");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <Field label="Email">
        <StudioInput
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!form.formState.errors.email}
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-xs text-[#9a3b2e]">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </Field>

      <Field label="Password">
        <StudioInput
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!form.formState.errors.password}
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="text-xs text-[#9a3b2e]">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </Field>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className={cn(
          appPrimaryButtonStudioSubmit,
          "w-full disabled:opacity-50",
        )}
      >
        {form.formState.isSubmitting ? "Signing in…" : "Sign in with email"}
      </button>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-[#15130f]/10" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-sc-section px-2 text-[10px] font-bold tracking-[0.12em] text-[#9a9488] uppercase">
            or
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={form.formState.isSubmitting}
        onClick={() => void signIn("google", { callbackUrl })}
        className={cn(
          appGhostButtonLg,
          "w-full justify-center disabled:opacity-50",
        )}
      >
        Continue with Google
      </button>
    </form>
  );
}
