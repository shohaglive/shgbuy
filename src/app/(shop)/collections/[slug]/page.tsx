import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { getAllCollectionPageSlugs, getCollectionPage } from "@/lib/products";

export async function generateStaticParams() {
  const slugs = await getAllCollectionPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCollectionPage(slug);
  if (!page) return {};
  return {
    title: page.name,
    description: page.blurb ?? `Shop ${page.name.toLowerCase()} from the shgbuy collection.`,
  };
}

// The page never awaits `params` itself; it is passed into a <Suspense> boundary
// so the static shell stays URL-independent and navigation can be instant.
export default function CategoryPage({ params }: PageProps<"/collections/[slug]">) {
  return (
    <main id="main">
      <Suspense fallback={<CategorySkeleton />}>
        <CategoryContent params={params} />
      </Suspense>
    </main>
  );
}

function CategorySkeleton() {
  return (
    <div className="container-page py-14" aria-busy="true">
      <div className="mb-10 space-y-4">
        <div className="h-3 w-24 bg-surface" />
        <div className="h-12 w-64 bg-surface" />
      </div>
      <ProductGridSkeleton count={4} />
    </div>
  );
}

async function CategoryContent({ params }: Pick<PageProps<"/collections/[slug]">, "params">) {
  const { slug } = await params;
  const category = await getCollectionPage(slug);
  if (!category) notFound();

  const { products } = category;

  return (
    <>
      <div className="container-page pt-6 lg:pt-8">
        <nav aria-label="Breadcrumb" className="label text-ink-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:text-ink">Home</Link></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">{category.name}</li>
          </ol>
        </nav>
      </div>

      <section aria-labelledby="category-title" className="section">
        <div className="container-page">
          <header className="mb-10 lg:mb-14">
            <p className="eyebrow mb-3">Collection</p>
            <h1 id="category-title">{category.name}</h1>
            {category.blurb && <p className="mt-4 text-ink-muted">{category.blurb}</p>}
          </header>

          {products.length === 0 ? (
            <div className="divider py-16 text-center">
              <p className="mx-auto text-ink-muted">Nothing here yet. Please check back soon.</p>
              <Link href="/collections/new-arrivals" className="btn btn-secondary mt-6">
                View new arrivals
              </Link>
            </div>
          ) : (
            <>
              <p className="label mb-6 text-ink-muted">
                {products.length} {products.length === 1 ? "piece" : "pieces"}
              </p>
              <ul className="grid-products">
                {products.map((p) => (
                  <li key={p.slug}>
                    <ProductCard product={p} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </>
  );
}
