"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { mainNav, popularSearches } from "@/lib/catalog";
import { CloseIcon, MenuIcon, SearchIcon } from "@/components/ui/icons";

/** `bag`, `account` and `accountLabel` are server-rendered slots so session-dependent bits can stream in. */
export function Header({
  bag,
  account,
  accountLabel,
}: {
  bag: ReactNode;
  account: ReactNode;
  accountLabel: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);

  // Focus the search field when the bar opens; Escape closes it.
  useEffect(() => {
    if (!searchOpen) return;
    searchInput.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSearchOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const term = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    if (!term) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

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

      {/* Any link clicked inside the header (nav, suggestions) also closes the search bar. */}
      <header
        className="sticky top-0 z-40 border-b border-line bg-canvas"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setSearchOpen(false);
        }}
      >
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
            <button
              type="button"
              className="nav-link flex items-center gap-2 p-2 lg:p-0"
              aria-label={searchOpen ? "Close search" : "Search"}
              aria-expanded={searchOpen}
              aria-controls="site-search"
              onClick={() => setSearchOpen((o) => !o)}
            >
              {searchOpen ? <CloseIcon /> : <SearchIcon />}
              <span className="hidden lg:inline">{searchOpen ? "Close" : "Search"}</span>
            </button>
            {account}
            {bag}
          </div>
        </div>

        {/* Search bar: grows open beneath the header row. `inert` keeps it out of the tab order while closed. */}
        <div
          id="site-search"
          role="search"
          inert={!searchOpen}
          aria-hidden={!searchOpen}
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-ui ${
            searchOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="container-page border-t border-line py-6 lg:py-8">
              <form
                action="/search"
                method="get"
                onSubmit={onSearch}
                className="flex items-center gap-4 border-b border-line-strong pb-3 focus-within:border-b-2"
              >
                <SearchIcon className="shrink-0" />
                <input
                  ref={searchInput}
                  name="q"
                  type="search"
                  autoComplete="off"
                  aria-label="Search products"
                  placeholder="Search products"
                  className="search-input min-w-0 flex-1 bg-transparent font-display text-2xl placeholder:text-ink-subtle lg:text-4xl"
                />
                <button type="submit" className="label shrink-0 py-2">Search</button>
              </form>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="eyebrow">Popular</span>
                {popularSearches.map((term) => (
                  <Link key={term} href={`/search?q=${encodeURIComponent(term)}`} className="link text-sm">
                    {term}
                  </Link>
                ))}
              </div>
            </div>
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
            {accountLabel}
          </Link>
          <Link href="/help/contact" onClick={() => setOpen(false)} className="label py-2">
            Client Care
          </Link>
        </nav>
      </div>
    </>
  );
}
