// Order reads (Server Components only).
import { desc, eq, inArray } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";

export async function getOrderByNumber(orderNumber: string) {
  await connection();
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)).orderBy(orderItems.id);
  return { ...order, items };
}

export async function getUserOrders(userId: string) {
  await connection();
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(50);
  if (rows.length === 0) return [];
  const items = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, rows.map((o) => o.id)))
    .orderBy(orderItems.id);
  return rows.map((o) => ({ ...o, items: items.filter((i) => i.orderId === o.id) }));
}
