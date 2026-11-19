import { ShopChrome } from "@/components/layout/shop-chrome";

// Storefront chrome. The admin area (src/app/admin) has its own shell.
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <ShopChrome>{children}</ShopChrome>;
}
