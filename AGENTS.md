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
- **Seed data** is `src/db/seed-data.ts`, loaded with `npm run db:seed`. It only INSERTS missing rows and never overwrites existing products, stock or collections, so admin edits survive re-runs. To change an existing row, use the admin area (or SQL), not the seed.
- `src/lib/catalog.ts` holds only static content (hero, nav, editorial, footer) and shared helpers, not products or collections.
- **Collections vs categories:** `/collections/[slug]` resolves a curated collection (Women, Men, Accessories via `collection_products`) first, then falls back to a category. `/collections/new-arrivals` is a fixed route.
- **Cart:** the cart id is a uuid in the httpOnly `cart_id` cookie for guests; signed-in users have one cart tied to `user_id`. Reads (`getCart`, `getCartCount` in `src/lib/cart.ts`) are pure; writes are Server Actions in `src/app/actions/cart.ts`. `mergeGuestCart()` runs right after sign-in or sign-up. Sizes are plain text on `cart_items`.
- **Orders:** placed only by `placeOrder` in `src/app/actions/checkout.ts`, as one `db.batch` (insert order and items, decrement stock, write the `sale` stock movement and the initial `order_events` row, clear cart). The `stock.quantity >= 0` CHECK is the oversell guard, so don't add manual rollback. Statuses: `confirmed` > `shipped` > `delivered`, or `cancelled` (from `confirmed` only, restocks). Labels and badge tones live in `src/lib/order-status.ts`. Order ids are app-generated uuids; `order_number` is the public, unguessable reference. `order_items` snapshot name, price and image. Shipping rule lives in `src/lib/shipping.ts`.
- **Auth:** Better Auth, email and password only (`src/lib/auth.ts`, `src/lib/auth-client.ts`, handler at `src/app/api/auth/[...all]/route.ts`). It needs `BETTER_AUTH_SECRET` in `.env.local`. Read the session with `getSessionUser()` from `src/lib/cart.ts`.
- **Request-time reads and Partial Prefetching:** anything that reads the session, cart cookie or orders must call `await connection()` (from `next/server`) before querying, and render inside `<Suspense>`. Otherwise prefetch renders start database calls and abort them, which floods the logs with errors. `getSessionUser`, `getOrderByNumber` and `getUserOrders` already do this.

## Admin area (`/admin`)

- **Access:** `user.role` is `"user"` or `"admin"`. It cannot be set from the web (`additionalFields` has `input: false`). Grant it with `ADMIN_EMAIL=you@example.com npm run db:make-admin` after the account is registered (`--revoke` to demote). The role is read from the database-backed session on every request.
- **Authorization is checked in every admin page, data function and Server Action, never just in a layout.** Pages and `src/lib/admin/queries.ts` call `requireAdmin()` first (redirects guests to sign in, 404s non-admins). Server Actions are public POST endpoints, so each one in `src/app/actions/admin/` starts with `requireAdminAction()`. `src/app/admin/layout.tsx` is only a shell with `noindex` metadata.
- **Route groups:** the storefront lives in `src/app/(shop)/` (header, footer, skip link in its layout); `src/app/admin/` has its own shell. The root layout only provides `<html>`, fonts and CSS. Put new storefront routes in `(shop)`.
- **Admin pages** follow the storefront rule: a sync default export renders `<Suspense>`, and an inner async component calls `requireAdmin()` and awaits `params`/`searchParams`. Filters and pagination are URL-driven (GET forms); orders use keyset pagination on `(created_at, id)`.
- **Writes** are Server Actions returning `AdminActionState` (`src/lib/admin/types.ts`), used with `ActionForm` or `useActionState`. Each multi-step write is one `db.batch` or one SQL statement (CTE) so it is atomic, then calls `refreshCatalog()` (`updateTag("products")` + `revalidatePath`). A `"use server"` file may only export async functions: put constants in `src/lib/admin/validation.ts`.
- **A batch cannot use an id returned by an earlier statement**, so dependent inserts look the new row up by its unique slug. Raw `db.execute(sql...)` statements are batchable.
- **Drizzle quirk:** in single-table queries it leaves columns unqualified, so a correlated subselect referencing the outer `id` binds to the wrong table. Use a join and `groupBy` (see `getAdminOrders`) or write explicit qualified names.
- **Archive, don't delete:** `products.archived_at` hides a product from the storefront (all reads filter it) and makes it read as sold out in carts and checkout. A product referenced by any order line cannot be deleted. Categories can't be deleted while they have products.
- **Slugs:** collections and categories share the `/collections/[slug]` namespace and are checked against each other; `new-arrivals` is reserved (`RESERVED_SLUGS`).
- **Images:** admin-entered URLs must be `https://images.unsplash.com/photo-…` (`isAllowedImageUrl`), matching `images.remotePatterns` in `next.config.ts`. Widen both together.
- **Stock changes:** use `adjustStock` (relative, safe alongside sales) or `setStock` (stocktake, compare-and-set against the quantity the form loaded). Both write `stock_movements`; cancelling an order restocks and logs in one statement. Never overwrite quantity from a stale form.
- **Forms:** `Field` (`src/components/ui/field.tsx`) is shared by checkout and admin. A `<select>`'s default is applied only on mount, so `Field` keys it on its default value. Don't remount a parent that holds an action's success message (keep one persistent form and swap its buttons, as `OrderActions` does).

## Environment and password reset

- **`APP_ENV`** is `local`, `dev` or `production` (set in `.env`; read with `getAppEnv()` / `isLocalEnv()` from `src/lib/env.ts`). A missing or unknown value counts as `production`, so anything gated on `local` fails closed. Next loads `.env`, so an exported shell value overrides it (use that to test other environments).
- **Forgot password** is a 6-digit code flow built on Better Auth's `emailOTP` plugin (`/account/forgot-password`, linked from the login page). Codes are stored hashed, expire after 10 minutes, allow 3 attempts and are rate limited; unknown emails get the same success response; a successful reset signs the account out everywhere. The plugin is for password reset ONLY: its sign-in codes are never delivered and `disableSignUp` is on.
- **Delivery goes through one function, `deliverPasswordResetCode` in `src/lib/password-reset.ts`.** With `APP_ENV=local` it prints the code to the server console. In `dev` and `production` it sends and logs nothing (no email provider yet). To go live, send the email from that function. Never log a code outside `local`.

## Storefront search

- The header Search button opens an expanding bar (`src/components/layout/header.tsx`); submitting goes to `/search?q=…` (`src/app/(shop)/search/page.tsx`, `noindex`, disallowed in `robots.ts`). Suggested terms live in `popularSearches` in `src/lib/catalog.ts`.
- `searchProducts()` in `src/lib/products.ts` is deliberately NOT cached (the query is unbounded user input; results should reflect current stock). It requires every word to match the START of a word in a product's name, category, description or collection name, using a regex-escaped `~*` match, and skips archived products. Call it only after awaiting `searchParams` inside `<Suspense>`.
- Header code must not call `usePathname()`/`useSearchParams()` (they need a Suspense boundary on dynamic routes); the search bar closes via Escape, submit, or clicking any link inside the header instead.
