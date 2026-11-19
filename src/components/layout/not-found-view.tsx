import Link from "next/link";

const SHORTCUTS = [
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Women", href: "/collections/women" },
  { label: "Men", href: "/collections/men" },
  { label: "Accessories", href: "/collections/accessories" },
  { label: "Journal", href: "/journal" },
];

/** The store's 404 content. Wrapped by the storefront chrome where it is rendered. */
export function NotFoundView() {
  return (
    <main id="main" className="section">
      <div className="container-page flex flex-col items-center text-center">
        <p aria-hidden className="font-display text-[clamp(7rem,3rem+22vw,16rem)] font-light leading-none tracking-tight text-surface-strong">
          404
        </p>
        <p className="eyebrow mt-2">Page not found</p>
        <h1 className="mt-4 max-w-2xl">This page has gone out of season</h1>
        <p className="mt-5 text-ink-muted">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved. Let&rsquo;s get you back to something beautiful.
        </p>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
          <Link href="/" className="btn btn-primary">Back to home</Link>
          <Link href="/collections/new-arrivals" className="btn btn-secondary">Shop new arrivals</Link>
        </div>

        <nav aria-label="Popular pages" className="divider mt-16 w-full max-w-2xl pt-8">
          <p className="eyebrow mb-4">Or explore</p>
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {SHORTCUTS.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="nav-link">{s.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
