"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { loginSchema, type LoginInput } from "~/schemas/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const invitedEmail = searchParams.get("email") ?? "";
  const invited = searchParams.get("invited") === "1";
  const authError = searchParams.get("error");
  const errorMessage =
    authError === "AccessDenied"
      ? "That email has not been invited. Ask the Simply Code team for an invitation."
      : authError === "OAuthAccountNotLinked"
        ? "Sign in with the method you used to accept the invitation."
        : authError
          ? "We couldn't sign you in with that account. Ask the studio for an invitation."
          : null;

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: invitedEmail, password: "" },
  });

  async function onSubmit(values: LoginInput) {
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Invalid email or password");
      return;
    }

    toast.success("Signed in");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      {invited ? (
        <p className="rounded-md border border-[#b8770a]/30 bg-[#b8770a]/5 px-3 py-2 text-sm text-[#7a4e05]">
          Your account is ready. Sign in with the password you just created.
        </p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email ? (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
        {form.formState.errors.password ? (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        ) : null}
      </div>
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Signing in…" : "Sign in with email"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => void signIn("google", { callbackUrl })}
      >
        Continue with Google
      </Button>
    </form>
  );
}
