import Link from "next/link";
import { ArrowIcon } from "@/components/ui/icons";

export function SectionHeading({
  id,
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 lg:mb-12">
      <div>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 id={id}>{title}</h2>
      </div>
      {href && (
        <Link href={href} className="btn btn-ghost hidden shrink-0 border-b border-b-ink sm:inline-flex">
          {linkLabel} <ArrowIcon />
        </Link>
      )}
    </div>
  );
}
