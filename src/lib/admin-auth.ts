// Admin authorization (Data Access Layer). The role comes from the database-backed
// session, and the only way to become admin is `npm run db:make-admin`.
//
// Rules (see AGENTS.md):
//  - Call requireAdmin() as the FIRST line of every admin page and admin data function.
//  - Call requireAdminAction() as the FIRST line of every admin Server Action.
//  - Layouts and proxy are NOT security boundaries.
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/cart";

/** For pages and data functions: redirects guests to sign in, 404s everyone who isn't an admin. */
export const requireAdmin = cache(async () => {
  const user = await getSessionUser();
  if (!user) redirect("/account/login");
  if (user.role !== "admin") notFound();
  return user;
});

/** For Server Actions (a public POST endpoint): never trusts the caller, throws instead of redirecting. */
export async function requireAdminAction() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") throw new Error("Unauthorized");
  return user;
}
