"use client";

import { useActionState } from "react";
import { placeOrder, type CheckoutState } from "@/app/actions/checkout";
import { COUNTRIES } from "@/lib/countries";

type Defaults = { email: string; name: string };

function Field({
  label,
  name,
  state,
  defaultValue,
  required = true,
  type = "text",
  autoComplete,
  className,
}: {
  label: string;
  name: string;
  state: CheckoutState;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  className?: string;
}) {
  const error = state.fieldErrors?.[name];
  return (
    <div className={className}>
      <label htmlFor={name} className="label mb-2 block">
        {label}
        {!required && <span className="ml-1 normal-case tracking-normal text-ink-subtle">(optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={state.values?.[name] ?? defaultValue ?? ""}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`field ${error ? "border-danger" : ""}`}
      />
      {error && (
        <p id={`${name}-error`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckoutForm({ defaults }: { defaults: Defaults }) {
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(placeOrder, {});

  return (
    <form action={formAction} className="space-y-10" noValidate>
      {state.error && (
        <p role="alert" className="border border-danger p-4 text-sm text-danger">
          {state.error}
        </p>
      )}

      <fieldset className="space-y-5">
        <legend className="mb-5 font-display text-2xl">Contact</legend>
        <Field label="Email" name="email" type="email" autoComplete="email" state={state} defaultValue={defaults.email} />
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-5 font-display text-2xl sm:col-span-2">Shipping address</legend>
        <Field label="Full name" name="name" autoComplete="name" state={state} defaultValue={defaults.name} className="sm:col-span-2" />
        <Field label="Address" name="line1" autoComplete="address-line1" state={state} className="sm:col-span-2" />
        <Field label="Apartment, suite" name="line2" autoComplete="address-line2" state={state} required={false} className="sm:col-span-2" />
        <Field label="City" name="city" autoComplete="address-level2" state={state} />
        <Field label="State / region" name="region" autoComplete="address-level1" state={state} />
        <Field label="Postal code" name="postalCode" autoComplete="postal-code" state={state} />
        <div>
          <label htmlFor="country" className="label mb-2 block">Country</label>
          <select
            id="country"
            name="country"
            required
            autoComplete="country-name"
            defaultValue={state.values?.country ?? "United States"}
            aria-invalid={state.fieldErrors?.country ? true : undefined}
            className="field"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {state.fieldErrors?.country && (
            <p className="mt-2 text-sm text-danger">{state.fieldErrors.country}</p>
          )}
        </div>
        <Field label="Phone" name="phone" type="tel" autoComplete="tel" state={state} required={false} className="sm:col-span-2" />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-5 font-display text-2xl">Payment</legend>
        <p className="bg-surface p-4 text-sm text-ink-muted">
          This is a demo checkout. No payment is taken and no card details are collected or stored.
        </p>
        {/* Decorative only: no `name`, so these are never submitted. */}
        <div className="grid gap-5 opacity-60 sm:grid-cols-2" aria-hidden>
          <div className="sm:col-span-2">
            <span className="label mb-2 block">Card number</span>
            <div className="field flex items-center text-ink-subtle">4242 4242 4242 4242</div>
          </div>
          <div>
            <span className="label mb-2 block">Expiry</span>
            <div className="field flex items-center text-ink-subtle">12 / 30</div>
          </div>
          <div>
            <span className="label mb-2 block">CVC</span>
            <div className="field flex items-center text-ink-subtle">123</div>
          </div>
        </div>
      </fieldset>

      <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
        {pending ? "Placing order..." : "Place order"}
      </button>
    </form>
  );
}
