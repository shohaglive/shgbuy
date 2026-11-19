"use server";

import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { requireAdminAction } from "@/lib/admin-auth";
import { refreshCatalog } from "@/lib/admin/revalidate";
import type { AdminActionState } from "@/lib/admin/types";
import { formString, rowsOf } from "@/lib/admin/validation";

const TRANSITIONS = {
  shipped: "confirmed",
  delivered: "shipped",
  cancelled: "confirmed",
} as const;
type Target = keyof typeof TRANSITIONS;

/**
 * Move an order along confirmed -> shipped -> delivered, or cancel it (from confirmed only).
 * Each change is ONE SQL statement guarded by the expected current status, so double clicks and
 * concurrent edits can't apply twice. Cancelling restocks and logs movements in the same statement.
 */
export async function updateOrderStatus(_prev: AdminActionState, fd: FormData): Promise<AdminActionState> {
  const admin = await requireAdminAction();
  const orderId = formString(fd, "orderId", 40);
  const orderNumber = formString(fd, "orderNumber", 40);
  const to = formString(fd, "to", 20) as Target;

  if (!/^[0-9a-f-]{36}$/i.test(orderId) || !(to in TRANSITIONS)) return { error: "Invalid request." };
  const from = TRANSITIONS[to];
  const stale: AdminActionState = { error: "This order's status already changed. Reload to see the latest." };

  try {
    if (to === "cancelled") {
      const res = await db.execute(sql`
        with upd as (
          update orders set status = 'cancelled', cancelled_at = now(), updated_at = now()
          where id = ${orderId}::uuid and status = 'confirmed'
          returning id
        ),
        ev as (
          insert into order_events (order_id, from_status, to_status, actor_id)
          select id, 'confirmed', 'cancelled', ${admin.id}::text from upd
        ),
        agg as (
          select oi.product_id, sum(oi.quantity)::int as q
          from order_items oi join upd on oi.order_id = upd.id
          where oi.product_id is not null
          group by oi.product_id
        ),
        restock as (
          update stock s set quantity = s.quantity + agg.q, updated_at = now()
          from agg where s.product_id = agg.product_id
          returning s.product_id, agg.q
        ),
        mv as (
          insert into stock_movements (product_id, delta, reason, note, order_id, actor_id)
          select product_id, q, 'cancel', 'Order cancelled', ${orderId}::uuid, ${admin.id}::text from restock
        )
        select (select count(*)::int from upd) as cancelled`);
      if (Number(rowsOf<{ cancelled: number }>(res)[0]?.cancelled ?? 0) === 0) return stale;
      refreshCatalog();
    } else {
      const column = to === "shipped" ? sql`shipped_at` : sql`delivered_at`;
      const res = await db.execute(sql`
        with upd as (
          update orders set status = ${to}::text, ${column} = now(), updated_at = now()
          where id = ${orderId}::uuid and status = ${from}::text
          returning id
        )
        insert into order_events (order_id, from_status, to_status, actor_id)
        select id, ${from}::text, ${to}::text, ${admin.id}::text from upd
        returning id`);
      if (rowsOf(res).length === 0) return stale;
    }
  } catch (e) {
    console.error("updateOrderStatus failed", e);
    return { error: "Couldn't update the order. Please try again." };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath("/admin");
  revalidatePath("/account");
  return {
    success:
      to === "cancelled" ? "Order cancelled and stock restored." : to === "shipped" ? "Marked as shipped." : "Marked as delivered.",
  };
}
