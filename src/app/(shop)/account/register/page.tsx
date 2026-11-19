import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/account/auth-form";
import { GuestOnly } from "@/components/account/guest-only";

export const metadata: Metadata = { title: "Create account" };

export default function Page() {
  return (
    <main id="main">
      <section aria-labelledby="auth-title" className="section">
        <div className="container-prose max-w-md!">
          <p className="eyebrow mb-3">Account</p>
          <h1 id="auth-title">Create your account</h1>
          <p className="mt-4 mb-10 text-ink-muted">Save your details and keep track of your orders.</p>
          <Suspense fallback={<div aria-busy="true" className="h-72 animate-pulse bg-surface" />}>
            <GuestOnly>
              <AuthForm mode="register" />
            </GuestOnly>
          </Suspense>
        </div>
      </section>
    </main>
  );
}
