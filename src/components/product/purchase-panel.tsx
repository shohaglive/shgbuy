"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { addToCart } from "@/app/actions/cart";
import { getStockStatus } from "@/lib/catalog";
import type { Product } from "@/lib/products";

export function PurchasePanel({ product }: { product: Product }) {
  const status = getStockStatus(product.stock);
  const soldOut = status === "out-of-stock";
  const [size, setSize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  const sizes = product.sizes ?? [];
  const needsSize = sizes.length > 0;

  function addToBag() {
    if (needsSize && !size) {
      setError("Please select a size.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await addToCart(product.id, size);
      if (result.ok) setAdded(true);
      else setError(result.error);
    });
  }

  return (
    <div className="space-y-6">
      {needsSize && (
        <fieldset disabled={soldOut}>
          <legend className="label mb-3 flex w-full justify-between">
            <span>Size{size ? `: ${size}` : ""}</span>
            <Link href="/help/size-guide" className="link normal-case tracking-normal text-ink-muted">
              Size guide
            </Link>
          </legend>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6">
            {sizes.map((s) => (
              <label key={s} className="relative">
                <input
                  type="radio"
                  name="size"
                  value={s}
                  checked={size === s}
                  onChange={() => {
                    setSize(s);
                    setError(null);
                    setAdded(false);
                  }}
                  className="peer sr-only"
                />
                <span className="flex min-h-12 cursor-pointer items-center justify-center border border-line text-sm transition-colors hover:border-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-canvas peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-40">
                  {s}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <button
        type="button"
        className="btn btn-primary btn-block"
        disabled={soldOut || pending}
        onClick={addToBag}
      >
        {soldOut ? "Sold out" : pending ? "Adding..." : "Add to bag"}
      </button>

      <div className="min-h-6 text-sm" aria-live="polite">
        {error && (
          <p role="alert" className="text-danger">
            {error}
          </p>
        )}
        {added && !error && (
          <p className="text-ink-muted">
            Added to your bag{size ? ` (size ${size})` : ""}.{" "}
            <Link href="/cart" className="link text-ink">
              View bag
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
