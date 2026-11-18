import Image from "next/image";
import Link from "next/link";
import { getCollections } from "@/lib/products";
import { SectionHeading } from "./section-heading";

export async function Collections() {
  const collections = await getCollections();

  return (
    <section aria-labelledby="collections-title" className="section">
      <div className="container-page">
        <SectionHeading id="collections-title" eyebrow="Shop by category" title="The Collections" />
        <ul className="grid gap-4 md:grid-cols-3 lg:gap-5">
          {collections.map((c, i) => (
            <li key={c.slug}>
              <Link href={`/collections/${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-surface">
                <Image
                  src={c.image}
                  alt={c.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-ui group-hover:scale-105"
                  loading={i === 0 ? "eager" : "lazy"}
                />
                <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-canvas">
                  <h3 className="text-3xl text-canvas">{c.name}</h3>
                  <p className="mt-1 text-sm text-canvas/85">{c.blurb}</p>
                  <span className="label mt-4 inline-block border-b border-canvas pb-1">Discover</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
