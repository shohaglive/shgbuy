import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignOutButton } from "@/components/account/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/lib/order-status";
import { getSessionUser } from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";
import { getUserOrders } from "@/lib/orders";

export const metadata: Metadata = { title: "My Account", robots: { index: false } };

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export default function AccountPage() {
  return (
    <main id="main">
      <section aria-labelledby="account-title" className="section">
        <div className="container-page">
          <Suspense fallback={<div aria-busy="true" className="h-96 animate-pulse bg-surface" />}>
            <AccountContents />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

async function AccountContents() {
  const user = await getSessionUser();
  if (!user) redirect("/account/login");
  const orders = await getUserOrders(user.id);

  return (
    <>
      <header className="mb-10 lg:mb-14">
        <p className="eyebrow mb-3">My Account</p>
        <h1 id="account-title">Hello, {user.name.split(" ")[0]}</h1>
      </header>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-20">
        <aside className="self-start bg-surface p-6">
          <h2 className="mb-6 text-2xl">Profile</h2>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="eyebrow">Name</dt>
              <dd className="mt-1">{user.name}</dd>
            </div>
            <div>
              <dt className="eyebrow">Email</dt>
              <dd className="mt-1 break-all">{user.email}</dd>
            </div>
          </dl>
          <div className="mt-8">
            <SignOutButton />
          </div>
        </aside>

        <div>
          <h2 className="mb-6 text-2xl">Orders</h2>
          {orders.length === 0 ? (
            <div className="divider py-12">
              <p className="text-ink-muted">You haven&rsquo;t placed any orders yet.</p>
              <Link href="/collections/new-arrivals" className="btn btn-primary mt-6">Start shopping</Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {orders.map((o) => (
                <li key={o.id} className="box-hairline p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <Link href={`/checkout/thank-you/${o.orderNumber}`} className="link font-medium">
                      {o.orderNumber}
                    </Link>
                    <p className="text-sm text-ink-muted">{dateFormat.format(o.createdAt)}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <ul className="flex gap-2">
                      {o.items.slice(0, 4).map((i) => (
                        <li key={i.id} className="media-product w-14">
                          <Image src={i.imageSrc} alt={i.name} fill sizes="56px" className="object-cover" />
                        </li>
                      ))}
                      {o.items.length > 4 && (
                        <li className="flex w-14 items-center justify-center bg-surface text-sm text-ink-muted">
                          +{o.items.length - 4}
                        </li>
                      )}
                    </ul>
                    <div className="text-right">
                      <p className="price">{formatPrice(o.totalCents)}</p>
                      <div className="mt-2 flex justify-end"><Badge tone={ORDER_STATUS_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge></div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
