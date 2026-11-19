import Link from "next/link";
import { UserFilledIcon, UserIcon } from "@/components/ui/icons";
import { getSessionUser } from "@/lib/cart";

/** Header account link: outline icon + "Account" for guests, solid icon + "My Account" when signed in. */
export function AccountLinkView({ signedIn = false }: { signedIn?: boolean }) {
  const label = signedIn ? "My Account" : "Account";
  return (
    <Link href="/account" className="nav-link hidden items-center gap-2 sm:flex" aria-label={label}>
      {signedIn ? <UserFilledIcon /> : <UserIcon />}
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}

/** Reads the session, so render it inside <Suspense> (the guest view is the fallback). */
export async function AccountLink() {
  return <AccountLinkView signedIn={!!(await getSessionUser())} />;
}

/** Text for the mobile menu's account link. Render inside <Suspense>. */
export async function AccountLabel() {
  return <>{(await getSessionUser()) ? "My Account" : "Account"}</>;
}
