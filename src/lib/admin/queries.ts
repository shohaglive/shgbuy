// Uncached admin reads. Every function checks admin access itself (defence in depth;
// callers also call requireAdmin()). Request-time data: render inside <Suspense>.
import { and, asc, desc, eq, ilike, isNotNull, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  collectionProducts,
  collections,
  orderEvents,
  orderItems,
  orders,
  products,
  stock,
  stockMovements,
  user,
} from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { LOW_STOCK_THRESHOLD } from "@/lib/catalog";

const PAGE_SIZE = 20;
const likeTerm = (q: string) => `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
const qty = sql<number>`coalesce(${stock.quantity}, 0)`.mapWith(Number);

/* ------------------------------ categories ------------------------------ */
export async function getAdminCategories() {
  await requireAdmin();
  return db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      productCount: sql<number>`count(${products.id})`.mapWith(Number),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));
}

/* ------------------------------- products ------------------------------- */
export type ProductStatusFilter = "active" | "archived" | "all";

export async function getAdminProducts(opts: {
  q?: string;
  categoryId?: number;
  status?: ProductStatusFilter;
  page?: number;
}) {
  await requireAdmin();
  const page = Math.max(1, opts.page ?? 1);
  const status = opts.status ?? "active";
  const where = and(
    opts.q ? or(ilike(products.name, likeTerm(opts.q)), ilike(products.slug, likeTerm(opts.q))) : undefined,
    opts.categoryId ? eq(products.categoryId, opts.categoryId) : undefined,
    status === "active" ? isNull(products.archivedAt) : status === "archived" ? isNotNull(products.archivedAt) : undefined,
  );
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      category: categories.name,
      priceCents: products.priceCents,
      images: products.images,
      isNew: products.isNew,
      isFeatured: products.isFeatured,
      archivedAt: products.archivedAt,
      stock: qty,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(stock, eq(stock.productId, products.id))
    .where(where)
    .orderBy(desc(products.id))
    .limit(PAGE_SIZE + 1)
    .offset((page - 1) * PAGE_SIZE);
  return { rows: rows.slice(0, PAGE_SIZE), hasNext: rows.length > PAGE_SIZE, page };
}

export async function getAdminProduct(id: number) {
  await requireAdmin();
  const [row] = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      categoryId: products.categoryId,
      priceCents: products.priceCents,
      description: products.description,
      details: products.details,
      sizes: products.sizes,
      images: products.images,
      isNew: products.isNew,
      isFeatured: products.isFeatured,
      archivedAt: products.archivedAt,
      stock: qty,
      orderRefs: sql<number>`(select count(*) from order_items oi where oi.product_id = "products"."id")`.mapWith(Number),
    })
    .from(products)
    .leftJoin(stock, eq(stock.productId, products.id))
    .where(eq(products.id, id))
    .limit(1);
  return row ?? null;
}

export async function getCategoryOptions() {
  await requireAdmin();
  return db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name));
}

/* ------------------------------ collections ----------------------------- */
export async function getAdminCollections() {
  await requireAdmin();
  return db
    .select({
      id: collections.id,
      slug: collections.slug,
      name: collections.name,
      blurb: collections.blurb,
      sortOrder: collections.sortOrder,
      productCount: sql<number>`count(${collectionProducts.productId})`.mapWith(Number),
    })
    .from(collections)
    .leftJoin(collectionProducts, eq(collectionProducts.collectionId, collections.id))
    .groupBy(collections.id)
    .orderBy(asc(collections.sortOrder), asc(collections.id));
}

export async function getAdminCollection(id: number) {
  await requireAdmin();
  const [collection] = await db.select().from(collections).where(eq(collections.id, id)).limit(1);
  if (!collection) return null;
  const links = await db
    .select({ productId: collectionProducts.productId, position: collectionProducts.position })
    .from(collectionProducts)
    .where(eq(collectionProducts.collectionId, id));
  const allProducts = await db
    .select({
      id: products.id,
      name: products.name,
      category: categories.name,
      archivedAt: products.archivedAt,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(asc(products.name));
  const position = new Map(links.map((l) => [l.productId, l.position]));
  return {
    collection,
    products: allProducts.map((p) => ({ ...p, member: position.has(p.id), position: position.get(p.id) ?? 0 })),
  };
}

/* --------------------------------- stock -------------------------------- */
export async function getStockList(opts: { q?: string; page?: number }) {
  await requireAdmin();
  const page = Math.max(1, opts.page ?? 1);
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      archivedAt: products.archivedAt,
      quantity: qty,
      hasStockRow: sql<boolean>`${stock.productId} is not null`.mapWith(Boolean),
    })
    .from(products)
    .leftJoin(stock, eq(stock.productId, products.id))
    .where(opts.q ? or(ilike(products.name, likeTerm(opts.q)), ilike(products.slug, likeTerm(opts.q))) : undefined)
    .orderBy(asc(qty), asc(products.name))
    .limit(PAGE_SIZE + 1)
    .offset((page - 1) * PAGE_SIZE);
  return { rows: rows.slice(0, PAGE_SIZE), hasNext: rows.length > PAGE_SIZE, page };
}

export async function getRecentMovements(limit = 15, productId?: number) {
  await requireAdmin();
  return db
    .select({
      id: stockMovements.id,
      productName: products.name,
      delta: stockMovements.delta,
      reason: stockMovements.reason,
      note: stockMovements.note,
      actorName: user.name,
      orderNumber: orders.orderNumber,
      createdAt: stockMovements.createdAt,
    })
    .from(stockMovements)
    .leftJoin(products, eq(stockMovements.productId, products.id))
    .leftJoin(user, eq(stockMovements.actorId, user.id))
    .leftJoin(orders, eq(stockMovements.orderId, orders.id))
    .where(productId ? eq(stockMovements.productId, productId) : undefined)
    .orderBy(desc(stockMovements.createdAt), desc(stockMovements.id))
    .limit(limit);
}

/* --------------------------------- orders ------------------------------- */
export type OrderStatusFilter = "all" | "confirmed" | "shipped" | "delivered" | "cancelled";

/** Keyset pagination on (created_at, id). `cursor` is "<iso>_<uuid>" from the previous page's last row. */
export async function getAdminOrders(opts: { status?: OrderStatusFilter; q?: string; cursor?: string }) {
  await requireAdmin();
  let cursorCond;
  if (opts.cursor) {
    const [ts, id] = opts.cursor.split("_");
    if (ts && id && !Number.isNaN(Date.parse(ts)) && /^[0-9a-f-]{36}$/i.test(id)) {
      cursorCond = sql`(${orders.createdAt}, ${orders.id}) < (${ts}::timestamptz, ${id}::uuid)`;
    }
  }
  const where = and(
    opts.status && opts.status !== "all" ? eq(orders.status, opts.status) : undefined,
    opts.q ? or(ilike(orders.orderNumber, likeTerm(opts.q)), ilike(orders.email, likeTerm(opts.q))) : undefined,
    cursorCond,
  );
  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      email: orders.email,
      shipName: orders.shipName,
      status: orders.status,
      totalCents: orders.totalCents,
      createdAt: orders.createdAt,
      isGuest: sql<boolean>`${orders.userId} is null`.mapWith(Boolean),
      // A join + group-by rather than a correlated subselect: Drizzle leaves columns
      // unqualified in single-table queries, which would bind the subselect's "id" wrongly.
      units: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`.mapWith(Number),
    })
    .from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(where)
    .groupBy(orders.id)
    .orderBy(desc(orders.createdAt), desc(orders.id))
    .limit(PAGE_SIZE + 1);
  const page = rows.slice(0, PAGE_SIZE);
  const last = page[page.length - 1];
  return {
    rows: page,
    nextCursor: rows.length > PAGE_SIZE && last ? `${last.createdAt.toISOString()}_${last.id}` : undefined,
  };
}

export async function getAdminOrder(orderNumber: string) {
  await requireAdmin();
  const [order] = await db
    .select({ order: orders, customerName: user.name, customerEmail: user.email })
    .from(orders)
    .leftJoin(user, eq(orders.userId, user.id))
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);
  if (!order) return null;
  const [items, events] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, order.order.id)).orderBy(orderItems.id),
    db
      .select({
        id: orderEvents.id,
        fromStatus: orderEvents.fromStatus,
        toStatus: orderEvents.toStatus,
        actorName: user.name,
        createdAt: orderEvents.createdAt,
      })
      .from(orderEvents)
      .leftJoin(user, eq(orderEvents.actorId, user.id))
      .where(eq(orderEvents.orderId, order.order.id))
      .orderBy(asc(orderEvents.createdAt), asc(orderEvents.id)),
  ]);
  return { ...order.order, customerName: order.customerName, customerEmail: order.customerEmail, items, events };
}

/* ------------------------------- dashboard ------------------------------ */
export async function getDashboard() {
  await requireAdmin();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [[o], [p], recent] = await Promise.all([
    db
      .select({
        awaiting: sql<number>`count(*) filter (where ${orders.status} = 'confirmed')`.mapWith(Number),
        weekOrders: sql<number>`count(*) filter (where ${orders.createdAt} >= ${weekAgo} and ${orders.status} <> 'cancelled')`.mapWith(Number),
        weekRevenue: sql<number>`coalesce(sum(${orders.totalCents}) filter (where ${orders.createdAt} >= ${weekAgo} and ${orders.status} <> 'cancelled'), 0)`.mapWith(Number),
      })
      .from(orders),
    db
      .select({
        active: sql<number>`count(*) filter (where ${products.archivedAt} is null)`.mapWith(Number),
        archived: sql<number>`count(*) filter (where ${products.archivedAt} is not null)`.mapWith(Number),
        low: sql<number>`count(*) filter (where ${products.archivedAt} is null and coalesce(${stock.quantity}, 0) > 0 and coalesce(${stock.quantity}, 0) <= ${LOW_STOCK_THRESHOLD})`.mapWith(Number),
        out: sql<number>`count(*) filter (where ${products.archivedAt} is null and coalesce(${stock.quantity}, 0) = 0)`.mapWith(Number),
      })
      .from(products)
      .leftJoin(stock, eq(stock.productId, products.id)),
    db
      .select({
        orderNumber: orders.orderNumber,
        status: orders.status,
        totalCents: orders.totalCents,
        shipName: orders.shipName,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5),
  ]);
  return { ...o, ...p, recent };
}
