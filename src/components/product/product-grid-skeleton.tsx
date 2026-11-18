/** Loading placeholder that mirrors the product grid to avoid layout shift. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className="grid-products" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <div className="media-product animate-pulse" />
          <div className="product-meta">
            <div className="h-3 w-16 bg-surface" />
            <div className="h-4 w-3/4 bg-surface" />
            <div className="h-4 w-12 bg-surface" />
          </div>
        </li>
      ))}
    </ul>
  );
}
