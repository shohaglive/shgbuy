import Link from "next/link";
import { BagIcon } from "@/components/ui/icons";
import { getCartCount } from "@/lib/cart";

export function BagLinkView({ count }: { count?: number }) {
  return (
    <Link
      href="/cart"
      className="nav-link -mr-2 flex items-center gap-2 p-2 lg:mr-0 lg:p-0"
      aria-label={count === undefined ? "Bag" : `Bag, ${count} ${count === 1 ? "item" : "items"}`}
    >
      <BagIcon />
      <span className="hidden lg:inline">Bag{count === undefined ? "" : ` (${count})`}</span>
      {count !== undefined && count > 0 && (
        <span
          aria-hidden
          className="-ml-1 flex size-4 items-center justify-center rounded-full bg-ink text-[0.625rem] leading-none text-canvas lg:hidden"
        >
          {count}
        </span>
      )}
    </Link>
  );
}

/** Reads the cart cookie, so render it inside <Suspense>. */
export async function BagLink() {
  return <BagLinkView count={await getCartCount()} />;
}
