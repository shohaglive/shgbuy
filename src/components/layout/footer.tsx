import Link from "next/link";
import { footerLinks } from "@/lib/catalog";

export function Footer() {
  return (
    <footer className="divider mt-auto bg-surface">
      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.2fr_2fr] lg:py-20">
        <div>
          <p className="font-display text-3xl font-medium uppercase tracking-[0.28em]">shgbuy</p>
          <p className="mt-4 text-sm text-ink-muted">
            Considered fashion, crafted to last. Designed in small runs and delivered worldwide.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {footerLinks.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h2 className="label font-sans! text-[0.75rem]! tracking-[0.12em]! text-ink">{group.heading}</h2>
              <ul className="mt-4 space-y-3">
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link text-sm text-ink-muted hover:text-ink">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="divider">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-ink-muted sm:flex-row sm:justify-between">
          <p>© 2026 shgbuy. All rights reserved.</p>
          <p>Sample storefront. Images courtesy of Unsplash.</p>
        </div>
      </div>
    </footer>
  );
}
