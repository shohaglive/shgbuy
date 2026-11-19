/** Suspense fallback for admin pages. */
export function AdminSkeleton() {
  return (
    <div aria-busy="true" className="space-y-4">
      <div className="h-3 w-20 animate-pulse bg-surface" />
      <div className="h-10 w-64 animate-pulse bg-surface" />
      <div className="h-64 animate-pulse bg-surface" />
    </div>
  );
}
