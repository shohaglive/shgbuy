import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminSkeleton } from "@/components/admin/admin-skeleton";
import { PageHeader } from "@/components/admin/page-header";
import { PlusIcon } from "@/components/ui/icons";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminCollections } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Collections" };

export default function AdminCollectionsPage() {
  return (
    <main id="main">
      <Suspense fallback={<AdminSkeleton />}>
        <Collections />
      </Suspense>
    </main>
  );
}

async function Collections() {
  await requireAdmin();
  const rows = await getAdminCollections();
  return (
    <>
      <PageHeader
        title="Collections"
        actions={<Link href="/admin/collections/new" className="btn btn-primary"><PlusIcon /> New collection</Link>}
      />
      <p className="mb-6 max-w-2xl text-sm text-ink-muted">
        Collections are the curated groups on the homepage and at /collections/&lt;slug&gt; (Women, Men, Accessories).
        Categories group products by type and live under Categories.
      </p>
      {rows.length === 0 ? (
        <p className="divider py-12 text-ink-muted">No collections yet.</p>
      ) : (
        <div className="box-hairline overflow-x-auto">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Slug</th><th>Products</th><th>Order</th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/admin/collections/${c.id}`} className="link font-medium">{c.name}</Link>
                    <p className="text-ink-subtle">{c.blurb}</p>
                  </td>
                  <td className="text-ink-muted">/{c.slug}</td>
                  <td>{c.productCount}</td>
                  <td>{c.sortOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
