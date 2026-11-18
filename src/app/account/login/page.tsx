import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/account/auth-form";
import { GuestOnly } from "@/components/account/guest-only";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  return (
    <main id="main">
      <section aria-labelledby="auth-title" className="section">
        <div className="container-prose max-w-md!">
          <p className="eyebrow mb-3">Account</p>
          <h1 id="auth-title">Welcome back</h1>
          <p className="mt-4 mb-10 text-ink-muted">Sign in to view your orders and check out faster.</p>
          <Suspense fallback={<div aria-busy="true" className="h-72 animate-pulse bg-surface" />}>
            <GuestOnly>
              <AuthForm mode="login" />
            </GuestOnly>
          </Suspense>
        </div>
      </section>
    </main>
  );
}
