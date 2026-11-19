import type { BadgeTone } from "@/components/ui/badge";
import type { OrderStatus } from "@/db/schema";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  confirmed: "ink",
  shipped: "accent",
  delivered: "neutral",
  cancelled: "danger",
};

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[];
