// Idempotent seed: `npm run db:seed`. Upserts by slug / product id, so re-running is safe.
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { seedCategories, seedCollections, seedJournal, seedProducts } from "./seed-data";
import * as schema from "./schema";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set (.env.local).");
  const db = drizzle({ client: neon(url), schema });
  const { categories, collectionProducts, collections, journalPosts, products, stock } = schema;

  const categoryRows = await db
    .insert(categories)
    .values([...seedCategories])
    .onConflictDoUpdate({
      target: categories.slug,
      set: { name: sql`excluded.name` },
    })
    .returning({ id: categories.id, slug: categories.slug });
  const categoryId = new Map(categoryRows.map((c) => [c.slug, c.id]));

  const productRows = await db
    .insert(products)
    .values(
      seedProducts.map((p) => ({
        slug: p.slug,
        name: p.name,
        categoryId: categoryId.get(p.categorySlug)!,
        priceCents: p.priceCents,
        description: p.description,
        details: p.details,
        sizes: p.sizes ?? null,
        images: p.images,
        isNew: p.isNew ?? false,
        isFeatured: p.isFeatured ?? false,
      })),
    )
    .onConflictDoUpdate({
      target: products.slug,
      set: {
        name: sql`excluded.name`,
        categoryId: sql`excluded.category_id`,
        priceCents: sql`excluded.price_cents`,
        description: sql`excluded.description`,
        details: sql`excluded.details`,
        sizes: sql`excluded.sizes`,
        images: sql`excluded.images`,
        isNew: sql`excluded.is_new`,
        isFeatured: sql`excluded.is_featured`,
        updatedAt: sql`now()`,
      },
    })
    .returning({ id: products.id, slug: products.slug });
  const productId = new Map(productRows.map((p) => [p.slug, p.id]));

  await db
    .insert(stock)
    .values(
      seedProducts.map((p) => ({
        productId: productId.get(p.slug)!,
        quantity: p.stock,
      })),
    )
    .onConflictDoUpdate({
      target: stock.productId,
      set: { quantity: sql`excluded.quantity`, updatedAt: sql`now()` },
    });

  // Collections and their product links (links are replaced atomically per run).
  const collectionRows = await db
    .insert(collections)
    .values(
      seedCollections.map((c) => ({
        slug: c.slug,
        name: c.name,
        blurb: c.blurb,
        imageSrc: c.imageSrc,
        imageAlt: c.imageAlt,
        sortOrder: c.sortOrder,
      })),
    )
    .onConflictDoUpdate({
      target: collections.slug,
      set: {
        name: sql`excluded.name`,
        blurb: sql`excluded.blurb`,
        imageSrc: sql`excluded.image_src`,
        imageAlt: sql`excluded.image_alt`,
        sortOrder: sql`excluded.sort_order`,
      },
    })
    .returning({ id: collections.id, slug: collections.slug });
  const collectionId = new Map(collectionRows.map((c) => [c.slug, c.id]));

  const links = seedCollections.flatMap((c) =>
    c.productSlugs.map((slug, position) => ({
      collectionId: collectionId.get(c.slug)!,
      productId: productId.get(slug)!,
      position,
    })),
  );
  await db.batch([
    db.delete(collectionProducts),
    db.insert(collectionProducts).values(links),
  ]);

  await db
    .insert(journalPosts)
    .values(seedJournal.map((j) => ({ ...j, publishedAt: new Date(j.publishedAt) })))
    .onConflictDoUpdate({
      target: journalPosts.slug,
      set: {
        title: sql`excluded.title`,
        excerpt: sql`excluded.excerpt`,
        body: sql`excluded.body`,
        coverSrc: sql`excluded.cover_src`,
        coverAlt: sql`excluded.cover_alt`,
        publishedAt: sql`excluded.published_at`,
      },
    });

  console.log(
    `Seeded ${collectionRows.length} collections, ${links.length} collection links, ${seedJournal.length} journal posts.`,
  );
  console.log(
    `Seeded ${categoryRows.length} categories, ${productRows.length} products, ${productRows.length} stock rows.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
