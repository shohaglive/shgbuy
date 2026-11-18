import { formatPrice } from "@/lib/catalog";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/shipping";

/** Totals block shared by the bag, checkout and order confirmation. */
export function OrderTotals({
  subtotalCents,
  shippingCents,
  totalCents,
}: {
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
}) {
  return (
    <dl className="space-y-3 text-sm">
      <div className="flex justify-between">
        <dt className="text-ink-muted">Subtotal</dt>
        <dd className="price">{formatPrice(subtotalCents)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-ink-muted">Shipping</dt>
        <dd className="price">{shippingCents === 0 ? "Free" : formatPrice(shippingCents)}</dd>
      </div>
      <div className="flex justify-between border-t border-line pt-3 text-base">
        <dt>Total</dt>
        <dd className="price text-base">{formatPrice(totalCents)}</dd>
      </div>
    </dl>
  );
}

export function FreeShippingNote({ subtotalCents }: { subtotalCents: number }) {
  const remaining = FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents;
  if (subtotalCents === 0) return null;
  return (
    <p className="text-sm text-ink-muted">
      {remaining > 0
        ? `Add ${formatPrice(remaining)} more for complimentary shipping.`
        : "Your order qualifies for complimentary shipping."}
    </p>
  );
}
