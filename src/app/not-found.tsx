import type { Metadata } from "next";
import { NotFoundView } from "@/components/layout/not-found-view";
import { ShopChrome } from "@/components/layout/shop-chrome";

export const metadata: Metadata = { title: "Page not found" };

// Handles URLs that match no route, and notFound() calls outside the storefront
// (for example a non-admin visiting /admin). It sits above the (shop) layout, so it
// brings its own header and footer.
export default function RootNotFound() {
  return (
    <ShopChrome>
      <NotFoundView />
    </ShopChrome>
  );
}
