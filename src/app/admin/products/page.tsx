import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AdminSkeleton } from "@/components/admin/admin-skeleton";
import { PageHeader } from "@/components/admin/page-header";
import { Pagination } from "@/components/admin/pagination";
import { StockIndicator } from "@/components/product/stock-indicator";
import { Badge } from "@/components/ui/badge";
import { PlusIcon } from "@/components/ui/icons";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminProducts, getCategoryOptions, type ProductStatusFilter } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/catalog";

export const metadata: Metadata = { title: "Products" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default function AdminProductsPage({ searchParams }: { searchParams: SP }) {
  return (
    <main id="main">
      <Suspense fallback={<AdminSkeleton />}>
        <Products searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Products({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = first(sp.q).trim();
  const category = Number(first(sp.category)) || undefined;
  const statusRaw = first(sp.status);
  const status: ProductStatusFilter = statusRaw === "archived" || statusRaw === "all" ? statusRaw : "active";
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const [{ rows, hasNext }, categories] = await Promise.all([
    getAdminProducts({ q, categoryId: category, status, page }),
    getCategoryOptions(),
  ]);

  const href = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", String(category));
    if (status !== "active") params.set("status", status);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Products"
        actions={<Link href="/admin/products/new" className="btn btn-primary"><PlusIcon /> New product</Link>}
      />

      <form method="get" className="mb-6 grid gap-3 sm:grid-cols-[minmax(0,2fr)_1fr_1fr_auto]">
        <input name="q" defaultValue={q} placeholder="Search name or slug" aria-label="Search products" className="field" />
        <select name="category" defaultValue={category ? String(category) : ""} aria-label="Category" className="field">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="status" defaultValue={status} aria-label="Status" className="field">
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="all">All</option>
        </select>
        <button type="submit" className="btn btn-secondary">Filter</button>
      </form>

      {rows.length === 0 ? (
        <p className="divider py-12 text-ink-muted">No products match.</p>
      ) : (
        <div className="box-hairline overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr><th className="w-16"><span className="sr-only">Image</span></th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.images[0] && (
                      <div className="media-product w-12">
                        <Image src={p.images[0].src} alt="" fill sizes="48px" className="object-cover" />
                      </div>
                    )}
                  </td>
                  <td>
                    <Link href={`/admin/products/${p.id}`} className="link font-medium">{p.name}</Link>
                    <p className="text-ink-subtle">/{p.slug}</p>
                  </td>
                  <td className="text-ink-muted">{p.category}</td>
                  <td className="price">{formatPrice(p.priceCents)}</td>
                  <td><StockIndicator stock={p.stock} /></td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {p.archivedAt && <Badge tone="danger">Archived</Badge>}
                      {p.isNew && <Badge tone="ink">New</Badge>}
                      {p.isFeatured && <Badge tone="accent">Featured</Badge>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination prevHref={page > 1 ? href(page - 1) : undefined} nextHref={hasNext ? href(page + 1) : undefined} />
    </>
  );
}
