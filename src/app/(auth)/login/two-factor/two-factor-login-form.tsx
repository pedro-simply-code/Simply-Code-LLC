"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, StudioInput } from "~/components/studio/ui";
import { appToast } from "~/lib/app-toast";
import { appPrimaryButtonStudioSubmit } from "~/lib/surface";
import { cn } from "~/lib/utils";
import { verifyTwoFactorLogin } from "~/server/auth/two-factor-actions";

export function TwoFactorLoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const result = await verifyTwoFactorLogin(code);
    setPending(false);
    if (!result.ok) {
      appToast.error("Invalid code. Try again.");
      return;
    }
    appToast.success("Verified");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <Field label="Authentication code" hint="Codes refresh every 30 seconds.">
        <StudioInput
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="000000"
          className="text-center font-mono text-lg tracking-[0.35em] tabular-nums"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          required
        />
      </Field>

      <button
        type="submit"
        disabled={pending || code.length < 6}
        className={cn(
          appPrimaryButtonStudioSubmit,
          "w-full disabled:opacity-50",
        )}
      >
        {pending ? "Verifying…" : "Continue to studio"}
      </button>
    </form>
  );
}
