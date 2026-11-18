import Image from "next/image";
import Link from "next/link";
import { formatPostDate, type JournalPostSummary } from "@/lib/journal";

export function JournalCard({ post }: { post: JournalPostSummary }) {
  return (
    <Link href={`/journal/${post.slug}`} className="group block">
      <div className="relative aspect-[3/2] overflow-hidden bg-surface">
        <Image
          src={post.coverSrc}
          alt={post.coverAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-ui group-hover:scale-105"
        />
      </div>
      <p className="eyebrow mt-4">{formatPostDate(post.publishedAt)}</p>
      <h3 className="mt-2 underline-offset-4 group-hover:underline">{post.title}</h3>
      <p className="mt-2 text-sm text-ink-muted">{post.excerpt}</p>
    </Link>
  );
}
