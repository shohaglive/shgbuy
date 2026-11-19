import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OrderTotals } from "@/components/cart/order-summary";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { formatPrice } from "@/lib/catalog";
import { getCart, getSessionUser } from "@/lib/cart";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <main id="main">
      <section aria-labelledby="checkout-title" className="section">
        <div className="container-page">
          <h1 id="checkout-title" className="mb-10 lg:mb-14">Checkout</h1>
          <Suspense fallback={<div aria-busy="true" className="h-96 animate-pulse bg-surface" />}>
            <CheckoutContents />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

async function CheckoutContents() {
  const [cart, user] = await Promise.all([getCart(), getSessionUser()]);
  if (cart.lines.length === 0) redirect("/cart");

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start lg:gap-20">
      <CheckoutForm defaults={{ email: user?.email ?? "", name: user?.name ?? "" }} />

      <aside aria-label="Order summary" className="bg-surface p-6 lg:sticky lg:top-28">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-2xl">Order summary</h2>
          <Link href="/cart" className="link text-sm text-ink-muted hover:text-ink">Edit bag</Link>
        </div>
        <ul className="mb-6 divide-y divide-line">
          {cart.lines.map((l) => (
            <li key={l.id} className="flex gap-4 py-4 first:pt-0">
              <div className="media-product w-16 shrink-0">
                <Image src={l.image} alt={l.name} fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium">{l.name}</p>
                <p className="text-ink-muted">
                  {l.size ? `Size ${l.size} · ` : ""}Qty {l.quantity}
                </p>
              </div>
              <p className="price text-sm">{formatPrice(l.lineTotalCents)}</p>
            </li>
          ))}
        </ul>
        <OrderTotals
          subtotalCents={cart.subtotalCents}
          shippingCents={cart.shippingCents}
          totalCents={cart.totalCents}
        />
      </aside>
    </div>
  );
}
