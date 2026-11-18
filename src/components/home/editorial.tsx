import Image from "next/image";
import Link from "next/link";
import { editorial } from "@/lib/catalog";

export function Editorial() {
  return (
    <section aria-labelledby="editorial-title" className="bg-surface">
      <div className="grid lg:grid-cols-2">
        <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[44rem]">
          <Image
            src={editorial.image}
            alt={editorial.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-top"
          />
        </div>
        <div className="flex items-center px-4 py-14 sm:px-8 lg:px-20 lg:py-24">
          <div className="max-w-lg">
            <p className="eyebrow">{editorial.eyebrow}</p>
            <h2 id="editorial-title" className="mt-4 text-[clamp(2rem,1.2rem+2.6vw,3.5rem)]">
              {editorial.title}
            </h2>
            <p className="mt-6 text-ink-muted">{editorial.body}</p>
            <Link href={editorial.href} className="btn btn-primary mt-8 w-full sm:w-auto">
              {editorial.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
