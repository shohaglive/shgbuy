import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/cart";

/** Sends signed-in customers to their account. Reads the session, so render inside <Suspense>. */
export async function GuestOnly({ children }: { children: React.ReactNode }) {
  if (await getSessionUser()) redirect("/account");
  return <>{children}</>;
}
