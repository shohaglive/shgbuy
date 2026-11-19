"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/db";
import { cartItems, carts, products, stock } from "@/db/schema";
import {
  CART_COOKIE,
  MAX_PER_LINE,
  findCartId,
  getCartCount,
  getGuestCartCookie,
  getOrCreateCartId,
  getSessionUser,
} from "@/lib/cart";

export type CartActionResult = { ok: true; count: number } | { ok: false; error: string };

const fail = (error: string): CartActionResult => ({ ok: false, error });

const sizeCondition = (size: string | null) =>
  size === null ? isNull(cartItems.size) : eq(cartItems.size, size);

async function loadProduct(productId: number) {
  const [p] = await db
    .select({
      id: products.id,
      sizes: products.sizes,
      stock: sql<number>`case when ${products.archivedAt} is not null then 0 else coalesce(${stock.quantity}, 0) end`.mapWith(Number),
    })
    .from(products)
    .leftJoin(stock, eq(stock.productId, products.id))
    .where(eq(products.id, productId))
    .limit(1);
  return p ?? null;
}

export async function addToCart(
  productId: number,
  size: string | null,
  quantity = 1,
): Promise<CartActionResult> {
  if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
    return fail("Invalid request.");
  }
  const product = await loadProduct(productId);
  if (!product) return fail("This product is no longer available.");

  const hasSizes = (product.sizes?.length ?? 0) > 0;
  if (hasSizes && (!size || !product.sizes!.includes(size))) return fail("Please select a size.");
  const lineSize = hasSizes ? size : null;
  if (product.stock <= 0) return fail("Sorry, this item is sold out.");

  const cartId = await getOrCreateCartId();
  const [existing] = await db
    .select({ id: cartItems.id, quantity: cartItems.quantity })
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId), sizeCondition(lineSize)))
    .limit(1);

  const limit = Math.min(product.stock, MAX_PER_LINE);
  const next = (existing?.quantity ?? 0) + quantity;
  if (next > limit) {
    return fail(
      existing
        ? `Only ${limit} available, and you already have ${existing.quantity} in your bag.`
        : `Only ${limit} available.`,
    );
  }

  if (existing) {
    await db.update(cartItems).set({ quantity: next }).where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({ cartId, productId, size: lineSize, quantity });
  }
  await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));

  revalidatePath("/", "layout");
  return { ok: true, count: await getCartCount() };
}

async function loadOwnedItem(itemId: number) {
  const cartId = await findCartId();
  if (!cartId || !Number.isInteger(itemId)) return null;
  const [item] = await db
    .select({ id: cartItems.id, productId: cartItems.productId })
    .from(cartItems)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)))
    .limit(1);
  return item ?? null;
}

export async function updateCartItem(itemId: number, quantity: number): Promise<CartActionResult> {
  const item = await loadOwnedItem(itemId);
  if (!item || !Number.isInteger(quantity)) return fail("That item is no longer in your bag.");

  if (quantity < 1) {
    await db.delete(cartItems).where(eq(cartItems.id, item.id));
  } else {
    const product = await loadProduct(item.productId);
    const limit = Math.min(product?.stock ?? 0, MAX_PER_LINE);
    if (limit < 1) {
      await db.delete(cartItems).where(eq(cartItems.id, item.id));
    } else {
      await db.update(cartItems).set({ quantity: Math.min(quantity, limit) }).where(eq(cartItems.id, item.id));
    }
  }
  revalidatePath("/", "layout");
  return { ok: true, count: await getCartCount() };
}

export async function removeCartItem(itemId: number): Promise<CartActionResult> {
  return updateCartItem(itemId, 0);
}

/** Called right after sign-in or sign-up: folds the guest cart into the account's cart. */
export async function mergeGuestCart(): Promise<void> {
  const user = await getSessionUser();
  const guestId = await getGuestCartCookie();
  if (!user || !guestId) return;

  const [guest] = await db
    .select({ id: carts.id })
    .from(carts)
    .where(and(eq(carts.id, guestId), isNull(carts.userId)))
    .limit(1);
  (await cookies()).delete(CART_COOKIE);
  if (!guest) return;

  const [mine] = await db.select({ id: carts.id }).from(carts).where(eq(carts.userId, user.id)).limit(1);
  if (!mine) {
    await db.update(carts).set({ userId: user.id }).where(eq(carts.id, guest.id));
    revalidatePath("/", "layout");
    return;
  }

  const guestItems = await db.select().from(cartItems).where(eq(cartItems.cartId, guest.id));
  for (const g of guestItems) {
    const product = await loadProduct(g.productId);
    const limit = Math.min(product?.stock ?? 0, MAX_PER_LINE);
    if (limit < 1) continue;
    const [match] = await db
      .select({ id: cartItems.id, quantity: cartItems.quantity })
      .from(cartItems)
      .where(and(eq(cartItems.cartId, mine.id), eq(cartItems.productId, g.productId), sizeCondition(g.size)))
      .limit(1);
    if (match) {
      await db
        .update(cartItems)
        .set({ quantity: Math.min(match.quantity + g.quantity, limit) })
        .where(eq(cartItems.id, match.id));
    } else {
      await db.insert(cartItems).values({
        cartId: mine.id,
        productId: g.productId,
        size: g.size,
        quantity: Math.min(g.quantity, limit),
      });
    }
  }
  await db.delete(carts).where(eq(carts.id, guest.id));
  revalidatePath("/", "layout");
}
