// Journal data access (Server Components only). Cached and tagged "journal".
import { desc, eq, ne } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { journalPosts } from "@/db/schema";

export type JournalPostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  coverSrc: string;
  coverAlt: string;
  publishedAt: Date;
};

export type JournalPostFull = JournalPostSummary & { paragraphs: string[] };

const summaryColumns = {
  slug: journalPosts.slug,
  title: journalPosts.title,
  excerpt: journalPosts.excerpt,
  coverSrc: journalPosts.coverSrc,
  coverAlt: journalPosts.coverAlt,
  publishedAt: journalPosts.publishedAt,
};

export async function getJournalPosts(): Promise<JournalPostSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("journal");

  return db.select(summaryColumns).from(journalPosts).orderBy(desc(journalPosts.publishedAt));
}

export async function getAllJournalSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("journal");

  const rows = await db.select({ slug: journalPosts.slug }).from(journalPosts);
  return rows.map((r) => r.slug);
}

export async function getJournalPost(slug: string): Promise<JournalPostFull | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("journal");

  const [row] = await db
    .select({ ...summaryColumns, body: journalPosts.body })
    .from(journalPosts)
    .where(eq(journalPosts.slug, slug))
    .limit(1);
  if (!row) return null;
  const { body, ...rest } = row;
  return { ...rest, paragraphs: body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) };
}

export async function getMoreJournalPosts(slug: string, limit = 3): Promise<JournalPostSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("journal");

  return db
    .select(summaryColumns)
    .from(journalPosts)
    .where(ne(journalPosts.slug, slug))
    .orderBy(desc(journalPosts.publishedAt))
    .limit(limit);
}

export const formatPostDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
