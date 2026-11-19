import { Suspense } from "react";
import { BagLink, BagLinkView } from "@/components/cart/bag-link";
import { AccountLabel, AccountLink, AccountLinkView } from "@/components/layout/account-link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

/** Storefront frame: skip link, header, page, footer. Used by the (shop) layout and the root 404. */
export function ShopChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-canvas focus:p-3">
        Skip to content
      </a>
      <Header
        bag={
          <Suspense fallback={<BagLinkView />}>
            <BagLink />
          </Suspense>
        }
        account={
          <Suspense fallback={<AccountLinkView />}>
            <AccountLink />
          </Suspense>
        }
        accountLabel={
          <Suspense fallback="Account">
            <AccountLabel />
          </Suspense>
        }
      />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
