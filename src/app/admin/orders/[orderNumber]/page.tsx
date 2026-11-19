import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminSkeleton } from "@/components/admin/admin-skeleton";
import { OrderActions } from "@/components/admin/order-actions";
import { PageHeader } from "@/components/admin/page-header";
import { OrderTotals } from "@/components/cart/order-summary";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminOrder } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/catalog";
import { formatDateTime } from "@/lib/format";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/lib/order-status";

export const metadata: Metadata = { title: "Order" };

type Props = { params: Promise<{ orderNumber: string }> };

export default function AdminOrderPage({ params }: Props) {
  return (
    <main id="main">
      <Suspense fallback={<AdminSkeleton />}>
        <OrderDetail params={params} />
      </Suspense>
    </main>
  );
}

async function OrderDetail({ params }: Props) {
  await requireAdmin();
  const { orderNumber } = await params;
  const order = await getAdminOrder(orderNumber);
  if (!order) notFound();

  return (
    <>
      <PageHeader
        title={order.orderNumber}
        actions={<Link href="/admin/orders" className="btn btn-secondary">Back to orders</Link>}
      >
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
          <Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
          Placed {formatDateTime(order.createdAt)}
        </div>
      </PageHeader>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-10">
          <section aria-labelledby="items-title">
            <h2 id="items-title" className="mb-4 text-2xl">Items</h2>
            <div className="box-hairline overflow-x-auto">
              <table className="admin-table">
                <thead><tr><th className="w-16"><span className="sr-only">Image</span></th><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
                <tbody>
                  {order.items.map((i) => (
                    <tr key={i.id}>
                      <td>
                        <div className="media-product w-12">
                          <Image src={i.imageSrc} alt="" fill sizes="48px" className="object-cover" />
                        </div>
                      </td>
                      <td>
                        {i.productId ? <Link href={`/admin/products/${i.productId}`} className="link">{i.name}</Link> : i.name}
                        {i.size && <p className="text-ink-subtle">Size {i.size}</p>}
                        {!i.productId && <p className="text-ink-subtle">(product deleted)</p>}
                      </td>
                      <td>{i.quantity}</td>
                      <td className="price">{formatPrice(i.unitPriceCents)}</td>
                      <td className="price">{formatPrice(i.unitPriceCents * i.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="history-title">
            <h2 id="history-title" className="mb-4 text-2xl">History</h2>
            {order.events.length === 0 ? (
              <p className="text-sm text-ink-muted">No recorded events (this order predates the history log).</p>
            ) : (
              <ol className="divide-y divide-line border-y border-line text-sm">
                {order.events.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
                    <span>
                      {e.fromStatus === null
                        ? "Order placed"
                        : `${ORDER_STATUS_LABEL[e.fromStatus as keyof typeof ORDER_STATUS_LABEL] ?? e.fromStatus} → ${ORDER_STATUS_LABEL[e.toStatus as keyof typeof ORDER_STATUS_LABEL] ?? e.toStatus}`}
                      {e.actorName && <span className="text-ink-subtle"> · {e.actorName}</span>}
                    </span>
                    <span className="text-ink-muted">{formatDateTime(e.createdAt)}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="space-y-8 self-start">
          <section className="bg-surface p-6">
            <h2 className="mb-4 text-2xl">Fulfilment</h2>
            <OrderActions orderId={order.id} orderNumber={order.orderNumber} status={order.status} />
          </section>

          <section className="bg-surface p-6">
            <h2 className="mb-4 text-2xl">Totals</h2>
            <OrderTotals subtotalCents={order.subtotalCents} shippingCents={order.shippingCents} totalCents={order.totalCents} />
            <p className="mt-4 text-xs text-ink-subtle">Demo checkout: no payment was taken.</p>
          </section>

          <section>
            <h2 className="eyebrow mb-3">Customer</h2>
            <p className="text-sm">{order.customerName ?? order.shipName}</p>
            <p className="text-sm text-ink-muted">{order.email}</p>
            <p className="mt-1 text-xs text-ink-subtle">{order.userId ? "Signed-in account" : "Guest checkout"}</p>
            <h2 className="eyebrow mb-3 mt-8">Ship to</h2>
            <address className="text-sm not-italic leading-relaxed text-ink-muted">
              {order.shipName}<br />
              {order.shipLine1}<br />
              {order.shipLine2 && <>{order.shipLine2}<br /></>}
              {order.shipCity}, {order.shipRegion} {order.shipPostalCode}<br />
              {order.shipCountry}
              {order.shipPhone && <><br />{order.shipPhone}</>}
            </address>
          </section>
        </aside>
      </div>
    </>
  );
}
