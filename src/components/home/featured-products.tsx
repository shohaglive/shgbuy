import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { getFeaturedProducts } from "@/lib/products";
import { SectionHeading } from "./section-heading";

export async function FeaturedProducts() {
  const featuredProducts = await getFeaturedProducts();
  return (
    <section aria-labelledby="featured-title" className="section divider">
      <div className="container-page">
        <SectionHeading
          id="featured-title"
          eyebrow="Selected for the season"
          title="Featured Pieces"
          href="/collections/new-arrivals"
          linkLabel="Shop all"
        />
        <ul className="grid-products">
          {featuredProducts.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
        <div className="mt-10 sm:hidden">
          <Link href="/collections/new-arrivals" className="btn btn-secondary btn-block">
            Shop all
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Fallback shown while featured products load. Mirrors the real grid to avoid layout shift. */
export function FeaturedProductsSkeleton() {
  return (
    <section aria-label="Featured products" aria-busy="true" className="section divider">
      <div className="container-page">
        <div className="mb-8 h-16 lg:mb-12" />
        <ProductGridSkeleton />
      </div>
    </section>
  );
}
