// Cart data access (Server Components and Server Actions only).
// Reads are pure. Writes that must set the guest cookie live in src/app/actions/cart.ts.
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { connection } from "next/server";
import { db } from "@/db";
import { cartItems, carts, categories, products, stock } from "@/db/schema";
import { auth } from "@/lib/auth";
import { calcShippingCents } from "@/lib/shipping";

export const CART_COOKIE = "cart_id";
/** Most units of one product/size a customer can hold in their bag. */
export const MAX_PER_LINE = 10;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type CartLine = {
  id: number;
  productId: number;
  slug: string;
  name: string;
  category: string;
  image: string;
  size: string | null;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  /** Units currently in stock. */
  stock: number;
};

export type Cart = {
  id: string | null;
  lines: CartLine[];
  itemCount: number;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
};

/**
 * The signed-in user, or null. Per-request data: `connection()` keeps it out of
 * prerenders and prefetch shells, so no database call is started and then aborted.
 */
export async function getSessionUser() {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function getGuestCartCookie() {
  const value = (await cookies()).get(CART_COOKIE)?.value;
  return value && UUID_RE.test(value) ? value : null;
}

/** Id of the current cart, or null if none exists yet. Read-only. */
export async function findCartId(): Promise<string | null> {
  const user = await getSessionUser();
  if (user) {
    const [cart] = await db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, user.id))
      .limit(1);
    return cart?.id ?? null;
  }
  const guestId = await getGuestCartCookie();
  if (!guestId) return null;
  const [cart] = await db
    .select({ id: carts.id })
    .from(carts)
    .where(and(eq(carts.id, guestId), isNull(carts.userId)))
    .limit(1);
  return cart?.id ?? null;
}

/** Same as findCartId but creates the cart (and the guest cookie) when missing. Server Actions only. */
export async function getOrCreateCartId(): Promise<string> {
  const existing = await findCartId();
  if (existing) return existing;

  const user = await getSessionUser();
  const [created] = await db
    .insert(carts)
    .values({ userId: user?.id ?? null })
    .onConflictDoNothing()
    .returning({ id: carts.id });

  if (user) {
    if (created) return created.id;
    // Lost a race against another request creating this user's cart.
    const [cart] = await db.select({ id: carts.id }).from(carts).where(eq(carts.userId, user.id)).limit(1);
    return cart.id;
  }

  (await cookies()).set(CART_COOKIE, created.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return created.id;
}

export async function getCart(): Promise<Cart> {
  const cartId = await findCartId();
  if (!cartId) {
    return { id: null, lines: [], itemCount: 0, subtotalCents: 0, shippingCents: 0, totalCents: 0 };
  }

  const rows = await db
    .select({
      id: cartItems.id,
      productId: products.id,
      slug: products.slug,
      name: products.name,
      category: categories.name,
      images: products.images,
      size: cartItems.size,
      quantity: cartItems.quantity,
      unitPriceCents: products.priceCents,
      stock: sql<number>`coalesce(${stock.quantity}, 0)`.mapWith(Number),
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(stock, eq(stock.productId, products.id))
    .where(eq(cartItems.cartId, cartId))
    .orderBy(asc(cartItems.id));

  const lines: CartLine[] = rows.map(({ images, ...r }) => ({
    ...r,
    image: images[0]?.src ?? "",
    lineTotalCents: r.unitPriceCents * r.quantity,
  }));
  const subtotalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);
  const shippingCents = calcShippingCents(subtotalCents);
  return {
    id: cartId,
    lines,
    itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
  };
}

export async function getCartCount(): Promise<number> {
  const cartId = await findCartId();
  if (!cartId) return 0;
  const [row] = await db
    .select({ count: sql<number>`coalesce(sum(${cartItems.quantity}), 0)`.mapWith(Number) })
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId));
  return row?.count ?? 0;
}
