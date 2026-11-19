"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { categories, collections, products } from "@/db/schema";
import { requireAdminAction } from "@/lib/admin-auth";
import { refreshCatalog } from "@/lib/admin/revalidate";
import type { AdminActionState } from "@/lib/admin/types";
import { RESERVED_SLUGS, formInt, formString, isValidSlug, pgErrorCode, slugify } from "@/lib/admin/validation";

/** Create (no `id`) or rename (`id`) a category. */
export async function saveCategory(_prev: AdminActionState, fd: FormData): Promise<AdminActionState> {
  await requireAdminAction();
  const id = formInt(fd, "id");
  const name = formString(fd, "name", 60);
  const slug = slugify(formString(fd, "slug", 80) || name);

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Enter a name.";
  if (!isValidSlug(slug)) fieldErrors.slug = "Slug can only contain lowercase letters, numbers and hyphens.";
  else if (RESERVED_SLUGS.includes(slug)) fieldErrors.slug = "That slug is reserved.";
  else {
    // /collections/[slug] resolves collections first, so a clash would hide the category.
    const [clash] = await db.select({ id: collections.id }).from(collections).where(eq(collections.slug, slug)).limit(1);
    if (clash) fieldErrors.slug = "A collection already uses that slug.";
  }
  const values = { name, slug: formString(fd, "slug", 80) };
  // This form renders only `error` (no per-field slots), so surface the specific message.
  if (Object.keys(fieldErrors).length > 0) return { error: Object.values(fieldErrors)[0], fieldErrors, values };

  try {
    if (id !== null) await db.update(categories).set({ name, slug }).where(eq(categories.id, id));
    else await db.insert(categories).values({ name, slug });
  } catch (e) {
    if (pgErrorCode(e) === "23505") {
      return { error: "Another category already uses that slug.", fieldErrors: { slug: "Another category already uses that slug." }, values };
    }
    console.error("saveCategory failed", e);
    return { error: "Couldn't save the category. Please try again.", values };
  }
  refreshCatalog();
  revalidatePath("/admin/categories");
  return { success: id !== null ? "Category saved." : "Category created." };
}

export async function deleteCategory(_prev: AdminActionState, fd: FormData): Promise<AdminActionState> {
  await requireAdminAction();
  const id = formInt(fd, "id");
  if (id === null) return { error: "Invalid category." };
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)`.mapWith(Number) })
    .from(products)
    .where(eq(products.categoryId, id));
  if (n > 0) return { error: `This category still has ${n} product${n === 1 ? "" : "s"}. Move or delete them first.` };
  await db.delete(categories).where(eq(categories.id, id));
  refreshCatalog();
  revalidatePath("/admin/categories");
  return { success: "Category deleted." };
}
