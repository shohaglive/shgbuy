import type { Metadata } from "next";
import { Suspense } from "react";
import { deleteCategory, saveCategory } from "@/app/actions/admin/categories";
import { ActionForm } from "@/components/admin/action-form";
import { AdminSkeleton } from "@/components/admin/admin-skeleton";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { PageHeader } from "@/components/admin/page-header";
import { SubmitButton } from "@/components/admin/submit-button";
import { Field } from "@/components/ui/field";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminCategories } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Categories" };

export default function AdminCategoriesPage() {
  return (
    <main id="main">
      <Suspense fallback={<AdminSkeleton />}>
        <Categories />
      </Suspense>
    </main>
  );
}

async function Categories() {
  await requireAdmin();
  const rows = await getAdminCategories();

  return (
    <>
      <PageHeader title="Categories" />

      <section className="mb-12 max-w-3xl bg-surface p-6">
        <h2 className="mb-5 text-2xl">New category</h2>
        <ActionForm action={saveCategory}>
          <div className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <Field label="Name" id="new-name" name="name" />
            <Field label="Slug" id="new-slug" name="slug" required={false} hint="Leave blank to generate." />
            <SubmitButton pendingLabel="Adding...">Add</SubmitButton>
          </div>
        </ActionForm>
      </section>

      {rows.length === 0 ? (
        <p className="divider py-10 text-ink-muted">No categories yet.</p>
      ) : (
        <ul className="max-w-3xl space-y-4">
          {rows.map((c) => (
            <li key={c.id} className="box-hairline p-5">
              <ActionForm action={saveCategory} fields={{ id: c.id }}>
                <div className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]">
                  <Field label="Name" id={`name-${c.id}`} name="name" defaultValue={c.name} />
                  <Field label="Slug" id={`slug-${c.id}`} name="slug" defaultValue={c.slug} />
                  <SubmitButton className="btn btn-secondary">Save</SubmitButton>
                </div>
              </ActionForm>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm text-ink-muted">
                <span>{c.productCount} product{c.productCount === 1 ? "" : "s"}</span>
                {c.productCount === 0 ? (
                  <ActionForm action={deleteCategory} fields={{ id: c.id }}>
                    <ConfirmButton className="link text-sm text-danger" title={`Delete ${c.name}?`} description="This can't be undone." confirmLabel="Delete">
                      Delete
                    </ConfirmButton>
                  </ActionForm>
                ) : (
                  <span>Move its products before deleting.</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
