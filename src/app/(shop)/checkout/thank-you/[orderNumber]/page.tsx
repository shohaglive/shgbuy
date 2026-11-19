import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OrderTotals } from "@/components/cart/order-summary";
import { formatPrice } from "@/lib/catalog";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import { getOrderByNumber } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false },
};

export default function ThankYouPage({ params }: PageProps<"/checkout/thank-you/[orderNumber]">) {
  return (
    <main id="main">
      <section aria-labelledby="thanks-title" className="section">
        <div className="container-page">
          <Suspense fallback={<div aria-busy="true" className="h-96 animate-pulse bg-surface" />}>
            <Confirmation params={params} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

async function Confirmation({ params }: Pick<PageProps<"/checkout/thank-you/[orderNumber]">, "params">) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  return (
    <>
      <header className="mb-12 max-w-2xl lg:mb-16">
        <p className="eyebrow mb-3">{ORDER_STATUS_LABEL[order.status] === "Confirmed" ? "Order confirmed" : `Order ${ORDER_STATUS_LABEL[order.status].toLowerCase()}`}</p>
        <h1 id="thanks-title">{order.status === "cancelled" ? "This order was cancelled" : "Thank you for your order"}</h1>
        <p className="mt-4 text-ink-muted">
          Your order <span className="font-medium text-ink">{order.orderNumber}</span>{" "}
          {order.status === "confirmed" && "has been placed. This is a demo store, so no confirmation email is sent and nothing will ship."}
          {order.status === "shipped" && "has been marked as shipped. This is a demo store, so nothing is actually in transit."}
          {order.status === "delivered" && "has been marked as delivered."}
          {order.status === "cancelled" && "was cancelled and the items were returned to stock."}
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <h2 className="mb-6 text-2xl">Items</h2>
          <ul className="divide-y divide-line border-y border-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-5">
                <div className="media-product w-20 shrink-0">
                  <Image src={item.imageSrc} alt={item.name} fill sizes="80px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-ink-muted">
                    {item.size ? `Size ${item.size} · ` : ""}Qty {item.quantity}
                  </p>
                </div>
                <p className="price text-sm">{formatPrice(item.unitPriceCents * item.quantity)}</p>
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-8">
          <div className="bg-surface p-6">
            <h2 className="mb-6 text-2xl">Summary</h2>
            <OrderTotals
              subtotalCents={order.subtotalCents}
              shippingCents={order.shippingCents}
              totalCents={order.totalCents}
            />
          </div>
          <div>
            <h2 className="eyebrow mb-3">Shipping to</h2>
            <address className="text-sm not-italic leading-relaxed text-ink-muted">
              {order.shipName}
              <br />
              {order.shipLine1}
              {order.shipLine2 && (<><br />{order.shipLine2}</>)}
              <br />
              {order.shipCity}, {order.shipRegion} {order.shipPostalCode}
              <br />
              {order.shipCountry}
            </address>
            <p className="mt-4 text-sm text-ink-muted">Confirmation for {order.email}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/collections/new-arrivals" className="btn btn-primary">Continue shopping</Link>
            <Link href="/account" className="btn btn-secondary">View account</Link>
          </div>
        </aside>
      </div>
    </>
  );
}
