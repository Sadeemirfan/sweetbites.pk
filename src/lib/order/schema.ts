import { z } from "zod";

/**
 * Pakistani mobile numbers: 11 digits, 03XXXXXXXXX. Spaces, dashes and
 * a +92 / 0092 country prefix are all accepted on input and normalised
 * to the local 03… form, because that is how the shop already stores
 * and dials them.
 */
export function normalisePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("0092")) return `0${digits.slice(4)}`;
  if (digits.startsWith("92")) return `0${digits.slice(2)}`;
  return digits;
}

export const phoneSchema = z
  .string()
  .transform(normalisePhone)
  .refine((value) => /^03\d{9}$/.test(value), {
    message: "Enter a valid Pakistani mobile number, e.g. 0321 7337801",
  });

export const TIME_SLOTS = ["10-1", "1-4", "4-7", "7-10", "after-10"] as const;
export const OCCASIONS = [
  "birthday",
  "anniversary",
  "wedding",
  "graduation",
  "religious",
  "other",
  "none",
] as const;
export const PAYMENT_METHODS = ["cod", "jazzcash", "easypaisa", "bank"] as const;

export const checkoutSchema = z
  .object({
    required_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a date"),
    time_slot: z.enum(TIME_SLOTS, { message: "Please choose a time slot" }),

    fulfillment: z.enum(["pickup", "delivery"]),
    delivery_area_id: z.string().uuid().nullable().optional(),
    address: z.string().trim().optional(),

    customer_name: z.string().trim().min(2, "Please tell us your name"),
    phone: phoneSchema,
    whatsapp: z.union([phoneSchema, z.literal("")]).optional(),

    // Optional by design (§7 step 5) - never block checkout on it.
    occasion: z.enum(OCCASIONS).optional(),
    occasion_person: z.string().trim().max(80).optional(),

    payment_method: z.enum(PAYMENT_METHODS, { message: "Please choose a payment method" }),
    payment_proof_url: z.string().trim().optional(),
    customer_note: z.string().trim().max(500).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.fulfillment !== "delivery") return;

    if (!value.delivery_area_id) {
      ctx.addIssue({
        code: "custom",
        path: ["delivery_area_id"],
        message: "Please choose your delivery area",
      });
    }
    if (!value.address || value.address.length < 8) {
      ctx.addIssue({
        code: "custom",
        path: ["address"],
        message: "Please give us an address we can deliver to",
      });
    }
  });

export type CheckoutValues = z.input<typeof checkoutSchema>;
export type CheckoutParsed = z.output<typeof checkoutSchema>;

/** What the server needs per line. Prices are re-read from the database. */
export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  sizeLabel: z.string().nullable(),
  flavor: z.string().nullable(),
  qty: z.number().int().min(1).max(20),
  cakeMessage: z.string().max(60).optional().default(""),
  referenceImageUrl: z.string().nullable().optional(),
});

export const createOrderSchema = z.object({
  checkout: checkoutSchema,
  items: z.array(orderItemSchema).min(1, "Your cart is empty"),
});

export type CreateOrderInput = z.input<typeof createOrderSchema>;
