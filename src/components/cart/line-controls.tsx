"use client";

import { useState, useTransition } from "react";
import { removeCartItem, updateCartItem } from "@/app/actions/cart";

/** Quantity stepper and remove button for one bag line. */
export function LineControls({
  itemId,
  quantity,
  max,
}: {
  itemId: number;
  quantity: number;
  max: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function change(next: number) {
    setError(null);
    startTransition(async () => {
      const result = next < 1 ? await removeCartItem(itemId) : await updateCartItem(itemId, next);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2" aria-busy={pending}>
      <div className="inline-flex items-center border border-line" role="group" aria-label="Quantity">
        <button
          type="button"
          className="size-10 text-lg hover:bg-surface disabled:opacity-40"
          aria-label="Decrease quantity"
          disabled={pending || quantity <= 1}
          onClick={() => change(quantity - 1)}
        >
          −
        </button>
        <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          className="size-10 text-lg hover:bg-surface disabled:opacity-40"
          aria-label="Increase quantity"
          disabled={pending || quantity >= max}
          onClick={() => change(quantity + 1)}
        >
          +
        </button>
      </div>
      <button
        type="button"
        className="link text-sm text-ink-muted hover:text-ink"
        disabled={pending}
        onClick={() => change(0)}
      >
        Remove
      </button>
      {error && (
        <p role="alert" className="w-full text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
