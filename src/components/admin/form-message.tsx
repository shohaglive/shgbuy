/** Inline result of an admin action (use with useActionState). */
export function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (error) {
    return (
      <p role="alert" className="border border-danger p-4 text-sm text-danger">
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p role="status" className="border border-line-strong p-4 text-sm">
        {success}
      </p>
    );
  }
  return null;
}
