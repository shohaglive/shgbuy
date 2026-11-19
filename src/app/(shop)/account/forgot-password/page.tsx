import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/account/forgot-password-form";
import { GuestOnly } from "@/components/account/guest-only";
import { isLocalEnv } from "@/lib/env";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <main id="main">
      <section aria-labelledby="auth-title" className="section">
        <div className="container-prose max-w-md!">
          <p className="eyebrow mb-3">Account</p>
          <h1 id="auth-title">Reset your password</h1>
          <p className="mt-4 mb-10 text-ink-muted">
            Enter your email and we&rsquo;ll send a 6-digit code to set a new password.
          </p>
          <Suspense fallback={<div aria-busy="true" className="h-72 animate-pulse bg-surface" />}>
            <ForgotPassword />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

// APP_ENV is read per request (not baked in at build time).
async function ForgotPassword() {
  await connection();
  return (
    <GuestOnly>
      <ForgotPasswordForm showLocalHint={isLocalEnv()} />
    </GuestOnly>
  );
}
