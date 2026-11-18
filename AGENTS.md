<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Database conventions

Postgres (Neon) via Drizzle. Tables: catalog (`categories`, `products`, `stock`, `collections`, `collection_products`), content (`journal_posts`), commerce (`carts`, `cart_items`, `orders`, `order_items`) and Better Auth (`user`, `session`, `account`, `verification`). Payments, reviews, wishlists and product variants are deliberately not built; checkout is a demo that stores no payment data.

- **Schema** lives in `src/db/schema.ts`; the client is `src/db/index.ts` (Neon HTTP driver, so no interactive transactions). `DATABASE_URL` goes in `.env.local`. `.env.*` files are deny-listed for Read/Edit, so don't try to read them.
- **Migrations:** change the schema, run `npm run db:generate`, review the SQL in `drizzle/`, then `npm run db:migrate`. Commit the generated SQL. Don't use `db:push` except on a throwaway dev database.
- **Money** is stored as integer USD cents (`price_cents`). Format with `formatPrice(cents)` from `src/lib/catalog.ts`; never store or pass dollars.
- **Stock** is its own 1:1 table (`stock.quantity`, never negative), separate from `products`. The low-stock threshold is an app constant in `src/lib/catalog.ts` (`LOW_STOCK_THRESHOLD`), not data. There is no per-size stock; `products.sizes` is display-only.
- **Product images** are a jsonb `{ src, alt }[]` on `products`; the first entry is the primary image.
- **Reading products:** only through `src/lib/products.ts`, from Server Components. Reads use `"use cache"` with `cacheTag("products")` and a short `cacheLife`. After any product or stock write, call `updateTag("products")`.
- **Builds need the database:** `generateStaticParams` for `/products/[slug]` queries it, so `next build` requires `DATABASE_URL` and a seeded database.
- **Seed data** is `src/db/seed-data.ts`, loaded with `npm run db:seed`. It upserts by slug and is safe to re-run.
- `src/lib/catalog.ts` holds only static content (hero, nav, editorial, footer) and shared helpers, not products or collections.
- **Collections vs categories:** `/collections/[slug]` resolves a curated collection (Women, Men, Accessories via `collection_products`) first, then falls back to a category. `/collections/new-arrivals` is a fixed route.
- **Cart:** the cart id is a uuid in the httpOnly `cart_id` cookie for guests; signed-in users have one cart tied to `user_id`. Reads (`getCart`, `getCartCount` in `src/lib/cart.ts`) are pure; writes are Server Actions in `src/app/actions/cart.ts`. `mergeGuestCart()` runs right after sign-in or sign-up. Sizes are plain text on `cart_items`.
- **Orders:** placed only by `placeOrder` in `src/app/actions/checkout.ts`, as one `db.batch` (insert order and items, decrement stock, clear cart). The `stock.quantity >= 0` CHECK is the oversell guard, so don't add manual rollback. Order ids are app-generated uuids; `order_number` is the public, unguessable reference. `order_items` snapshot name, price and image. Shipping rule lives in `src/lib/shipping.ts`.
- **Auth:** Better Auth, email and password only (`src/lib/auth.ts`, `src/lib/auth-client.ts`, handler at `src/app/api/auth/[...all]/route.ts`). It needs `BETTER_AUTH_SECRET` in `.env.local`. Read the session with `getSessionUser()` from `src/lib/cart.ts`.
- **Request-time reads and Partial Prefetching:** anything that reads the session, cart cookie or orders must call `await connection()` (from `next/server`) before querying, and render inside `<Suspense>`. Otherwise prefetch renders start database calls and abort them, which floods the logs with errors. `getSessionUser`, `getOrderByNumber` and `getUserOrders` already do this.
