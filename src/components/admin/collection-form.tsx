"use client";

import { useActionState } from "react";
import { saveCollection } from "@/app/actions/admin/collections";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { Field } from "@/components/ui/field";
import type { AdminActionState } from "@/lib/admin/types";

export type CollectionFormData = {
  id: number;
  slug: string;
  name: string;
  blurb: string;
  imageSrc: string;
  imageAlt: string;
  sortOrder: number;
};

export type MemberRow = { id: number; name: string; category: string; archived: boolean; member: boolean; position: number };

export function CollectionForm({ collection, members }: { collection?: CollectionFormData; members?: MemberRow[] }) {
  const [state, formAction] = useActionState<AdminActionState, FormData>(saveCollection, {});
  const v = state.values;
  const err = state.fieldErrors ?? {};
  const val = (key: string, fallback: string) => v?.[key] ?? fallback;

  return (
    <form action={formAction} className="space-y-10" noValidate>
      {collection && <input type="hidden" name="id" value={collection.id} />}
      <FormMessage error={state.error} success={state.success} />

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-5 font-display text-2xl sm:col-span-2">Collection</legend>
        <Field label="Name" name="name" error={err.name} defaultValue={val("name", collection?.name ?? "")} />
        <Field label="Slug" name="slug" required={false} error={err.slug} hint="Becomes /collections/<slug>. Leave blank to generate it." defaultValue={val("slug", collection?.slug ?? "")} />
        <Field label="Short description" name="blurb" error={err.blurb} defaultValue={val("blurb", collection?.blurb ?? "")} className="sm:col-span-2" />
        <Field label="Image URL" name="imageSrc" error={err.imageSrc} hint="Shown on the homepage tile. Use an https://images.unsplash.com/photo-… URL." defaultValue={val("imageSrc", collection?.imageSrc ?? "")} className="sm:col-span-2" />
        <Field label="Image description" name="imageAlt" error={err.imageAlt} defaultValue={val("imageAlt", collection?.imageAlt ?? "")} />
        <Field label="Sort order" name="sortOrder" type="number" min="0" required={false} error={err.sortOrder} hint="Lower numbers appear first on the homepage." defaultValue={val("sortOrder", String(collection?.sortOrder ?? 0))} />
      </fieldset>

      {members && (
        <fieldset>
          <legend className="mb-2 font-display text-2xl">Products</legend>
          <p className="mb-5 text-sm text-ink-muted">Tick the products in this collection. Lower positions show first.</p>
          <div className="box-hairline overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="w-12">In</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th className="w-28">Position</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <input type="checkbox" name={`member_${m.id}`} value="1" defaultChecked={m.member} className="size-4 accent-ink" aria-label={`Include ${m.name}`} />
                    </td>
                    <td>
                      {m.name} {m.archived && <span className="ml-2 text-ink-subtle">(archived)</span>}
                    </td>
                    <td className="text-ink-muted">{m.category}</td>
                    <td>
                      <input type="number" min="0" name={`pos_${m.id}`} defaultValue={m.position} className="field min-h-10! w-24 py-1!" aria-label={`Position of ${m.name}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </fieldset>
      )}

      <SubmitButton>{collection ? "Save changes" : "Create collection"}</SubmitButton>
    </form>
  );
}
