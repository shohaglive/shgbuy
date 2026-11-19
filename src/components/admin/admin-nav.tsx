"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/stock", label: "Stock" },
  { href: "/admin/orders", label: "Orders" },
];

/** Same links without the active-page highlight; shown while the pathname resolves. */
export function AdminNavFallback() {
  return (
    <nav aria-label="Admin" className="flex gap-5 overflow-x-auto lg:flex-col lg:gap-3">
      {ITEMS.map((item) => (
        <Link key={item.href} href={item.href} prefetch={false} className="nav-link shrink-0">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-5 overflow-x-auto lg:flex-col lg:gap-3">
      {ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            className="nav-link shrink-0"
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
