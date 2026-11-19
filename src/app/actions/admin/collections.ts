"use server";

import { eq } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { categories, collectionProducts, collections } from "@/db/schema";
import { requireAdminAction } from "@/lib/admin-auth";
import { refreshCatalog } from "@/lib/admin/revalidate";
import type { AdminActionState } from "@/lib/admin/types";
import {
  ALLOWED_IMAGE_HINT,
  RESERVED_SLUGS,
  formInt,
  formString,
  isAllowedImageUrl,
  isValidSlug,
  pgErrorCode,
  slugify,
} from "@/lib/admin/validation";

/**
 * Create (no `id`) or update (`id`) a collection. On update the form also carries
 * `member_<productId>` checkboxes and `pos_<productId>` numbers that replace the membership.
 */
export async function saveCollection(_prev: AdminActionState, fd: FormData): Promise<AdminActionState> {
  await requireAdminAction();
  const id = formInt(fd, "id");
  const values = {
    name: formString(fd, "name", 60),
    slug: formString(fd, "slug", 80),
    blurb: formString(fd, "blurb", 200),
    imageSrc: formString(fd, "imageSrc", 500),
    imageAlt: formString(fd, "imageAlt", 200),
    sortOrder: formString(fd, "sortOrder", 6),
  };

  const fieldErrors: Record<string, string> = {};
  if (values.name.length < 2) fieldErrors.name = "Enter a name.";
  const slug = slugify(values.slug || values.name);
  if (!isValidSlug(slug)) fieldErrors.slug = "Slug can only contain lowercase letters, numbers and hyphens.";
  else if (RESERVED_SLUGS.includes(slug)) fieldErrors.slug = "That slug is reserved.";
  else {
    const [clash] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug)).limit(1);
    if (clash) fieldErrors.slug = "A category already uses that slug.";
  }
  if (values.blurb.length < 3) fieldErrors.blurb = "Add a short description.";
  if (!isAllowedImageUrl(values.imageSrc)) fieldErrors.imageSrc = ALLOWED_IMAGE_HINT;
  if (!values.imageAlt) fieldErrors.imageAlt = "Describe the image for screen readers.";
  const sortOrder = values.sortOrder === "" ? 0 : formInt(fd, "sortOrder");
  if (sortOrder === null || sortOrder < 0 || sortOrder > 9999) fieldErrors.sortOrder = "Enter a whole number from 0 to 9999.";
  if (Object.keys(fieldErrors).length > 0) return { error: "Please check the highlighted fields.", fieldErrors, values };

  const data = { slug, name: values.name, blurb: values.blurb, imageSrc: values.imageSrc, imageAlt: values.imageAlt, sortOrder: sortOrder! };

  try {
    if (id === null) {
      const [created] = await db.insert(collections).values(data).returning({ id: collections.id });
      refreshCatalog();
      revalidatePath("/admin/collections");
      redirect(`/admin/collections/${created.id}?created=1`);
    }
    const links: { collectionId: number; productId: number; position: number }[] = [];
    for (const [key, value] of fd.entries()) {
      if (!key.startsWith("member_") || !value) continue;
      const productId = Number(key.slice(7));
      if (!Number.isInteger(productId)) continue;
      const pos = Number(fd.get(`pos_${productId}`));
      links.push({ collectionId: id, productId, position: Number.isInteger(pos) && pos >= 0 ? pos : 0 });
    }
    const statements: BatchItem<"pg">[] = [
      db.update(collections).set(data).where(eq(collections.id, id)),
      db.delete(collectionProducts).where(eq(collectionProducts.collectionId, id)),
    ];
    if (links.length > 0) statements.push(db.insert(collectionProducts).values(links));
    await db.batch(statements as [BatchItem<"pg">, ...BatchItem<"pg">[]]);
  } catch (e) {
    if ((e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw e;
    if (pgErrorCode(e) === "23505") {
      return { error: "Please check the highlighted fields.", fieldErrors: { slug: "Another collection already uses that slug." }, values };
    }
    console.error("saveCollection failed", e);
    return { error: "Couldn't save the collection. Please try again.", values };
  }
  refreshCatalog();
  revalidatePath("/admin/collections");
  return { success: "Collection saved.", values };
}

export async function deleteCollection(_prev: AdminActionState, fd: FormData): Promise<AdminActionState> {
  await requireAdminAction();
  const id = formInt(fd, "id");
  if (id === null) return { error: "Invalid collection." };
  await db.delete(collections).where(eq(collections.id, id));
  refreshCatalog();
  revalidatePath("/admin/collections");
  redirect("/admin/collections");
}
