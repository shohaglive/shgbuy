"use server";

import { eq, sql } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { categories, orderItems, products } from "@/db/schema";
import { requireAdminAction } from "@/lib/admin-auth";
import { refreshCatalog } from "@/lib/admin/revalidate";
import type { AdminActionState } from "@/lib/admin/types";
import {
  ALLOWED_IMAGE_HINT,
  IMAGE_SLOTS,
  formInt,
  formString,
  isAllowedImageUrl,
  isValidSlug,
  parseDollarsToCents,
  parseLines,
  parseSizes,
  pgErrorCode,
  slugify,
} from "@/lib/admin/validation";

/** Create (no `id` field) or update (`id` present) a product. Stock is only set on create; use the Stock page afterwards. */
export async function saveProduct(_prev: AdminActionState, fd: FormData): Promise<AdminActionState> {
  const admin = await requireAdminAction();

  const idRaw = formString(fd, "id", 20);
  const id = idRaw ? Number(idRaw) : null;
  const values: Record<string, string> = {
    name: formString(fd, "name", 120),
    slug: formString(fd, "slug", 80),
    categoryId: formString(fd, "categoryId", 20),
    price: formString(fd, "price", 20),
    description: formString(fd, "description", 3000),
    details: formString(fd, "details", 3000),
    sizes: formString(fd, "sizes", 300),
    isNew: fd.get("isNew") ? "on" : "",
    isFeatured: fd.get("isFeatured") ? "on" : "",
    initialStock: formString(fd, "initialStock", 10),
  };
  for (let i = 0; i < IMAGE_SLOTS; i++) {
    values[`imageSrc_${i}`] = formString(fd, `imageSrc_${i}`, 500);
    values[`imageAlt_${i}`] = formString(fd, `imageAlt_${i}`, 200);
  }

  const fieldErrors: Record<string, string> = {};
  if (values.name.length < 2) fieldErrors.name = "Enter a product name.";
  const slug = slugify(values.slug || values.name);
  if (!isValidSlug(slug)) fieldErrors.slug = "Slug can only contain lowercase letters, numbers and hyphens.";
  const categoryId = Number(values.categoryId);
  if (!Number.isInteger(categoryId) || categoryId < 1) fieldErrors.categoryId = "Choose a category.";
  const priceCents = parseDollarsToCents(values.price);
  if (priceCents === null) fieldErrors.price = "Enter a price like 1450 or 1450.00.";
  if (values.description.length < 10) fieldErrors.description = "Write a short description (at least 10 characters).";

  const images: { src: string; alt: string }[] = [];
  for (let i = 0; i < IMAGE_SLOTS; i++) {
    const src = values[`imageSrc_${i}`];
    const alt = values[`imageAlt_${i}`];
    if (!src && !alt) continue;
    if (!src || !isAllowedImageUrl(src)) fieldErrors[`imageSrc_${i}`] = ALLOWED_IMAGE_HINT;
    if (!alt) fieldErrors[`imageAlt_${i}`] = "Describe the image for screen readers.";
    images.push({ src, alt });
  }
  if (images.length === 0) fieldErrors.imageSrc_0 = "Add at least one image. " + ALLOWED_IMAGE_HINT;

  let initialStock = 0;
  if (id === null) {
    const n = values.initialStock === "" ? 0 : formInt(fd, "initialStock");
    if (n === null || n < 0 || n > 100000) fieldErrors.initialStock = "Enter a whole number from 0 to 100000.";
    else initialStock = n;
  }

  if (!fieldErrors.categoryId) {
    const [cat] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, categoryId)).limit(1);
    if (!cat) fieldErrors.categoryId = "That category no longer exists.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please check the highlighted fields.", fieldErrors, values };
  }

  const data = {
    slug,
    name: values.name,
    categoryId,
    priceCents: priceCents!,
    description: values.description,
    details: parseLines(values.details),
    sizes: parseSizes(values.sizes),
    images,
    isNew: values.isNew === "on",
    isFeatured: values.isFeatured === "on",
  };

  try {
    if (id !== null) {
      await db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id));
    } else {
      const statements: BatchItem<"pg">[] = [
        db.insert(products).values(data),
        // A batch can't use an id returned by an earlier statement, so look the new row up by its unique slug.
        db.execute(sql`insert into stock (product_id, quantity) select id, ${initialStock}::int from products where slug = ${slug}`),
      ];
      if (initialStock > 0) {
        statements.push(
          db.execute(
            sql`insert into stock_movements (product_id, delta, reason, note, actor_id) select id, ${initialStock}::int, 'initial', 'Product created', ${admin.id}::text from products where slug = ${slug}`,
          ),
        );
      }
      await db.batch(statements as [BatchItem<"pg">, ...BatchItem<"pg">[]]);
    }
  } catch (e) {
    if (pgErrorCode(e) === "23505") {
      return { error: "Please check the highlighted fields.", fieldErrors: { slug: "That slug is already used by another product." }, values };
    }
    console.error("saveProduct failed", e);
    return { error: "Couldn't save the product. Please try again.", values };
  }

  refreshCatalog();
  revalidatePath("/admin/products");
  if (id === null) {
    const [created] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
    redirect(`/admin/products/${created.id}?created=1`);
  }
  return { success: "Product saved.", values };
}

/** Take a product off sale (archive=1) or put it back (archive=0). Reversible. */
export async function setProductArchived(_prev: AdminActionState, fd: FormData): Promise<AdminActionState> {
  await requireAdminAction();
  const id = formInt(fd, "id");
  if (id === null) return { error: "Invalid product." };
  const archive = fd.get("archive") === "1";
  await db
    .update(products)
    .set({ archivedAt: archive ? new Date() : null, updatedAt: new Date() })
    .where(eq(products.id, id));
  refreshCatalog();
  revalidatePath("/admin/products");
  return { success: archive ? "Archived. It's hidden from the storefront." : "Restored to the storefront." };
}

/** Permanently delete a product, only if no order has ever referenced it (otherwise archive). */
export async function deleteProduct(_prev: AdminActionState, fd: FormData): Promise<AdminActionState> {
  await requireAdminAction();
  const id = formInt(fd, "id");
  if (id === null) return { error: "Invalid product." };
  const [{ refs }] = await db
    .select({ refs: sql<number>`count(*)`.mapWith(Number) })
    .from(orderItems)
    .where(eq(orderItems.productId, id));
  if (refs > 0) return { error: "This product appears in past orders, so it can't be deleted. Archive it instead." };
  await db.delete(products).where(eq(products.id, id));
  refreshCatalog();
  revalidatePath("/admin/products");
  redirect("/admin/products");
}
