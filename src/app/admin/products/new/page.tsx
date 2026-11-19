import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminSkeleton } from "@/components/admin/admin-skeleton";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/admin-auth";
import { getCategoryOptions } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <main id="main">
      <Suspense fallback={<AdminSkeleton />}>
        <NewProduct />
      </Suspense>
    </main>
  );
}

async function NewProduct() {
  await requireAdmin();
  const categories = await getCategoryOptions();
  return (
    <>
      <PageHeader title="New product" actions={<Link href="/admin/products" className="btn btn-secondary">Back to products</Link>} />
      {categories.length === 0 ? (
        <p className="divider py-10 text-ink-muted">
          Create a category first. <Link href="/admin/categories" className="link text-ink">Go to categories</Link>
        </p>
      ) : (
        <div className="max-w-3xl"><ProductForm categories={categories} /></div>
      )}
    </>
  );
}
