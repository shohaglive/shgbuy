import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deleteCollection } from "@/app/actions/admin/collections";
import { ActionForm } from "@/components/admin/action-form";
import { AdminSkeleton } from "@/components/admin/admin-skeleton";
import { CollectionForm } from "@/components/admin/collection-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminCollection } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Edit collection" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function EditCollectionPage({ params, searchParams }: Props) {
  return (
    <main id="main">
      <Suspense fallback={<AdminSkeleton />}>
        <EditCollection params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function EditCollection({ params, searchParams }: Props) {
  await requireAdmin();
  const [{ id: idRaw }, sp] = await Promise.all([params, searchParams]);
  const id = Number(idRaw);
  if (!Number.isInteger(id)) notFound();
  const data = await getAdminCollection(id);
  if (!data) notFound();
  const { collection, products } = data;

  return (
    <>
      <PageHeader
        title={collection.name}
        actions={
          <>
            <Link href="/admin/collections" className="btn btn-secondary">Back to collections</Link>
            <Link href={`/collections/${collection.slug}`} className="btn btn-secondary">View in store</Link>
          </>
        }
      />
      {sp.created && <p role="status" className="mb-6 max-w-3xl border border-line-strong p-4 text-sm">Collection created. Now choose its products below.</p>}
      <div className="max-w-3xl">
        <CollectionForm
          collection={{
            id: collection.id,
            slug: collection.slug,
            name: collection.name,
            blurb: collection.blurb,
            imageSrc: collection.imageSrc,
            imageAlt: collection.imageAlt,
            sortOrder: collection.sortOrder,
          }}
          members={products.map((p) => ({ id: p.id, name: p.name, category: p.category, archived: p.archivedAt !== null, member: p.member, position: p.position }))}
        />
        <section className="mt-12 bg-surface p-6">
          <h2 className="mb-2 text-2xl">Delete</h2>
          <p className="mb-4 text-sm text-ink-muted">Removes the collection and its page. Products are not deleted.</p>
          <ActionForm action={deleteCollection} fields={{ id: collection.id }}>
            <ConfirmButton title={`Delete ${collection.name}?`} description="Its page will stop working. This can't be undone." confirmLabel="Delete">
              Delete collection
            </ConfirmButton>
          </ActionForm>
        </section>
      </div>
    </>
  );
}
