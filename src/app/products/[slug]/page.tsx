import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/product-card";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { StockIndicator } from "@/components/product/stock-indicator";
import { formatPrice } from "@/lib/catalog";
import { getAllProductSlugs, getProductBySlug, getRelatedProducts } from "@/lib/products";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return { title: product.name, description: product.description };
}

// The page itself never awaits `params`: the promise is passed into a <Suspense> boundary
// so the static shell stays URL-independent and navigation can be instant.
export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <main id="main">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails params={params} />
      </Suspense>
    </main>
  );
}

function ProductSkeleton() {
  return (
    <div aria-busy="true" className="container-page grid gap-8 py-14 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-16">
      <div className="aspect-[4/5] animate-pulse bg-surface" />
      <div className="space-y-4">
        <div className="h-3 w-24 bg-surface" />
        <div className="h-10 w-3/4 bg-surface" />
        <div className="h-5 w-20 bg-surface" />
        <div className="h-24 w-full bg-surface" />
      </div>
    </div>
  );
}

async function ProductDetails({ params }: Pick<PageProps<"/products/[slug]">, "params">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const images = [
    { src: product.image, alt: product.name },
    ...product.gallery,
  ];
  const related = await getRelatedProducts(product.slug);
  // Lead image spans the full width; an unpaired last image does too, so the grid has no gaps.
  const spansFullRow = (i: number) =>
    images.length > 1 && (i === 0 || (i === images.length - 1 && i % 2 === 1));

  return (
    <>
      <div className="container-page pt-6 lg:pt-8">
        <nav aria-label="Breadcrumb" className="label text-ink-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:text-ink">Home</Link></li>
            <li aria-hidden>/</li>
            <li>
              <Link href={`/collections/${product.categorySlug}`} className="hover:text-ink">{product.category}</Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">{product.name}</li>
          </ol>
        </nav>
      </div>

      <section aria-labelledby="product-title" className="container-page grid gap-8 py-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start lg:gap-16 lg:py-10">
        {/* Imagery: large, stacked editorial frames */}
        <ul className={`grid gap-3 ${images.length > 1 ? "lg:grid-cols-2" : ""}`}>
          {images.map((img, i) => (
            <li key={img.src} className={spansFullRow(i) ? "lg:col-span-2" : undefined}>
              <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes={i === 0 ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 30vw, 100vw"}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  className="object-cover"
                />
              </div>
            </li>
          ))}
        </ul>

        {/* Information: sticky on desktop */}
        <div className="lg:sticky lg:top-28">
          <p className="eyebrow">
            {product.category}
            {product.isNew && <span className="ml-3 text-ink">New</span>}
          </p>
          <h1 id="product-title" className="mt-3 text-[clamp(2rem,1.4rem+2vw,3rem)]">
            {product.name}
          </h1>
          <p className="price mt-4 text-xl">{formatPrice(product.priceCents)}</p>
          <div className="mt-3">
            <StockIndicator stock={product.stock} />
          </div>

          <p className="mt-8 text-ink-muted">{product.description}</p>

          <div className="mt-8">
            <PurchasePanel product={product} />
          </div>

          <div className="mt-8 border-t border-line">
            <details className="group border-b border-line" open>
              <summary className="label flex cursor-pointer list-none items-center justify-between py-4">
                Details
                <span aria-hidden className="text-base transition-transform group-open:rotate-45">+</span>
              </summary>
              <ul className="list-disc space-y-1 pb-5 pl-5 text-sm text-ink-muted">
                {product.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </details>
            <details className="group border-b border-line">
              <summary className="label flex cursor-pointer list-none items-center justify-between py-4">
                Shipping &amp; returns
                <span aria-hidden className="text-base transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-5 text-sm text-ink-muted">
                Complimentary shipping on orders over $250. Free returns within 30 days on unworn items in their original packaging.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section aria-labelledby="related-title" className="section divider mt-8">
        <div className="container-page">
          <h2 id="related-title" className="mb-8 lg:mb-12">You may also like</h2>
          <ul className="grid-products">
            {related.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
