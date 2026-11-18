import Image from "next/image";
import Link from "next/link";
import { formatPrice, getStockStatus } from "@/lib/catalog";
import type { Product } from "@/lib/products";

export function ProductCard({ product: p }: { product: Product }) {
  const soldOut = getStockStatus(p.stock) === "out-of-stock";

  return (
    <Link href={`/products/${p.slug}`} className="group block">
      <div className="media-product">
        <Image
          src={p.image}
          alt={p.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className={`object-cover ${soldOut ? "opacity-70" : ""}`}
        />
        {soldOut ? (
          <span className="label absolute left-3 top-3 bg-canvas px-2 py-1 text-[0.6875rem] text-ink-muted">
            Sold out
          </span>
        ) : (
          p.isNew && (
            <span className="label absolute left-3 top-3 bg-canvas px-2 py-1 text-[0.6875rem]">New</span>
          )
        )}
      </div>
      <div className="product-meta">
        <p className="eyebrow">{p.category}</p>
        <h3 className="font-sans! text-sm! font-medium leading-snug tracking-normal underline-offset-4 group-hover:underline">
          {p.name}
        </h3>
        <p className="price text-ink-muted">{formatPrice(p.priceCents)}</p>
      </div>
    </Link>
  );
}
