import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminNav, AdminNavFallback } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin | shgbuy" },
  robots: { index: false, follow: false },
};

// Shell only. It does NOT authorize anyone: every admin page and Server Action
// calls requireAdmin() itself (src/lib/admin-auth.ts), because layouts don't
// re-run on navigation and Server Actions are public endpoints.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)]">
      <aside className="border-b border-line bg-surface px-4 py-4 lg:min-h-svh lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
        <Link href="/admin" className="mb-4 block font-display text-2xl uppercase tracking-[0.28em] lg:mb-10">
          shgbuy
        </Link>
        <Suspense fallback={<AdminNavFallback />}>
          <AdminNav />
        </Suspense>
        <div className="mt-4 hidden border-t border-line pt-4 lg:mt-10 lg:block">
          <Link href="/" className="link block py-1 text-sm text-ink-muted hover:text-ink">View store</Link>
          <Link href="/account" className="link block py-1 text-sm text-ink-muted hover:text-ink">My account</Link>
        </div>
      </aside>
      <div className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</div>
    </div>
  );
}
