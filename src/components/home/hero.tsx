import Image from "next/image";
import Link from "next/link";
import { heroSlide } from "@/lib/catalog";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[min(80svh,46rem)] items-end overflow-hidden bg-ink lg:min-h-[min(calc(100svh-7rem),56rem)]">
      <Image
        src={heroSlide.image}
        alt={heroSlide.alt}
        fill
        preload
        sizes="100vw"
        className="-z-10 object-cover object-[50%_20%]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/70 via-black/20 to-transparent lg:bg-[linear-gradient(to_right,rgba(0,0,0,0.5),transparent_60%),linear-gradient(to_top,rgba(0,0,0,0.6),transparent_50%)]" />

      <div className="container-page pb-12 pt-32 text-canvas lg:pb-20">
        <p className="eyebrow text-canvas/85">{heroSlide.eyebrow}</p>
        <h1 id="hero-title" className="mt-4 max-w-2xl text-[clamp(2.75rem,1.5rem+6vw,6rem)] leading-[1.02] text-canvas">
          {heroSlide.title}
        </h1>
        <p className="mt-5 max-w-md text-base text-canvas/90 sm:text-lg">{heroSlide.body}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={heroSlide.href} className="btn border-canvas bg-canvas text-ink hover:bg-transparent hover:text-canvas">
            Shop the collection
          </Link>
          <Link href="/collections/women" className="btn border-canvas text-canvas hover:bg-canvas hover:text-ink">
            Explore women
          </Link>
        </div>
      </div>
    </section>
  );
}
