import { Suspense } from "react";
import { Collections } from "@/components/home/collections";
import { Editorial } from "@/components/home/editorial";
import { FeaturedProducts, FeaturedProductsSkeleton } from "@/components/home/featured-products";
import { Hero } from "@/components/home/hero";
import { Lookbook } from "@/components/home/lookbook";
import { Newsletter } from "@/components/home/newsletter";
import { Services } from "@/components/home/services";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Collections />
      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>
      <Editorial />
      <Lookbook />
      <Services />
      <Newsletter />
    </main>
  );
}
