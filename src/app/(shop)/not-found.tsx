import type { Metadata } from "next";
import { NotFoundView } from "@/components/layout/not-found-view";

export const metadata: Metadata = { title: "Page not found" };

// Rendered inside the storefront layout when a shop page calls notFound().
export default function ShopNotFound() {
  return <NotFoundView />;
}
