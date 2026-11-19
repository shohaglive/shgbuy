import { revalidatePath, updateTag } from "next/cache";

/** Call from a Server Action after any product, stock, category or collection write. */
export function refreshCatalog() {
  updateTag("products");
  revalidatePath("/", "layout");
}
