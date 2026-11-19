"use server";

import { randomBytes } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { cartItems, orderEvents, orderItems, orders, stock, stockMovements } from "@/db/schema";
import { getCart, getSessionUser } from "@/lib/cart";
import { COUNTRIES } from "@/lib/countries";

export type CheckoutState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
  /** Echoed back so the form keeps what the customer typed. */
  values?: Record<string, string>;
};

const ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";
const newOrderNumber = () =>
  "SHG-" +
  Array.from(randomBytes(8), (b) => ALPHABET[b % ALPHABET.length]).join("");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const get = (key: string) => String(formData.get(key) ?? "").trim().slice(0, 200);
  const values = {
    email: get("email"),
    name: get("name"),
    line1: get("line1"),
    line2: get("line2"),
    city: get("city"),
    region: get("region"),
    postalCode: get("postalCode"),
    country: get("country"),
    phone: get("phone"),
  };

  const fieldErrors: Record<string, string> = {};
  if (!EMAIL_RE.test(values.email)) fieldErrors.email = "Enter a valid email address.";
  if (values.name.length < 2) fieldErrors.name = "Enter your full name.";
  if (values.line1.length < 3) fieldErrors.line1 = "Enter your street address.";
  if (values.city.length < 2) fieldErrors.city = "Enter your city.";
  if (values.region.length < 2) fieldErrors.region = "Enter your state or region.";
  if (values.postalCode.length < 3) fieldErrors.postalCode = "Enter your postal code.";
  if (!(COUNTRIES as readonly string[]).includes(values.country)) fieldErrors.country = "Select a country.";
  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please check the highlighted fields.", fieldErrors, values };
  }

  const cart = await getCart();
  if (!cart.id || cart.lines.length === 0) {
    return { error: "Your bag is empty.", values };
  }

  // Friendly stock check (the database CHECK constraint is the real guard).
  const wanted = new Map<number, { name: string; quantity: number; stock: number }>();
  for (const l of cart.lines) {
    const entry = wanted.get(l.productId) ?? { name: l.name, quantity: 0, stock: l.stock };
    entry.quantity += l.quantity;
    wanted.set(l.productId, entry);
  }
  const short = [...wanted.values()].filter((w) => w.quantity > w.stock);
  if (short.length > 0) {
    return {
      error: `Not enough stock for: ${short.map((s) => s.name).join(", ")}. Please update your bag.`,
      values,
    };
  }

  const user = await getSessionUser();
  const orderId = crypto.randomUUID();
  const orderNumber = newOrderNumber();

  const statements: BatchItem<"pg">[] = [
    db.insert(orders).values({
      id: orderId,
      orderNumber,
      userId: user?.id ?? null,
      email: values.email,
      subtotalCents: cart.subtotalCents,
      shippingCents: cart.shippingCents,
      totalCents: cart.totalCents,
      shipName: values.name,
      shipLine1: values.line1,
      shipLine2: values.line2 || null,
      shipCity: values.city,
      shipRegion: values.region,
      shipPostalCode: values.postalCode,
      shipCountry: values.country,
      shipPhone: values.phone || null,
    }),
    db.insert(orderItems).values(
      cart.lines.map((l) => ({
        orderId,
        productId: l.productId,
        name: l.name,
        size: l.size,
        unitPriceCents: l.unitPriceCents,
        quantity: l.quantity,
        imageSrc: l.image,
      })),
    ),
    ...[...wanted.entries()].map(([productId, w]) =>
      db
        .update(stock)
        .set({ quantity: sql`${stock.quantity} - ${w.quantity}`, updatedAt: new Date() })
        .where(eq(stock.productId, productId)),
    ),
    // Audit trail, written in the same atomic batch.
    db.insert(orderEvents).values({ orderId, fromStatus: null, toStatus: "confirmed", actorId: user?.id ?? null }),
    db.insert(stockMovements).values(
      [...wanted.entries()].map(([productId, w]) => ({
        productId,
        delta: -w.quantity,
        reason: "sale" as const,
        orderId,
        note: orderNumber,
      })),
    ),
    db.delete(cartItems).where(eq(cartItems.cartId, cart.id)),
  ];

  try {
    // One atomic batch: if any statement fails (e.g. stock would go negative), nothing is saved.
    await db.batch(statements as [BatchItem<"pg">, ...BatchItem<"pg">[]]);
  } catch (e) {
    const text = String(e) + String((e as { cause?: unknown })?.cause ?? "");
    if (text.includes("stock_quantity_nonnegative") || text.includes("23514")) {
      return { error: "An item in your bag just sold out. Please review your bag.", values };
    }
    console.error("placeOrder failed", e);
    return { error: "We couldn't place your order. Please try again.", values };
  }

  updateTag("products");
  revalidatePath("/", "layout");
  redirect(`/checkout/thank-you/${orderNumber}`);
}
