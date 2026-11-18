import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { FreeShippingNote, OrderTotals } from "@/components/cart/order-summary";
import { LineControls } from "@/components/cart/line-controls";
import { formatPrice } from "@/lib/catalog";
import { MAX_PER_LINE, getCart } from "@/lib/cart";

export const metadata: Metadata = { title: "Your Bag" };

export default function CartPage() {
  return (
    <main id="main">
      <section aria-labelledby="bag-title" className="section">
        <div className="container-page">
          <h1 id="bag-title" className="mb-10 lg:mb-14">Your Bag</h1>
          <Suspense fallback={<BagSkeleton />}>
            <BagContents />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

function BagSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
      <div className="space-y-6">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="aspect-[4/5] w-24 animate-pulse bg-surface sm:w-32" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-1/2 bg-surface" />
              <div className="h-4 w-1/4 bg-surface" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-48 animate-pulse bg-surface" />
    </div>
  );
}

async function BagContents() {
  const cart = await getCart();

  if (cart.lines.length === 0) {
    return (
      <div className="divider py-16 text-center">
        <p className="mx-auto text-ink-muted">Your bag is empty.</p>
        <Link href="/collections/new-arrivals" className="btn btn-primary mt-6">
          Shop new arrivals
        </Link>
      </div>
    );
  }

  const hasStockIssue = cart.lines.some((l) => l.quantity > l.stock);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start lg:gap-16">
      <ul className="divide-y divide-line border-y border-line">
        {cart.lines.map((line) => {
          const max = Math.min(line.stock, MAX_PER_LINE);
          return (
            <li key={line.id} className="flex gap-4 py-6 sm:gap-6">
              <Link href={`/products/${line.slug}`} className="media-product block w-24 shrink-0 sm:w-32">
                <Image src={line.image} alt={line.name} fill sizes="128px" className="object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="eyebrow">{line.category}</p>
                    <h2 className="mt-1 font-sans! text-sm! font-medium tracking-normal!">
                      <Link href={`/products/${line.slug}`} className="hover:underline underline-offset-4">
                        {line.name}
                      </Link>
                    </h2>
                    {line.size && <p className="mt-1 text-sm text-ink-muted">Size: {line.size}</p>}
                  </div>
                  <p className="price shrink-0">{formatPrice(line.lineTotalCents)}</p>
                </div>
                {line.quantity > line.stock && (
                  <p role="alert" className="mt-2 text-sm text-danger">
                    {line.stock === 0 ? "This item is now sold out." : `Only ${line.stock} left in stock.`}
                  </p>
                )}
                <LineControls itemId={line.id} quantity={line.quantity} max={Math.max(max, 1)} />
              </div>
            </li>
          );
        })}
      </ul>

      <aside aria-label="Order summary" className="bg-surface p-6 lg:sticky lg:top-28">
        <h2 className="mb-6 text-2xl">Summary</h2>
        <OrderTotals
          subtotalCents={cart.subtotalCents}
          shippingCents={cart.shippingCents}
          totalCents={cart.totalCents}
        />
        <div className="mt-4">
          <FreeShippingNote subtotalCents={cart.subtotalCents} />
        </div>
        {hasStockIssue ? (
          <button type="button" className="btn btn-primary btn-block mt-6" disabled>
            Update your bag to continue
          </button>
        ) : (
          <Link href="/checkout" className="btn btn-primary btn-block mt-6">
            Checkout
          </Link>
        )}
        <Link href="/collections/new-arrivals" className="btn btn-ghost mt-4 w-full">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
