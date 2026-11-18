import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JournalCard } from "@/components/journal/journal-card";
import { formatPostDate, getJournalPosts } from "@/lib/journal";

export const metadata: Metadata = {
  title: "Journal",
  description: "Stories on style, fabric and the way we make things.",
};

export default async function JournalPage() {
  const [lead, ...rest] = await getJournalPosts();

  return (
    <main id="main">
      <section aria-labelledby="journal-title" className="section">
        <div className="container-page">
          <header className="mb-10 lg:mb-14">
            <p className="eyebrow mb-3">The Journal</p>
            <h1 id="journal-title">Stories on style</h1>
            <p className="mt-4 text-ink-muted">Notes on fabric, craft and the way we dress.</p>
          </header>

          {!lead ? (
            <div className="divider py-16 text-center">
              <p className="mx-auto text-ink-muted">New stories are on their way.</p>
            </div>
          ) : (
            <>
              <Link href={`/journal/${lead.slug}`} className="group grid bg-surface lg:grid-cols-2">
                <div className="relative aspect-[3/2] overflow-hidden lg:aspect-auto lg:min-h-[28rem]">
                  <Image
                    src={lead.coverSrc}
                    alt={lead.coverAlt}
                    fill
                    preload
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-ui group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center p-6 sm:p-10 lg:p-16">
                  <div className="max-w-lg">
                    <p className="eyebrow">Latest · {formatPostDate(lead.publishedAt)}</p>
                    <h2 className="mt-4 text-[clamp(1.75rem,1.2rem+2vw,3rem)]">{lead.title}</h2>
                    <p className="mt-4 text-ink-muted">{lead.excerpt}</p>
                    <span className="label mt-8 inline-block border-b border-ink pb-1">Read the story</span>
                  </div>
                </div>
              </Link>

              {rest.length > 0 && (
                <ul className="mt-12 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
                  {rest.map((post) => (
                    <li key={post.slug}>
                      <JournalCard post={post} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
