import Image from "next/image";
import Link from "next/link";
import { lookbook } from "@/lib/catalog";
import { SectionHeading } from "./section-heading";

export function Lookbook() {
  return (
    <section aria-labelledby="lookbook-title" className="section">
      <div className="container-page">
        <SectionHeading id="lookbook-title" eyebrow="Lookbook" title="Stories in Colour" />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-5">
          {lookbook.map((l, i) => (
            <li key={l.title} className={i === 1 ? "sm:mt-12" : undefined}>
              <Link href={l.href} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                  <Image
                    src={l.image}
                    alt={l.alt}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-ui group-hover:scale-105"
                  />
                </div>
                <p className="label mt-4 flex items-center justify-between border-b border-line pb-3">
                  {l.title}
                  <span aria-hidden>→</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
