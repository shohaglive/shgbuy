// Input parsing for admin forms. Everything here is pure and server-side.

/** Slugs that belong to fixed routes and can't be used by a category or collection. */
export const RESERVED_SLUGS = ["new-arrivals"];

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const isValidSlug = (s: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);

/** "1,234.50" or "$20" -> cents. Returns null for anything that isn't a plain non-negative amount. */
export function parseDollarsToCents(input: string): number | null {
  const cleaned = input.trim().replace(/^\$/, "").replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const cents = Math.round(parseFloat(cleaned) * 100);
  return Number.isSafeInteger(cents) && cents <= 100_000_000 ? cents : null;
}

export function parseLines(text: string, max = 20): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim().slice(0, 200))
    .filter(Boolean)
    .slice(0, max);
}

/** Comma or newline separated sizes. Empty input means a one-size product (null). */
export function parseSizes(text: string): string[] | null {
  const sizes = [...new Set(text.split(/[,\n]/).map((s) => s.trim().slice(0, 20)).filter(Boolean))].slice(0, 20);
  return sizes.length > 0 ? sizes : null;
}

/**
 * next/image only loads hosts listed in next.config.ts (currently Unsplash photos), so
 * admin-entered URLs must match it. Keep this in sync with `images.remotePatterns`.
 */
export function isAllowedImageUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && u.hostname === "images.unsplash.com" && u.pathname.startsWith("/photo-");
  } catch {
    return false;
  }
}

/** Image rows shown on the product form. */
export const IMAGE_SLOTS = 5;

export const ALLOWED_IMAGE_HINT = "Use an https://images.unsplash.com/photo-… URL.";

export function formString(fd: FormData, key: string, max = 2000): string {
  return String(fd.get(key) ?? "").trim().slice(0, max);
}

export function formInt(fd: FormData, key: string): number | null {
  const raw = String(fd.get(key) ?? "").trim();
  if (!/^-?\d+$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) ? n : null;
}

/** Postgres error code from a thrown driver/Drizzle error (23505 unique, 23503 FK, 23514 check). */
export function pgErrorCode(e: unknown): string | undefined {
  const err = e as { code?: string; cause?: { code?: string } } | undefined;
  return err?.cause?.code ?? err?.code;
}

/** Rows from db.execute(sql`...`) regardless of driver result shape. */
export function rowsOf<T = Record<string, unknown>>(result: unknown): T[] {
  const r = result as { rows?: T[] } | T[];
  return Array.isArray(r) ? r : (r.rows ?? []);
}
