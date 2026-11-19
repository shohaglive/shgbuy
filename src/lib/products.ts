// Product data access. Import from Server Components only (it talks to Postgres).
// Reads are cached and tagged "products"; call updateTag("products") after any
// product/stock write so pages pick up the change.
import { and, asc, desc, eq, isNull, ne, or, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { categories, collectionProducts, collections, products, stock } from "@/db/schema";

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  /** Price in USD cents. */
  priceCents: number;
  /** Primary image, used on cards and as the first gallery image. */
  image: string;
  /** Additional gallery images shown on the product page. */
  gallery: { src: string; alt: string }[];
  description: string;
  details: string[];
  /** Selectable sizes. Null for one-size items. */
  sizes: string[] | null;
  /** Units available. 0 means sold out. */
  stock: number;
  isNew: boolean;
};

const productColumns = {
  id: products.id,
  slug: products.slug,
  name: products.name,
  category: categories.name,
  categorySlug: categories.slug,
  priceCents: products.priceCents,
  description: products.description,
  details: products.details,
  sizes: products.sizes,
  images: products.images,
  stock: sql<number>`coalesce(${stock.quantity}, 0)`.mapWith(Number),
  isNew: products.isNew,
};

type Row = {
  id: number;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  priceCents: number;
  description: string;
  details: string[];
  sizes: string[] | null;
  images: { src: string; alt: string }[];
  stock: number;
  isNew: boolean;
};

function toProduct(r: Row): Product {
  const [primary, ...gallery] = r.images;
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    categorySlug: r.categorySlug,
    priceCents: r.priceCents,
    image: primary?.src ?? "",
    gallery,
    description: r.description,
    details: r.details,
    sizes: r.sizes,
    stock: r.stock,
    isNew: r.isNew,
  };
}

/** Archived products are hidden everywhere on the storefront. */
const live = isNull(products.archivedAt);

function baseQuery() {
  return db
    .select(productColumns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(stock, eq(stock.productId, products.id));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const rows = await baseQuery()
    .where(and(live, eq(products.isFeatured, true)))
    .orderBy(asc(products.id));
  return rows.map(toProduct);
}

/** Newest products first (ties broken by id so the order is stable). */
export async function getLatestProducts(limit = 24): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const rows = await baseQuery()
    .where(live)
    .orderBy(desc(products.createdAt), desc(products.id))
    .limit(limit);
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const [row] = await baseQuery().where(and(live, eq(products.slug, slug))).limit(1);
  return row ? toProduct(row) : null;
}

/** Same-category products first, then the rest, excluding the current one. */
export async function getRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const [current] = await db
    .select({ categoryId: products.categoryId })
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  const rows = await baseQuery()
    .where(and(live, ne(products.slug, slug)))
    .orderBy(
      desc(sql`(${products.categoryId} = ${current?.categoryId ?? -1})`),
      asc(products.id),
    )
    .limit(limit);
  return rows.map(toProduct);
}

export async function getAllProductSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const rows = await db
    .select({ slug: products.slug })
    .from(products)
    .where(live)
    .orderBy(asc(products.id));
  return rows.map((r) => r.slug);
}

export type CollectionSummary = {
  slug: string;
  name: string;
  blurb: string;
  image: string;
  alt: string;
};

export async function getCollections(): Promise<CollectionSummary[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const rows = await db
    .select({
      slug: collections.slug,
      name: collections.name,
      blurb: collections.blurb,
      image: collections.imageSrc,
      alt: collections.imageAlt,
    })
    .from(collections)
    .orderBy(asc(collections.sortOrder), asc(collections.id));
  return rows;
}

/** Slugs of every page served by /collections/[slug]: curated collections plus categories. */
export async function getAllCollectionPageSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const [collectionRows, categoryRows] = await Promise.all([
    db.select({ slug: collections.slug }).from(collections),
    db.select({ slug: categories.slug }).from(categories),
  ]);
  return [...new Set([...collectionRows, ...categoryRows].map((r) => r.slug))];
}

export type CollectionPage = {
  kind: "collection" | "category";
  slug: string;
  name: string;
  blurb: string | null;
  products: Product[];
};

/** Resolves a slug to a curated collection (Women, Men...) first, then to a category. */
export async function getCollectionPage(slug: string): Promise<CollectionPage | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const [collection] = await db
    .select({ id: collections.id, slug: collections.slug, name: collections.name, blurb: collections.blurb })
    .from(collections)
    .where(eq(collections.slug, slug))
    .limit(1);

  if (collection) {
    const rows = await baseQuery()
      .innerJoin(collectionProducts, eq(collectionProducts.productId, products.id))
      .where(and(live, eq(collectionProducts.collectionId, collection.id)))
      .orderBy(asc(collectionProducts.position));
    return {
      kind: "collection",
      slug: collection.slug,
      name: collection.name,
      blurb: collection.blurb,
      products: rows.map(toProduct),
    };
  }

  const [category] = await db
    .select({ slug: categories.slug, name: categories.name })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  if (!category) return null;

  const rows = await baseQuery()
    .where(and(live, eq(categories.slug, slug)))
    .orderBy(desc(products.createdAt), desc(products.id));
  return { kind: "category", slug: category.slug, name: category.name, blurb: null, products: rows.map(toProduct) };
}

/**
 * Storefront search. Every word in the query must match the start of a word in a product's name,
 * category, description or collection name (case-insensitive). Name matches rank first.
 * Deliberately NOT cached: the query text is unbounded user input, and results should
 * reflect current stock. Request-time only (call it after awaiting searchParams).
 */
export async function searchProducts(query: string, limit = 48): Promise<Product[]> {
  const terms = [...new Set(query.toLowerCase().split(/\s+/).map((t) => t.slice(0, 40)).filter(Boolean))].slice(0, 5);
  if (terms.length === 0) return [];

  const like = (t: string) => `%${t.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  // Match at the START of a word ("men" finds Men but not Women; "jack" finds Jacket).
  // \m is Postgres' word-start anchor; the term is regex-escaped so input like "(" is harmless.
  const wordStart = (t: string) => `\\m${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`;
  const matchesTerm = (t: string) =>
    or(
      sql`${products.name} ~* ${wordStart(t)}`,
      sql`${categories.name} ~* ${wordStart(t)}`,
      sql`${products.description} ~* ${wordStart(t)}`,
      sql`exists (select 1 from collection_products cp join collections col on col.id = cp.collection_id where cp.product_id = "products"."id" and col.name ~* ${wordStart(t)})`,
    );

  const rows = await baseQuery()
    .where(and(live, ...terms.map(matchesTerm)))
    .orderBy(
      sql`case when ${products.name} ilike ${like(terms.join(" "))} then 0 when ${categories.name} ilike ${like(terms[0])} then 1 else 2 end`,
      desc(products.createdAt),
      desc(products.id),
    )
    .limit(limit);
  return rows.map(toProduct);
}
