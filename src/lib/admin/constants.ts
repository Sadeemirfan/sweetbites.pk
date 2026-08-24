import type { OrderStatus, OrderSource } from "@/types/db";

/** The seven kanban columns, in the order work actually moves (§12). */
export const ORDER_STATUSES: { value: OrderStatus; label: string; className: string }[] = [
  { value: "pending", label: "Pending", className: "bg-status-pending" },
  { value: "confirmed", label: "Confirmed", className: "bg-status-confirmed" },
  { value: "baking", label: "Baking", className: "bg-status-baking" },
  { value: "ready", label: "Ready", className: "bg-status-ready" },
  { value: "out_for_delivery", label: "Out for delivery", className: "bg-status-delivery" },
  { value: "completed", label: "Completed", className: "bg-status-completed" },
  { value: "cancelled", label: "Cancelled", className: "bg-status-cancelled" },
];

export const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  ORDER_STATUSES.map((status) => [status.value, status.label])
);

export const STATUS_CLASSES: Record<string, string> = Object.fromEntries(
  ORDER_STATUSES.map((status) => [status.value, status.className])
);

/**
 * §13.1 - the source selector comes first on manual entry, because most
 * real orders arrive here rather than through the website.
 */
export const ORDER_SOURCES: { value: OrderSource; label: string; short: string }[] = [
  { value: "whatsapp", label: "WhatsApp", short: "WA" },
  { value: "facebook", label: "Facebook", short: "FB" },
  { value: "instagram", label: "Instagram", short: "IG" },
  { value: "tiktok", label: "TikTok", short: "TT" },
  { value: "phone", label: "Phone", short: "Call" },
  { value: "walk_in", label: "Walk-in", short: "Shop" },
  { value: "website", label: "Website", short: "Web" },
  { value: "other", label: "Other", short: "Other" },
];

export const SOURCE_LABELS: Record<string, string> = Object.fromEntries(
  ORDER_SOURCES.map((source) => [source.value, source.label])
);

export const TIME_SLOTS: { value: string; label: string; short: string }[] = [
  { value: "10-1", label: "10:00 AM – 1:00 PM", short: "10–1" },
  { value: "1-4", label: "1:00 PM – 4:00 PM", short: "1–4" },
  { value: "4-7", label: "4:00 PM – 7:00 PM", short: "4–7" },
  { value: "7-10", label: "7:00 PM – 10:00 PM", short: "7–10" },
  { value: "after-10", label: "After 10:00 PM", short: "Late" },
];

export const PAYMENT_METHODS = [
  { value: "cod", label: "Cash on Delivery" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "easypaisa", label: "Easypaisa" },
  { value: "bank", label: "Bank transfer" },
];

export const PAYMENT_STATUSES = [
  { value: "unpaid", label: "Unpaid" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
];

export const OCCASIONS = [
  { value: "none", label: "No occasion" },
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "wedding", label: "Wedding" },
  { value: "graduation", label: "Graduation" },
  { value: "religious", label: "Religious" },
  { value: "other", label: "Other" },
];
