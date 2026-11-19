import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ActionForm } from "@/components/admin/action-form";
import { AdminSkeleton } from "@/components/admin/admin-skeleton";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { SubmitButton } from "@/components/admin/submit-button";
import { StockIndicator } from "@/components/product/stock-indicator";
import { Badge } from "@/components/ui/badge";
import { deleteProduct, setProductArchived } from "@/app/actions/admin/products";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminProduct, getCategoryOptions } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Edit product" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function EditProductPage({ params, searchParams }: Props) {
  return (
    <main id="main">
      <Suspense fallback={<AdminSkeleton />}>
        <EditProduct params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function EditProduct({ params, searchParams }: Props) {
  await requireAdmin();
  const [{ id: idRaw }, sp] = await Promise.all([params, searchParams]);
  const id = Number(idRaw);
  if (!Number.isInteger(id)) notFound();
  const [product, categories] = await Promise.all([getAdminProduct(id), getCategoryOptions()]);
  if (!product) notFound();
  const archived = product.archivedAt !== null;

  return (
    <>
      <PageHeader
        title={product.name}
        actions={
          <>
            <Link href="/admin/products" className="btn btn-secondary">Back to products</Link>
            {!archived && <Link href={`/products/${product.slug}`} className="btn btn-secondary">View in store</Link>}
          </>
        }
      >
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <StockIndicator stock={product.stock} />
          {archived && <Badge tone="danger">Archived</Badge>}
          <Link href="/admin/stock" className="link text-sm">Manage stock</Link>
        </div>
      </PageHeader>

      {sp.created && <p role="status" className="mb-6 max-w-3xl border border-line-strong p-4 text-sm">Product created.</p>}

      <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="max-w-3xl">
          <ProductForm
            categories={categories}
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              categoryId: product.categoryId,
              priceCents: product.priceCents,
              description: product.description,
              details: product.details,
              sizes: product.sizes,
              images: product.images,
              isNew: product.isNew,
              isFeatured: product.isFeatured,
            }}
          />
        </div>

        <aside className="space-y-8 self-start">
          <section className="bg-surface p-6">
            <h2 className="mb-2 text-2xl">{archived ? "Restore" : "Archive"}</h2>
            <p className="mb-4 text-sm text-ink-muted">
              {archived
                ? "Put this product back on sale."
                : "Hide this product from the storefront. Existing orders are unaffected and you can restore it any time. Anything in customers' bags shows as sold out."}
            </p>
            <ActionForm action={setProductArchived} fields={{ id: product.id, archive: archived ? "0" : "1" }}>
              {archived ? (
                <SubmitButton className="btn btn-primary">Restore product</SubmitButton>
              ) : (
                <ConfirmButton title="Archive this product?" description="It will disappear from the storefront until you restore it." confirmLabel="Archive">
                  Archive product
                </ConfirmButton>
              )}
            </ActionForm>
          </section>

          <section className="bg-surface p-6">
            <h2 className="mb-2 text-2xl">Delete</h2>
            {product.orderRefs > 0 ? (
              <p className="text-sm text-ink-muted">
                This product appears in {product.orderRefs} past order line{product.orderRefs === 1 ? "" : "s"}, so it can only be archived.
              </p>
            ) : (
              <>
                <p className="mb-4 text-sm text-ink-muted">Permanently remove this product, its stock, and its place in collections and bags.</p>
                <ActionForm action={deleteProduct} fields={{ id: product.id }}>
                  <ConfirmButton title="Delete this product?" description="This can't be undone." confirmLabel="Delete">
                    Delete product
                  </ConfirmButton>
                </ActionForm>
              </>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
