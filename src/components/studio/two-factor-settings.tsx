"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import QRCode from "react-qr-code";
import { appToast } from "~/lib/app-toast";
import { StudioCard, StudioInput } from "~/components/studio/ui";
import {
  disableTwoFactor,
  enableTwoFactor,
  getTwoFactorSetup,
  resetTwoFactorSetup,
} from "~/server/auth/two-factor-actions";

type SetupState = {
  secret: string;
  uri: string;
  email: string;
};

function formatSecretCompact(secret: string): string {
  const groups = secret.match(/.{1,4}/g) ?? [secret];
  return groups.join(" ");
}

export function TwoFactorSettings({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [setup, setSetup] = useState<SetupState | null>(null);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);

  async function startSetup(regenerate = false) {
    setPending(true);
    if (regenerate) {
      await resetTwoFactorSetup();
    }
    const next = await getTwoFactorSetup();
    setPending(false);
    if (!next) {
      appToast.error("Could not start 2FA setup.");
      return;
    }
    setSetup(next);
    setCode("");
  }

  async function copySecret() {
    if (!setup) return;
    try {
      await navigator.clipboard.writeText(setup.secret);
      appToast.success("Secret copied (no spaces).");
    } catch {
      appToast.error("Could not copy to clipboard.");
    }
  }

  async function confirmEnable() {
    if (!setup) return;
    setPending(true);
    const result = await enableTwoFactor(setup.secret, code);
    setPending(false);
    if (!result.ok) {
      appToast.error("Invalid code. Check your authenticator and try again.");
      return;
    }
    appToast.success("Two-factor authentication enabled.");
    setSetup(null);
    setCode("");
    window.location.reload();
  }

  async function confirmDisable() {
    setPending(true);
    const result = await disableTwoFactor(code);
    setPending(false);
    if (!result.ok) {
      appToast.error("Invalid code.");
      return;
    }
    appToast.success("Two-factor authentication disabled.");
    setCode("");
    router.refresh();
  }

  return (
    <StudioCard
      title="Two-factor authentication (founders)"
      description="Require an authenticator app code when accessing the studio."
    >
      {enabled ? (
        <div className="space-y-3">
          <p className="text-sm text-[#2e7d32]">
            2FA is enabled for your account.
          </p>
          <StudioInput
            placeholder="6-digit code to disable"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          />
          <button
            type="button"
            disabled={pending || code.length < 6}
            onClick={() => void confirmDisable()}
            className="rounded-md bg-[#9a3b2e] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase hover:bg-[#7a2f24] disabled:opacity-50"
          >
            Disable 2FA
          </button>
        </div>
      ) : setup ? (
        <div className="space-y-4">
          <p className="text-sm text-[#57524a]">
            Scan the QR{" "}
            <strong className="font-semibold text-[#15130f]">or</strong> enter
            the key manually — use one method only. The QR and the key below are
            the same secret. The 6-digit codes change every 30 seconds; compare
            codes only within the same app entry.
          </p>
          <p className="text-xs text-[#6f6a60]">
            Account:{" "}
            <span className="font-medium text-[#15130f]">{setup.email}</span>
          </p>

          <div className="mx-auto w-fit rounded-lg border border-[#15130f]/12 bg-white p-4 shadow-[0_2px_12px_rgba(21,19,15,0.08)]">
            <QRCode
              value={setup.uri}
              size={200}
              level="M"
              bgColor="#ffffff"
              fgColor="#15130f"
              title="Scan to set up two-factor authentication"
            />
          </div>

          <details className="rounded-md bg-[#f7f5f0] p-3 text-sm text-[#57524a]">
            <summary className="cursor-pointer text-xs font-semibold text-[#15130f]">
              Can&apos;t scan? Enter this key in the app
            </summary>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="max-w-full font-mono text-[10px] leading-snug tracking-tight break-all text-[#15130f]">
                {formatSecretCompact(setup.secret)}
              </code>
              <button
                type="button"
                onClick={() => void copySecret()}
                className="hover:bg-sc-section-alt/80 shrink-0 rounded border border-[#15130f]/15 bg-white px-2 py-1 text-[9px] font-bold tracking-[0.12em] text-[#15130f] uppercase"
              >
                Copy
              </button>
            </div>
          </details>

          <button
            type="button"
            disabled={pending}
            onClick={() => void startSetup(true)}
            className="text-[10px] font-semibold text-[#6f6a60] underline-offset-2 hover:text-[#15130f] hover:underline disabled:opacity-50"
          >
            Generate a new QR / key (removes the previous unfinished setup)
          </button>

          <div className="space-y-2">
            <p className="text-xs text-[#6f6a60]">
              Enter the 6-digit code from the app to finish setup.
            </p>
            <StudioInput
              placeholder="6-digit code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, ""))
              }
            />
          </div>

          <button
            type="button"
            disabled={pending || code.length < 6}
            onClick={() => void confirmEnable()}
            className="hover:bg-sc-accent rounded-md bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase disabled:opacity-50"
          >
            Confirm and enable
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => void startSetup()}
          className="hover:bg-sc-accent rounded-md bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase"
        >
          Set up authenticator
        </button>
      )}
    </StudioCard>
  );
}
