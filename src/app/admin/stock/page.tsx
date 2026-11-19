import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { adjustStock, setStock } from "@/app/actions/admin/stock";
import { ActionForm } from "@/components/admin/action-form";
import { AdminSkeleton } from "@/components/admin/admin-skeleton";
import { PageHeader } from "@/components/admin/page-header";
import { Pagination } from "@/components/admin/pagination";
import { SubmitButton } from "@/components/admin/submit-button";
import { StockIndicator } from "@/components/product/stock-indicator";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin-auth";
import { getRecentMovements, getStockList } from "@/lib/admin/queries";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Stock" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default function AdminStockPage({ searchParams }: { searchParams: SP }) {
  return (
    <main id="main">
      <Suspense fallback={<AdminSkeleton />}>
        <Stock searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Stock({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = first(sp.q).trim();
  const page = Math.max(1, Number(first(sp.page)) || 1);
  const [{ rows, hasNext }, movements] = await Promise.all([getStockList({ q, page }), getRecentMovements(15)]);

  const href = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/stock${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Stock" />
      <p className="mb-6 max-w-2xl text-sm text-ink-muted">
        <strong className="font-medium text-ink">Adjust</strong> adds or removes units and is safe while customers are buying.{" "}
        <strong className="font-medium text-ink">Set</strong> is for a stocktake: it refuses to save if the quantity changed since you opened this page.
      </p>

      <form method="get" className="mb-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input name="q" defaultValue={q} placeholder="Search name or slug" aria-label="Search products" className="field" />
        <button type="submit" className="btn btn-secondary">Search</button>
      </form>

      {rows.length === 0 ? (
        <p className="divider py-12 text-ink-muted">No products match.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((p) => (
            <li key={p.id} className="box-hairline p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link href={`/admin/products/${p.id}`} className="link font-medium">{p.name}</Link>
                  <p className="text-sm text-ink-subtle">/{p.slug}</p>
                </div>
                <div className="flex items-center gap-4">
                  {p.archivedAt && <Badge tone="danger">Archived</Badge>}
                  <span className="font-display text-3xl">{p.quantity}</span>
                  <StockIndicator stock={p.quantity} />
                </div>
              </div>
              <div className="grid gap-6 border-t border-line pt-4 lg:grid-cols-2">
                <ActionForm action={adjustStock} fields={{ productId: p.id }}>
                  <p className="label mb-2">Adjust</p>
                  <div className="grid gap-2 sm:grid-cols-[6rem_1fr_auto]">
                    <input name="delta" type="number" step="1" required placeholder="+10 / -2" aria-label={`Units to add or remove for ${p.name}`} className="field" />
                    <select name="reason" aria-label="Reason" className="field" defaultValue="restock">
                      <option value="restock">Restock</option>
                      <option value="correction">Correction</option>
                    </select>
                    <SubmitButton className="btn btn-secondary" pendingLabel="...">Apply</SubmitButton>
                  </div>
                  <input name="note" placeholder="Note (optional)" aria-label="Note" className="field mt-2" maxLength={200} />
                </ActionForm>
                <ActionForm action={setStock} fields={{ productId: p.id, expected: p.quantity }}>
                  <p className="label mb-2">Set to (stocktake)</p>
                  <div className="grid gap-2 sm:grid-cols-[6rem_auto]">
                    <input key={p.quantity} name="quantity" type="number" min="0" step="1" required defaultValue={p.quantity} aria-label={`Counted quantity for ${p.name}`} className="field" />
                    <SubmitButton className="btn btn-secondary" pendingLabel="...">Set</SubmitButton>
                  </div>
                </ActionForm>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pagination prevHref={page > 1 ? href(page - 1) : undefined} nextHref={hasNext ? href(page + 1) : undefined} />

      <section aria-labelledby="movements-title" className="mt-14">
        <h2 id="movements-title" className="mb-4 text-2xl">Recent stock movements</h2>
        {movements.length === 0 ? (
          <p className="divider py-8 text-ink-muted">Nothing yet.</p>
        ) : (
          <div className="box-hairline overflow-x-auto">
            <table className="admin-table">
              <thead><tr><th>When</th><th>Product</th><th>Change</th><th>Reason</th><th>By</th></tr></thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td className="whitespace-nowrap text-ink-muted">{formatDateTime(m.createdAt)}</td>
                    <td>{m.productName ?? <span className="text-ink-subtle">(deleted product)</span>}</td>
                    <td className={`price ${m.delta < 0 ? "text-danger" : ""}`}>{m.delta > 0 ? `+${m.delta}` : m.delta}</td>
                    <td>
                      <span className="capitalize">{m.reason}</span>
                      {m.orderNumber && <span className="text-ink-subtle"> · {m.orderNumber}</span>}
                      {m.note && <p className="text-ink-subtle">{m.note}</p>}
                    </td>
                    <td className="text-ink-muted">{m.actorName ?? "System"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
