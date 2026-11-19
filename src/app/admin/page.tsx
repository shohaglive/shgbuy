import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminSkeleton } from "@/components/admin/admin-skeleton";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin-auth";
import { getDashboard } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/catalog";
import { formatDateTime } from "@/lib/format";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/lib/order-status";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return (
    <main id="main">
      <Suspense fallback={<AdminSkeleton />}>
        <Dashboard />
      </Suspense>
    </main>
  );
}

function Stat({ label, value, href, note }: { label: string; value: string | number; href?: string; note?: string }) {
  const body = (
    <div className="box-hairline h-full p-5">
      <p className="eyebrow">{label}</p>
      <p className="mt-3 font-display text-4xl">{value}</p>
      {note && <p className="mt-1 text-sm text-ink-muted">{note}</p>}
    </div>
  );
  return href ? (
    <Link href={href} className="block hover:bg-surface">{body}</Link>
  ) : (
    body
  );
}

async function Dashboard() {
  await requireAdmin();
  const d = await getDashboard();

  return (
    <>
      <PageHeader title="Dashboard" />
      <section aria-label="Overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Awaiting shipment" value={d.awaiting} href="/admin/orders?status=confirmed" note="Confirmed orders" />
        <Stat label="Last 7 days" value={d.weekOrders} href="/admin/orders" note={`${formatPrice(d.weekRevenue)} in orders`} />
        <Stat label="Low stock" value={d.low} href="/admin/stock" note="5 units or fewer" />
        <Stat label="Sold out" value={d.out} href="/admin/stock" note="Active products at zero" />
      </section>

      <section aria-labelledby="recent-title" className="mt-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 id="recent-title" className="text-2xl">Recent orders</h2>
          <Link href="/admin/orders" className="link text-sm">View all</Link>
        </div>
        {d.recent.length === 0 ? (
          <p className="divider py-10 text-ink-muted">No orders yet.</p>
        ) : (
          <div className="box-hairline overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Placed</th><th>Total</th><th>Status</th></tr>
              </thead>
              <tbody>
                {d.recent.map((o) => (
                  <tr key={o.orderNumber}>
                    <td><Link href={`/admin/orders/${o.orderNumber}`} className="link font-medium">{o.orderNumber}</Link></td>
                    <td>{o.shipName}</td>
                    <td className="whitespace-nowrap text-ink-muted">{formatDateTime(o.createdAt)}</td>
                    <td className="price">{formatPrice(o.totalCents)}</td>
                    <td><Badge tone={ORDER_STATUS_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-10 text-sm text-ink-muted">
        {d.active} active product{d.active === 1 ? "" : "s"}, {d.archived} archived.{" "}
        <Link href="/admin/products" className="link text-ink">Manage products</Link>
      </p>
    </>
  );
}
