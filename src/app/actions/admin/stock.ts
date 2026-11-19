"use server";

import { sql } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { requireAdminAction } from "@/lib/admin-auth";
import { refreshCatalog } from "@/lib/admin/revalidate";
import type { AdminActionState } from "@/lib/admin/types";
import { formInt, formString, pgErrorCode, rowsOf } from "@/lib/admin/validation";

const MAX_UNITS = 100_000;

/**
 * Relative change (+restock / -correction). One atomic batch: stock upsert + movement row.
 * The stock >= 0 CHECK rejects anything that would go negative and rolls both back.
 */
export async function adjustStock(_prev: AdminActionState, fd: FormData): Promise<AdminActionState> {
  const admin = await requireAdminAction();
  const productId = formInt(fd, "productId");
  const delta = formInt(fd, "delta");
  const reason = formString(fd, "reason", 20) === "correction" ? "correction" : "restock";
  const note = formString(fd, "note", 200) || null;

  if (productId === null) return { error: "Invalid product." };
  if (delta === null || delta === 0 || Math.abs(delta) > MAX_UNITS) {
    return { error: `Enter a whole number other than 0 (up to ${MAX_UNITS.toLocaleString()}).` };
  }

  try {
    await db.batch([
      db.execute(
        sql`insert into stock (product_id, quantity, updated_at) values (${productId}::int, ${delta}::int, now())
            on conflict (product_id) do update set quantity = stock.quantity + excluded.quantity, updated_at = now()`,
      ),
      db.execute(
        sql`insert into stock_movements (product_id, delta, reason, note, actor_id)
            values (${productId}::int, ${delta}::int, ${reason}::text, ${note}::text, ${admin.id}::text)`,
      ),
    ] as [BatchItem<"pg">, ...BatchItem<"pg">[]]);
  } catch (e) {
    const code = pgErrorCode(e);
    if (code === "23514") return { error: "Stock can't go below zero." };
    if (code === "23503") return { error: "That product no longer exists." };
    console.error("adjustStock failed", e);
    return { error: "Couldn't update stock. Please try again." };
  }
  refreshCatalog();
  revalidatePath("/admin/stock");
  return { success: `${delta > 0 ? "Added" : "Removed"} ${Math.abs(delta)} unit${Math.abs(delta) === 1 ? "" : "s"}.` };
}

/**
 * Stocktake: set an absolute quantity. Compare-and-set against the quantity the form loaded
 * (`expected`) in ONE statement, so a sale that happened meanwhile is never overwritten.
 */
export async function setStock(_prev: AdminActionState, fd: FormData): Promise<AdminActionState> {
  const admin = await requireAdminAction();
  const productId = formInt(fd, "productId");
  const expected = formInt(fd, "expected");
  const next = formInt(fd, "quantity");
  const note = formString(fd, "note", 200) || "Stocktake";

  if (productId === null || expected === null) return { error: "Invalid request." };
  if (next === null || next < 0 || next > MAX_UNITS) return { error: `Enter a whole number from 0 to ${MAX_UNITS.toLocaleString()}.` };
  if (next === expected) return { success: "Nothing to change." };

  try {
    // Make sure a row exists, then compare-and-set + log in a single statement.
    await db.execute(sql`insert into stock (product_id, quantity) values (${productId}::int, 0) on conflict (product_id) do nothing`);
    const res = await db.execute(sql`
      with upd as (
        update stock set quantity = ${next}::int, updated_at = now()
        where product_id = ${productId}::int and quantity = ${expected}::int
        returning product_id
      )
      insert into stock_movements (product_id, delta, reason, note, actor_id)
      select product_id, ${next}::int - ${expected}::int, 'correction', ${note}::text, ${admin.id}::text from upd
      returning id`);
    if (rowsOf(res).length === 0) {
      return { error: "Stock changed since you opened this page (a sale or another edit). Reload and try again." };
    }
  } catch (e) {
    console.error("setStock failed", e);
    return { error: "Couldn't update stock. Please try again." };
  }
  refreshCatalog();
  revalidatePath("/admin/stock");
  return { success: `Stock set to ${next}.` };
}
