"use client";

import { useActionState } from "react";
import { saveProduct } from "@/app/actions/admin/products";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { Field } from "@/components/ui/field";
import type { AdminActionState } from "@/lib/admin/types";
import { IMAGE_SLOTS } from "@/lib/admin/validation";

export type ProductFormData = {
  id: number;
  slug: string;
  name: string;
  categoryId: number;
  priceCents: number;
  description: string;
  details: string[];
  sizes: string[] | null;
  images: { src: string; alt: string }[];
  isNew: boolean;
  isFeatured: boolean;
};

export function ProductForm({
  categories,
  product,
}: {
  categories: { id: number; name: string }[];
  product?: ProductFormData;
}) {
  const [state, formAction] = useActionState<AdminActionState, FormData>(saveProduct, {});
  const v = state.values;
  const err = state.fieldErrors ?? {};
  const val = (key: string, fallback: string) => v?.[key] ?? fallback;
  const checked = (key: string, fallback: boolean) => (v ? v[key] === "on" : fallback);

  return (
    <form action={formAction} className="space-y-10" noValidate>
      {product && <input type="hidden" name="id" value={product.id} />}
      <FormMessage error={state.error} success={state.success} />

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-5 font-display text-2xl sm:col-span-2">Details</legend>
        <Field label="Name" name="name" error={err.name} defaultValue={val("name", product?.name ?? "")} className="sm:col-span-2" />
        <Field
          label="Slug"
          name="slug"
          required={false}
          error={err.slug}
          hint="The product's web address. Leave blank to generate it from the name."
          defaultValue={val("slug", product?.slug ?? "")}
        />
        <Field label="Category" name="categoryId" as="select" error={err.categoryId} defaultValue={val("categoryId", String(product?.categoryId ?? ""))}>
          <option value="" disabled>Choose a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Field>
        <Field
          label="Price (USD)"
          name="price"
          error={err.price}
          hint="Whole dollars or dollars and cents, e.g. 1450 or 1450.00."
          defaultValue={val("price", product ? (product.priceCents / 100).toFixed(2) : "")}
        />
        {!product && (
          <Field label="Starting stock" name="initialStock" type="number" min="0" required={false} error={err.initialStock} hint="Units on hand now. Change it later from the Stock page." defaultValue={val("initialStock", "0")} />
        )}
        <Field label="Description" name="description" as="textarea" rows={5} error={err.description} defaultValue={val("description", product?.description ?? "")} className="sm:col-span-2" />
        <Field label="Details" name="details" as="textarea" rows={5} required={false} hint="One bullet point per line." defaultValue={val("details", product?.details.join("\n") ?? "")} className="sm:col-span-2" />
        <Field label="Sizes" name="sizes" required={false} hint="Comma separated, e.g. XS, S, M, L. Leave blank for one-size items." defaultValue={val("sizes", product?.sizes?.join(", ") ?? "")} className="sm:col-span-2" />
        <div className="flex flex-wrap gap-8 sm:col-span-2">
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="isNew" defaultChecked={checked("isNew", product?.isNew ?? false)} className="size-4 accent-ink" />
            Show &ldquo;New&rdquo; tag
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="isFeatured" defaultChecked={checked("isFeatured", product?.isFeatured ?? false)} className="size-4 accent-ink" />
            Feature on the homepage
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-6">
        <legend className="mb-2 font-display text-2xl">Images</legend>
        <p className="text-sm text-ink-muted">
          The first image is the main one. Use https://images.unsplash.com/photo-… URLs. Leave unused rows blank.
        </p>
        {Array.from({ length: IMAGE_SLOTS }, (_, i) => (
          <div key={i} className="grid gap-4 sm:grid-cols-2">
            <Field label={`Image ${i + 1} URL`} name={`imageSrc_${i}`} required={false} error={err[`imageSrc_${i}`]} defaultValue={val(`imageSrc_${i}`, product?.images[i]?.src ?? "")} />
            <Field label={`Image ${i + 1} description`} name={`imageAlt_${i}`} required={false} error={err[`imageAlt_${i}`]} defaultValue={val(`imageAlt_${i}`, product?.images[i]?.alt ?? "")} />
          </div>
        ))}
      </fieldset>

      <div className="flex items-center gap-4">
        <SubmitButton>{product ? "Save changes" : "Create product"}</SubmitButton>
      </div>
    </form>
  );
}
