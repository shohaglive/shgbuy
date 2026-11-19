// Idempotent seed: `npm run db:seed`. Inserts missing rows only; never overwrites existing data.
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
  const { categories, collectionProducts, collections, journalPosts, products, stock, stockMovements } = schema;

  // Seeding only INSERTS missing rows (by slug / id). It never overwrites rows that
  // already exist, so edits made in the admin area survive a re-run.
  await db
    .insert(categories)
    .values([...seedCategories])
    .onConflictDoNothing({ target: categories.slug });
  const categoryRows = await db.select({ id: categories.id, slug: categories.slug }).from(categories);
  const categoryId = new Map(categoryRows.map((c) => [c.slug, c.id]));

  const insertedProducts = await db
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
    .onConflictDoNothing({ target: products.slug })
    .returning({ id: products.id, slug: products.slug });
  const productRows = await db.select({ id: products.id, slug: products.slug }).from(products);
  const productId = new Map(productRows.map((p) => [p.slug, p.id]));
  const newlyInserted = new Set(insertedProducts.map((p) => p.slug));

  // Stock (and its "initial" movement) only for products created by this run.
  const newStock = seedProducts.filter((p) => newlyInserted.has(p.slug));
  if (newStock.length > 0) {
    await db.batch([
      db
        .insert(stock)
        .values(newStock.map((p) => ({ productId: productId.get(p.slug)!, quantity: p.stock })))
        .onConflictDoNothing({ target: stock.productId }),
      db.insert(stockMovements).values(
        newStock.map((p) => ({
          productId: productId.get(p.slug)!,
          delta: p.stock,
          reason: "initial" as const,
          note: "Seed data",
        })),
      ),
    ]);
  }

  // Collections and their product links (links are replaced atomically per run).
  await db
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
    .onConflictDoNothing({ target: collections.slug });
  const collectionRows = await db.select({ id: collections.id, slug: collections.slug }).from(collections);
  const collectionId = new Map(collectionRows.map((c) => [c.slug, c.id]));

  const links = seedCollections.flatMap((c) =>
    c.productSlugs.map((slug, position) => ({
      collectionId: collectionId.get(c.slug)!,
      productId: productId.get(slug)!,
      position,
    })),
  );
  await db.insert(collectionProducts).values(links).onConflictDoNothing();

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
    `Seed complete: ${insertedProducts.length} new products (of ${productRows.length}); existing rows untouched.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
