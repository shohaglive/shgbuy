import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { getLatestProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "New Arrivals",
  description: "The latest pieces to join the collection.",
};

export default function NewArrivalsPage() {
  return (
    <main id="main">
      <div className="container-page pt-6 lg:pt-8">
        <nav aria-label="Breadcrumb" className="label text-ink-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:text-ink">Home</Link></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">New Arrivals</li>
          </ol>
        </nav>
      </div>

      <section aria-labelledby="arrivals-title" className="section">
        <div className="container-page">
          <header className="mb-10 lg:mb-14">
            <p className="eyebrow mb-3">Just in</p>
            <h1 id="arrivals-title">New Arrivals</h1>
            <p className="mt-4 text-ink-muted">
              The latest pieces to join the collection, freshly added and in limited quantities.
            </p>
          </header>

          <Suspense fallback={<ProductGridSkeleton />}>
            <LatestProducts />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

async function LatestProducts() {
  const items = await getLatestProducts();

  if (items.length === 0) {
    return (
      <div className="divider py-16 text-center">
        <p className="mx-auto text-ink-muted">New pieces are on their way. Please check back soon.</p>
        <Link href="/" className="btn btn-secondary mt-6">Back to home</Link>
      </div>
    );
  }

  return (
    <>
      <p className="label mb-6 text-ink-muted">
        {items.length} {items.length === 1 ? "piece" : "pieces"}
      </p>
      <ul className="grid-products">
        {items.map((p) => (
          <li key={p.slug}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </>
  );
}
