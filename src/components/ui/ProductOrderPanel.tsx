"use client";

import { useMemo, useState } from "react";
import { WhatsAppIcon } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";
import { productWhatsappLink } from "@/lib/utils/whatsapp";
import { useCart } from "@/lib/cart/store";
import type { Product } from "@/types/catalogue";

const MAX_QTY = 20;
const CAKE_MESSAGE_LIMIT = 60;

/**
 * Size, flavour, quantity and cake message, all feeding one live
 * WhatsApp link (§6). This is the path most customers actually take -
 * they browse, find a cake, and tap straight through to WhatsApp without
 * ever touching checkout - so it stays a plain anchor with no
 * intermediate step, no modal, and nothing to submit.
 */
export function ProductOrderPanel({
  product,
  categorySlug,
}: {
  product: Product;
  categorySlug: string;
}) {
  const addItem = useCart((state) => state.addItem);
  const [sizeIndex, setSizeIndex] = useState(0);
  const [flavor, setFlavor] = useState<string | null>(product.flavors[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [cakeMessage, setCakeMessage] = useState("");

  const selectedSize = product.sizes[sizeIndex] ?? null;
  const unitPrice = selectedSize?.price ?? product.startingPrice;
  const total = unitPrice != null ? unitPrice * quantity : null;

  const waHref = useMemo(
    () =>
      productWhatsappLink({
        name: product.name,
        categorySlug,
        productSlug: product.slug,
        size: selectedSize?.label,
        flavor,
        price: unitPrice,
        quantity,
        cakeMessage,
      }),
    [product.name, product.slug, categorySlug, selectedSize, flavor, unitPrice, quantity, cakeMessage]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline gap-3">
        <span className="text-xl font-medium text-ghee">{formatPrice(total)}</span>
        {quantity > 1 && unitPrice != null ? (
          <span className="text-sm text-ink/60">{formatPrice(unitPrice)} each</span>
        ) : null}
      </div>

      {product.sizes.length > 0 ? (
        <fieldset className="flex flex-col gap-3">
          <legend className="eyebrow mb-1 text-rosewood">Size</legend>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size, index) => (
              <button
                key={size.label}
                type="button"
                onClick={() => setSizeIndex(index)}
                aria-pressed={index === sizeIndex}
                className={cn(
                  "flex min-h-11 flex-col items-start justify-center rounded-md border px-4 py-2 text-left transition-colors",
                  index === sizeIndex
                    ? "border-rosewood bg-rosewood/10 text-ink"
                    : "border-cream-200 text-ink/80 hover:border-rosewood/50"
                )}
              >
                <span className="text-sm font-medium">{size.label}</span>
                <span className="text-xs text-ink/60">{formatPrice(size.price)}</span>
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {product.flavors.length > 0 ? (
        <fieldset className="flex flex-col gap-3">
          <legend className="eyebrow mb-1 text-rosewood">Flavour</legend>
          <div className="flex flex-wrap gap-2">
            {product.flavors.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFlavor(option)}
                aria-pressed={option === flavor}
                className={cn(
                  "min-h-11 rounded-md border px-4 text-sm transition-colors",
                  option === flavor
                    ? "border-rosewood bg-rosewood/10 text-ink"
                    : "border-cream-200 text-ink/80 hover:border-rosewood/50"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="flex flex-col gap-3">
        <label htmlFor="quantity" className="eyebrow text-rosewood">
          Quantity
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="flex h-11 w-11 items-center justify-center rounded-md border border-cream-200 text-lg text-ink transition-colors hover:border-rosewood disabled:opacity-40"
          >
            −
          </button>
          <input
            id="quantity"
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_QTY}
            value={quantity}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isFinite(next)) {
                setQuantity(Math.min(MAX_QTY, Math.max(1, Math.trunc(next))));
              }
            }}
            className="h-11 w-16 rounded-md border border-cream-200 bg-cream-50 text-center text-base text-ink"
          />
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(MAX_QTY, q + 1))}
            disabled={quantity >= MAX_QTY}
            aria-label="Increase quantity"
            className="flex h-11 w-11 items-center justify-center rounded-md border border-cream-200 text-lg text-ink transition-colors hover:border-rosewood disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="cake-message" className="eyebrow text-rosewood">
          Message on the cake <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="cake-message"
          type="text"
          maxLength={CAKE_MESSAGE_LIMIT}
          value={cakeMessage}
          onChange={(event) => setCakeMessage(event.target.value)}
          placeholder="Happy Birthday Ayesha"
          className="min-h-11 rounded-md border border-cream-200 bg-cream-50 px-3 text-base text-ink outline-none transition-colors focus:border-rosewood"
        />
        <span className="text-xs text-ink/50">
          {cakeMessage.length}/{CAKE_MESSAGE_LIMIT} characters
        </span>
      </div>

      {/* §6: WhatsApp is the primary action and stays first. "Add to
          order" is the secondary path for a multi-item cart. */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-whatsapp px-5 text-base font-medium text-[#04301A] transition-colors hover:bg-whatsapp/90"
      >
        <WhatsAppIcon />
        Order on WhatsApp
      </a>

      <button
        type="button"
        onClick={() => {
          addItem({
            productId: product.id,
            categorySlug,
            productSlug: product.slug,
            name: product.name,
            imageUrl: product.image_url,
            sizeLabel: selectedSize?.label ?? null,
            weightKg: selectedSize?.weight_kg ?? null,
            flavor,
            unitPrice: unitPrice ?? 0,
            qty: quantity,
            cakeMessage,
            addons: [],
            referenceImageUrl: null,
            leadTimeDays: product.lead_time_days,
          });
        }}
        disabled={unitPrice == null}
        className="inline-flex min-h-12 items-center justify-center rounded-md border border-cream-200 px-5 text-base font-medium text-ink transition-colors hover:border-rosewood hover:text-rosewood disabled:opacity-50"
      >
        Add to order
      </button>

      <p className="text-sm text-ink/60">
        Your size, flavour, and message are filled in for you - just press send. We reply during
        shop hours, 8:00 AM to 10:00 PM.
      </p>
    </div>
  );
}
