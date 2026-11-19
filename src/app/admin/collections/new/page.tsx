import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminSkeleton } from "@/components/admin/admin-skeleton";
import { CollectionForm } from "@/components/admin/collection-form";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "New collection" };

export default function NewCollectionPage() {
  return (
    <main id="main">
      <Suspense fallback={<AdminSkeleton />}>
        <NewCollection />
      </Suspense>
    </main>
  );
}

async function NewCollection() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="New collection" actions={<Link href="/admin/collections" className="btn btn-secondary">Back to collections</Link>} />
      <p className="mb-8 max-w-2xl text-sm text-ink-muted">Create the collection first, then choose its products on the next screen.</p>
      <div className="max-w-3xl"><CollectionForm /></div>
    </>
  );
}
