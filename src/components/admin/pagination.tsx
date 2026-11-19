import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";

/** Previous/next links. Callers build the hrefs (page number or keyset cursor) and keep their filters in them. */
export function Pagination({ prevHref, nextHref }: { prevHref?: string; nextHref?: string }) {
  if (!prevHref && !nextHref) return null;
  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between">
      {prevHref ? (
        <Link href={prevHref} className="btn btn-secondary">
          <ChevronLeftIcon /> Previous
        </Link>
      ) : (
        <span />
      )}
      {nextHref ? (
        <Link href={nextHref} className="btn btn-secondary">
          Next <ChevronRightIcon />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
