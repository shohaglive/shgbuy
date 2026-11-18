"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { mergeGuestCart } from "@/app/actions/cart";
import { authClient } from "@/lib/auth-client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isRegister = mode === "register";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const name = String(data.get("name") ?? "").trim();

    setPending(true);
    const { error } = isRegister
      ? await authClient.signUp.email({ name, email, password })
      : await authClient.signIn.email({ email, password });

    if (error) {
      setPending(false);
      setError(error.message ?? "Something went wrong. Please try again.");
      return;
    }
    // Fold any guest bag into the account, then show the account.
    await mergeGuestCart();
    router.push("/account");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <p role="alert" className="border border-danger p-4 text-sm text-danger">
          {error}
        </p>
      )}
      {isRegister && (
        <div>
          <label htmlFor="name" className="label mb-2 block">Full name</label>
          <input id="name" name="name" required minLength={2} autoComplete="name" className="field" />
        </div>
      )}
      <div>
        <label htmlFor="email" className="label mb-2 block">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="field" />
      </div>
      <div>
        <label htmlFor="password" className="label mb-2 block">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={isRegister ? 8 : undefined}
          autoComplete={isRegister ? "new-password" : "current-password"}
          className="field"
        />
        {isRegister && <p className="mt-2 text-sm text-ink-muted">At least 8 characters.</p>}
      </div>
      <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
        {pending ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
      </button>
      <p className="text-center text-sm text-ink-muted">
        {isRegister ? (
          <>Already have an account? <Link href="/account/login" className="link text-ink">Sign in</Link></>
        ) : (
          <>New to shgbuy? <Link href="/account/register" className="link text-ink">Create an account</Link></>
        )}
      </p>
    </form>
  );
}
