import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { SearchIcon } from "@/components/ui/icons";
import { popularSearches } from "@/lib/catalog";
import { getLatestProducts, searchProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

type SP = Promise<Record<string, string | string[] | undefined>>;

export default function SearchPage({ searchParams }: { searchParams: SP }) {
  return (
    <main id="main">
      <section aria-labelledby="search-title" className="section">
        <div className="container-page">
          {/* `searchParams` is awaited inside Suspense so the shell stays query-independent. */}
          <Suspense fallback={<SearchSkeleton />}>
            <SearchContent searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

function SearchSkeleton() {
  return (
    <div aria-busy="true">
      <div className="mb-10 h-24 animate-pulse bg-surface" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}

function Suggestions({ heading }: { heading: string }) {
  return (
    <div className="mt-6">
      <p className="eyebrow mb-3">{heading}</p>
      <ul className="flex flex-wrap gap-3">
        {popularSearches.map((term) => (
          <li key={term}>
            <Link href={`/search?q=${encodeURIComponent(term)}`} className="btn btn-secondary min-h-10 px-5 py-2">
              {term}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

async function SearchContent({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const q = (raw ?? "").trim().slice(0, 100);
  const results = q ? await searchProducts(q) : [];
  // With no query, show something to look at instead of an empty page.
  const inspiration = q ? [] : await getLatestProducts(4);

  return (
    <>
      <header className="mb-10 lg:mb-14">
        <p className="eyebrow mb-3">Search</p>
        <h1 id="search-title">{q ? <>Results for &ldquo;{q}&rdquo;</> : "Search the collection"}</h1>

        <form action="/search" method="get" role="search" className="mt-8 flex max-w-2xl items-center gap-3">
          <label htmlFor="search-q" className="sr-only">Search products</label>
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search by name, category or collection"
            autoComplete="off"
            className="field flex-1"
          />
          <button type="submit" className="btn btn-primary">
            <SearchIcon width={16} height={16} /> Search
          </button>
        </form>
      </header>

      {q && results.length > 0 && (
        <>
          <p className="label mb-6 text-ink-muted" aria-live="polite">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          <ul className="grid-products">
            {results.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </>
      )}

      {q && results.length === 0 && (
        <div className="divider py-12">
          <h2 className="text-3xl">Nothing found for &ldquo;{q}&rdquo;</h2>
          <p className="mt-3 text-ink-muted">
            We couldn&rsquo;t find a match. Check the spelling, try fewer words, or browse a popular search.
          </p>
          <Suggestions heading="Popular searches" />
          <Link href="/collections/new-arrivals" className="btn btn-primary mt-8">Shop new arrivals</Link>
        </div>
      )}

      {!q && (
        <>
          <Suggestions heading="Popular searches" />
          <div className="divider mt-12 pt-10">
            <h2 className="mb-8 text-3xl">New arrivals</h2>
            <ul className="grid-products">
              {inspiration.map((p) => (
                <li key={p.slug}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
}
