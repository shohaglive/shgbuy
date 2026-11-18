"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { mainNav } from "@/lib/catalog";
import { CloseIcon, MenuIcon, SearchIcon, UserIcon } from "@/components/ui/icons";

/** `bag` is a server-rendered slot so the live cart count can stream in. */
export function Header({ bag }: { bag: ReactNode }) {
  const [open, setOpen] = useState(false);

  // Lock page scroll and close on Escape while the mobile menu is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <div className="bg-ink text-canvas">
        <p className="label container-page max-w-none! py-2.5 text-center text-[0.6875rem]">
          Complimentary shipping on orders over $250
        </p>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-canvas">
        <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center lg:h-20">
          {/* Left: menu button (mobile) / primary nav (desktop) */}
          <div className="flex items-center">
            <button
              type="button"
              className="-ml-2 p-2 lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
            >
              <MenuIcon />
            </button>
            <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
              {mainNav.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Centre: wordmark */}
          <Link
            href="/"
            aria-label="shgbuy home"
            className="font-display text-2xl font-medium uppercase tracking-[0.28em] lg:text-3xl"
          >
            shgbuy
          </Link>

          {/* Right: utilities */}
          <div className="flex items-center justify-end gap-1 sm:gap-4">
            <Link href="/search" className="nav-link flex items-center gap-2 p-2 lg:p-0" aria-label="Search">
              <SearchIcon />
              <span className="hidden lg:inline">Search</span>
            </Link>
            <Link href="/account" className="nav-link hidden items-center gap-2 sm:flex" aria-label="Account">
              <UserIcon />
              <span className="hidden lg:inline">Account</span>
            </Link>
            {bag}
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className="fixed inset-0 z-50 flex flex-col bg-canvas lg:hidden"
      >
        <div className="container-page flex h-16 items-center justify-between border-b border-line">
          <span className="font-display text-2xl font-medium uppercase tracking-[0.28em]">shgbuy</span>
          <button type="button" className="-mr-2 p-2" aria-label="Close menu" onClick={() => setOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        <nav aria-label="Mobile" className="container-page flex flex-1 flex-col gap-1 overflow-y-auto py-8">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-line py-4 font-display text-3xl"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/account" onClick={() => setOpen(false)} className="label mt-8 py-2">
            Account
          </Link>
          <Link href="/help/contact" onClick={() => setOpen(false)} className="label py-2">
            Client Care
          </Link>
        </nav>
      </div>
    </>
  );
}
