import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JournalCard } from "@/components/journal/journal-card";
import {
  formatPostDate,
  getAllJournalSlugs,
  getJournalPost,
  getMoreJournalPosts,
} from "@/lib/journal";

export async function generateStaticParams() {
  const slugs = await getAllJournalSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

// `params` is awaited inside <Suspense> so the shell stays URL-independent (see products page).
export default function JournalPostPage({ params }: PageProps<"/journal/[slug]">) {
  return (
    <main id="main">
      <Suspense fallback={<div aria-busy="true" className="container-page py-14"><div className="aspect-[16/7] animate-pulse bg-surface" /></div>}>
        <Article params={params} />
      </Suspense>
    </main>
  );
}

async function Article({ params }: Pick<PageProps<"/journal/[slug]">, "params">) {
  const { slug } = await params;
  const post = await getJournalPost(slug);
  if (!post) notFound();
  const more = await getMoreJournalPosts(post.slug);

  return (
    <>
      <div className="container-page pt-6 lg:pt-8">
        <nav aria-label="Breadcrumb" className="label text-ink-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:text-ink">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/journal" className="hover:text-ink">Journal</Link></li>
          </ol>
        </nav>
      </div>

      <article className="section">
        <header className="container-prose text-center">
          <p className="eyebrow">{formatPostDate(post.publishedAt)}</p>
          <h1 className="mt-4">{post.title}</h1>
          <p className="mx-auto mt-5 text-lg text-ink-muted">{post.excerpt}</p>
        </header>

        <div className="container-page my-10 lg:my-14">
          <div className="relative aspect-[3/2] overflow-hidden bg-surface lg:aspect-[16/7]">
            <Image src={post.coverSrc} alt={post.coverAlt} fill preload sizes="100vw" className="object-cover object-[50%_20%]" />
          </div>
        </div>

        <div className="container-prose space-y-6 text-lg leading-8 text-ink-muted">
          {post.paragraphs.map((p, i) => (
            <p key={i} className="max-w-none">{p}</p>
          ))}
        </div>

        <div className="container-prose mt-12 text-center">
          <Link href="/collections/new-arrivals" className="btn btn-primary">Shop new arrivals</Link>
        </div>
      </article>

      {more.length > 0 && (
        <section aria-labelledby="more-title" className="section divider">
          <div className="container-page">
            <h2 id="more-title" className="mb-8 lg:mb-12">More from the journal</h2>
            <ul className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => (
                <li key={p.slug}><JournalCard post={p} /></li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
