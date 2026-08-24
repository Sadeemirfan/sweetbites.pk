/**
 * The order as the customer should see it after it is saved, and as the
 * WhatsApp handoff message needs it.
 *
 * This is deliberately a self-contained payload rather than something
 * the confirmation page re-reads from the database: §5 states there is
 * no customer-facing read path for order data at all, and that is what
 * makes an account-free site safe. The checkout hands this object to the
 * confirmation page through sessionStorage instead.
 */
export type OrderSummaryItem = {
  name: string;
  sizeLabel: string | null;
  flavor: string | null;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  cakeMessage: string | null;
};

export type OrderSummary = {
  orderNumber: string;
  requiredDate: string;
  timeSlot: string;
  fulfillment: "pickup" | "delivery";
  deliveryAreaName: string | null;
  address: string | null;
  customerName: string;
  phone: string;
  items: OrderSummaryItem[];
  subtotal: number;
  deliveryFee: number;
  lateNightFee: number;
  total: number;
  paymentMethod: string;
  isFirstOrder: boolean;
  advanceRequired: boolean;
  occasion: string | null;
  occasionPerson: string | null;
};

export const TIME_SLOT_LABELS: Record<string, string> = {
  "10-1": "10:00 AM – 1:00 PM",
  "1-4": "1:00 PM – 4:00 PM",
  "4-7": "4:00 PM – 7:00 PM",
  "7-10": "7:00 PM – 10:00 PM",
  "after-10": "After 10:00 PM",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  jazzcash: "JazzCash",
  easypaisa: "Easypaisa",
  bank: "Bank transfer",
};

export const OCCASION_LABELS: Record<string, string> = {
  birthday: "Birthday",
  anniversary: "Anniversary",
  wedding: "Wedding",
  graduation: "Graduation",
  religious: "Religious occasion",
  other: "Other",
  none: "Not specified",
};
