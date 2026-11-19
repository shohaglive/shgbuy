import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminSkeleton } from "@/components/admin/admin-skeleton";
import { PageHeader } from "@/components/admin/page-header";
import { Pagination } from "@/components/admin/pagination";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminOrders, type OrderStatusFilter } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/catalog";
import { formatDateTime } from "@/lib/format";
import { ORDER_STATUSES, ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/lib/order-status";

export const metadata: Metadata = { title: "Orders" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default function AdminOrdersPage({ searchParams }: { searchParams: SP }) {
  return (
    <main id="main">
      <Suspense fallback={<AdminSkeleton />}>
        <Orders searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Orders({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = first(sp.q).trim();
  const statusRaw = first(sp.status);
  const status: OrderStatusFilter = (ORDER_STATUSES as string[]).includes(statusRaw) ? (statusRaw as OrderStatusFilter) : "all";
  const cursor = first(sp.cursor) || undefined;

  const { rows, nextCursor } = await getAdminOrders({ status, q, cursor });

  const href = (c?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status !== "all") params.set("status", status);
    if (c) params.set("cursor", c);
    const qs = params.toString();
    return `/admin/orders${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Orders" />

      <form method="get" className="mb-6 grid gap-3 sm:grid-cols-[minmax(0,2fr)_1fr_auto]">
        <input name="q" defaultValue={q} placeholder="Search order number or email" aria-label="Search orders" className="field" />
        <select name="status" defaultValue={status} aria-label="Status" className="field">
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>)}
        </select>
        <button type="submit" className="btn btn-secondary">Filter</button>
      </form>

      {rows.length === 0 ? (
        <p className="divider py-12 text-ink-muted">No orders match.</p>
      ) : (
        <div className="box-hairline overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr><th>Order</th><th>Placed</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id}>
                  <td><Link href={`/admin/orders/${o.orderNumber}`} className="link font-medium">{o.orderNumber}</Link></td>
                  <td className="whitespace-nowrap text-ink-muted">{formatDateTime(o.createdAt)}</td>
                  <td>
                    {o.shipName}
                    <p className="text-ink-subtle">{o.email}{o.isGuest && " · guest"}</p>
                  </td>
                  <td>{o.units}</td>
                  <td className="price">{formatPrice(o.totalCents)}</td>
                  <td><Badge tone={ORDER_STATUS_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination prevHref={cursor ? href() : undefined} nextHref={nextCursor ? href(nextCursor) : undefined} />
    </>
  );
}
