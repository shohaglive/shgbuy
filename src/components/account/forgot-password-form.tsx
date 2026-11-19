"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type Step = "request" | "reset" | "done";

/** Two steps: ask for a code by email, then enter the code with a new password. */
export function ForgotPasswordForm({ showLocalHint }: { showLocalHint: boolean }) {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function requestCode(address: string) {
    setError(null);
    setNotice(null);
    setPending(true);
    const { error } = await authClient.emailOtp.requestPasswordReset({ email: address });
    setPending(false);
    if (error) {
      setError(error.message ?? "We couldn't send a code. Please try again in a minute.");
      return false;
    }
    setEmail(address);
    setStep("reset");
    setNotice(`If an account exists for ${address}, we've sent it a 6-digit code.`);
    return true;
  }

  async function onRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const address = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    await requestCode(address);
  }

  async function onReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const otp = String(data.get("code") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    if (!/^\d{6}$/.test(otp)) return setError("Enter the 6-digit code.");
    if (password.length < 8) return setError("Your new password needs at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");

    setPending(true);
    const { error } = await authClient.emailOtp.resetPassword({ email, otp, password });
    setPending(false);
    if (error) {
      setError(error.message ?? "That code didn't work. Check it and try again, or request a new one.");
      return;
    }
    setStep("done");
  }

  if (step === "done") {
    return (
      <div className="space-y-6">
        <p role="status" className="border border-line-strong p-4 text-sm">
          Your password has been changed. You&rsquo;ve been signed out everywhere, so sign in with the new one.
        </p>
        <Link href="/account/login" className="btn btn-primary btn-block">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <p role="alert" className="border border-danger p-4 text-sm text-danger">
          {error}
        </p>
      )}
      {notice && step === "reset" && (
        <p role="status" className="border border-line-strong p-4 text-sm">
          {notice}
          {showLocalHint && (
            <span className="mt-2 block text-ink-muted">
              Local mode: the code was printed in the terminal running the app, not emailed.
            </span>
          )}
        </p>
      )}

      {step === "request" ? (
        <form key="request" onSubmit={onRequest} className="space-y-5">
          <div>
            <label htmlFor="email" className="label mb-2 block">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" defaultValue={email} className="field" />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
            {pending ? "Sending..." : "Send reset code"}
          </button>
        </form>
      ) : (
        <form key="reset" onSubmit={onReset} className="space-y-5">
          <div>
            <label htmlFor="code" className="label mb-2 block">6-digit code</label>
            <input
              id="code"
              name="code"
              required
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              autoComplete="one-time-code"
              className="field tracking-[0.4em]"
            />
          </div>
          <div>
            <label htmlFor="password" className="label mb-2 block">New password</label>
            <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="field" />
            <p className="mt-2 text-sm text-ink-muted">At least 8 characters.</p>
          </div>
          <div>
            <label htmlFor="confirm" className="label mb-2 block">Confirm new password</label>
            <input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className="field" />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
            {pending ? "Please wait..." : "Reset password"}
          </button>
          <div className="flex items-center justify-between gap-4 text-sm">
            <button type="button" className="link text-ink-muted hover:text-ink" disabled={pending} onClick={() => requestCode(email)}>
              Send a new code
            </button>
            <button
              type="button"
              className="link text-ink-muted hover:text-ink"
              onClick={() => {
                setStep("request");
                setError(null);
                setNotice(null);
              }}
            >
              Use a different email
            </button>
          </div>
        </form>
      )}

      <p className="text-center text-sm text-ink-muted">
        Remembered it? <Link href="/account/login" className="link text-ink">Back to sign in</Link>
      </p>
    </div>
  );
}
