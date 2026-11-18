import { getStockStatus } from "@/lib/catalog";

export function StockIndicator({ stock }: { stock: number }) {
  const status = getStockStatus(stock);
  const config = {
    "in-stock": { text: "In stock", dot: "bg-ink", color: "text-ink-muted" },
    "low-stock": { text: `Only ${stock} left`, dot: "bg-accent", color: "text-accent" },
    "out-of-stock": { text: "Sold out", dot: "bg-danger", color: "text-danger" },
  }[status];

  return (
    <p className={`flex items-center gap-2 text-sm ${config.color}`}>
      <span aria-hidden className={`size-2 rounded-full ${config.dot}`} />
      {config.text}
    </p>
  );
}
