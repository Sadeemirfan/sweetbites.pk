"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { SortableList } from "@/components/admin/SortableList";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  deleteProduct,
  reorderProducts,
  saveProduct,
  toggleProductFlag,
} from "@/app/admin/actions";
import { slugify } from "@/lib/admin/slugify";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { ProductSize } from "@/types/catalogue";

type Product = {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number | null;
  costEstimate: number | null;
  imageUrl: string | null;
  sizes: ProductSize[];
  flavors: string[];
  leadTimeDays: number;
  isActive: boolean;
  isFeatured: boolean;
};

const field =
  "h-11 w-full rounded-md border border-cream-200 bg-cream-50 px-3 text-base text-ink outline-none focus:border-rosewood";
const label = "mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60";

type Draft = Omit<Product, "categoryName">;

function blankDraft(categoryId: string): Draft {
  return {
    id: "",
    categoryId,
    name: "",
    slug: "",
    description: "",
    basePrice: null,
    costEstimate: null,
    imageUrl: null,
    sizes: [{ label: "1 Pound", weight_kg: 0.45, price: 0 }],
    flavors: [],
    leadTimeDays: 2,
    isActive: true,
    isFeatured: false,
  };
}

export function ProductsManager({
  products,
  categories,
}: {
  products: Product[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(products);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pending, startTransition] = useTransition();

  // Reordering and the star toggle are optimistic, so the list lives in
  // state - which means every save has to hand it back to the server's
  // copy, or a saved cake never shows up in the list.
  useEffect(() => setItems(products), [products]);

  function onReorder(ids: string[]) {
    setItems((current) => ids.map((id) => current.find((item) => item.id === id)!));
    startTransition(async () => {
      await reorderProducts(ids);
    });
  }

  function save() {
    if (!draft) return;
    if (!draft.name.trim()) return toast.error("Give the cake a name.");
    if (!draft.categoryId) return toast.error("Choose a category.");

    startTransition(async () => {
      const result = await saveProduct({
        id: draft.id || undefined,
        category_id: draft.categoryId,
        name: draft.name.trim(),
        slug: (draft.slug || slugify(draft.name)).trim(),
        description: draft.description?.trim() || null,
        base_price: draft.sizes[0]?.price ?? draft.basePrice,
        cost_estimate: draft.costEstimate,
        image_url: draft.imageUrl,
        sizes: draft.sizes.filter((size) => size.label.trim() && size.price > 0),
        flavors: draft.flavors.filter(Boolean),
        lead_time_days: draft.leadTimeDays,
        is_active: draft.isActive,
        is_featured: draft.isFeatured,
      });

      if (result.ok) {
        toast.success("Saved");
        setDraft(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function toggle(product: Product, flagField: "is_active" | "is_featured") {
    const next = flagField === "is_active" ? !product.isActive : !product.isFeatured;
    setItems((current) =>
      current.map((item) =>
        item.id === product.id
          ? { ...item, ...(flagField === "is_active" ? { isActive: next } : { isFeatured: next }) }
          : item
      )
    );
    startTransition(async () => {
      const result = await toggleProductFlag(product.id, flagField, next);
      if (!result.ok) toast.error(result.message);
    });
  }

  return (
    <div className={cn("flex flex-col gap-4", pending && "opacity-90")}>
      <button
        type="button"
        onClick={() => setDraft(blankDraft(categories[0]?.id ?? ""))}
        className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-rosewood px-4 text-sm font-medium text-cream-50"
      >
        <Plus className="h-4 w-4" />
        New cake
      </button>

      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-cream-200 bg-cream-100/60 p-6 text-sm text-ink/70">
          No cakes yet. Add one and it appears in the gallery immediately.
        </p>
      ) : (
        <SortableList
          items={items}
          onReorder={onReorder}
          renderItem={(product) => (
            <div className="flex items-center gap-3 pr-1">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-cream-100">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{product.name}</p>
                <p className="truncate text-xs text-ink/55">
                  {product.categoryName} ·{" "}
                  <span className="text-ghee">
                    {formatPrice(product.sizes[0]?.price ?? product.basePrice)}
                  </span>
                  {!product.isActive ? " · hidden" : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggle(product, "is_featured")}
                aria-label={product.isFeatured ? "Remove from bestsellers" : "Mark as bestseller"}
                aria-pressed={product.isFeatured}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-md",
                  product.isFeatured ? "text-ghee" : "text-ink/30"
                )}
              >
                <Star className="h-4 w-4" fill={product.isFeatured ? "currentColor" : "none"} />
              </button>

              <button
                type="button"
                onClick={() => setDraft({ ...product })}
                aria-label={`Edit ${product.name}`}
                className="flex h-11 w-11 items-center justify-center rounded-md text-ink/55 hover:text-rosewood"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          )}
        />
      )}

      {/* Side drawer (§12) - full width on a phone, a panel on desktop. */}
      {draft ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-cocoa-900/40"
            onClick={() => setDraft(null)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-cream-50 shadow-dark">
            <header className="flex items-center justify-between border-b border-cream-200 px-4 py-3">
              <h2 className="text-base font-medium text-ink">
                {draft.id ? "Edit cake" : "New cake"}
              </h2>
              <button
                type="button"
                onClick={() => setDraft(null)}
                aria-label="Close"
                className="flex h-11 w-11 items-center justify-center rounded-md text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-3">
                <div>
                  <label className={label} htmlFor="p-name">
                    Name
                  </label>
                  <input
                    id="p-name"
                    value={draft.name}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        name: event.target.value,
                        slug: draft.id ? draft.slug : slugify(event.target.value),
                      })
                    }
                    className={field}
                  />
                </div>

                <div>
                  <label className={label} htmlFor="p-category">
                    Category
                  </label>
                  <select
                    id="p-category"
                    value={draft.categoryId}
                    onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}
                    className={field}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={label} htmlFor="p-desc">
                    One-line description
                  </label>
                  <input
                    id="p-desc"
                    value={draft.description ?? ""}
                    onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                    className={field}
                  />
                </div>

                <ImageUploader
                  bucket="products"
                  value={draft.imageUrl}
                  onChange={(url) => setDraft({ ...draft, imageUrl: url })}
                />

                {/* Sizes - repeatable */}
                <div>
                  <span className={label}>Sizes and prices</span>
                  <div className="flex flex-col gap-2">
                    {draft.sizes.map((size, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          value={size.label}
                          onChange={(event) => {
                            const sizes = [...draft.sizes];
                            sizes[index] = { ...size, label: event.target.value };
                            setDraft({ ...draft, sizes });
                          }}
                          placeholder="2 Pound"
                          className={cn(field, "flex-1")}
                        />
                        <input
                          type="number"
                          inputMode="numeric"
                          value={size.price || ""}
                          onChange={(event) => {
                            const sizes = [...draft.sizes];
                            sizes[index] = { ...size, price: Number(event.target.value) || 0 };
                            setDraft({ ...draft, sizes });
                          }}
                          placeholder="3600"
                          className={cn(field, "w-28")}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              sizes: draft.sizes.filter((_, i) => i !== index),
                            })
                          }
                          aria-label="Remove size"
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink/45 hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          sizes: [...draft.sizes, { label: "", weight_kg: null, price: 0 }],
                        })
                      }
                      className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-dashed border-cream-200 text-sm text-ink"
                    >
                      <Plus className="h-4 w-4" />
                      Add a size
                    </button>
                  </div>
                </div>

                {/* Flavours - repeatable */}
                <div>
                  <label className={label} htmlFor="p-flavors">
                    Flavours
                  </label>
                  <input
                    id="p-flavors"
                    value={draft.flavors.join(", ")}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        flavors: event.target.value
                          .split(",")
                          .map((flavor) => flavor.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Chocolate Fudge, Vanilla, Red Velvet"
                    className={field}
                  />
                  <p className="mt-1 text-xs text-ink/50">Separate with commas</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={label} htmlFor="p-lead">
                      Lead time (days)
                    </label>
                    <input
                      id="p-lead"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={draft.leadTimeDays}
                      onChange={(event) =>
                        setDraft({ ...draft, leadTimeDays: Number(event.target.value) || 2 })
                      }
                      className={field}
                    />
                  </div>
                  <div>
                    <label className={label} htmlFor="p-cost">
                      Cost estimate
                    </label>
                    <input
                      id="p-cost"
                      type="number"
                      inputMode="numeric"
                      value={draft.costEstimate ?? ""}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          costEstimate: event.target.value ? Number(event.target.value) : null,
                        })
                      }
                      className={field}
                    />
                    <p className="mt-1 text-xs text-ink/50">Optional, for rough margin</p>
                  </div>
                </div>

                <label className="flex min-h-11 items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={draft.isActive}
                    onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })}
                    className="h-5 w-5 accent-rosewood"
                  />
                  Show on the website
                </label>

                <label className="flex min-h-11 items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={draft.isFeatured}
                    onChange={(event) => setDraft({ ...draft, isFeatured: event.target.checked })}
                    className="h-5 w-5 accent-rosewood"
                  />
                  Show in bestsellers on the home page
                </label>
              </div>
            </div>

            <footer className="flex gap-2 border-t border-cream-200 p-4">
              {draft.id ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm(`Delete "${draft.name}"? This cannot be undone.`)) return;
                    startTransition(async () => {
                      const result = await deleteProduct(draft.id);
                      if (result.ok) {
                        toast.success("Deleted");
                        setItems((current) => current.filter((item) => item.id !== draft.id));
                        setDraft(null);
                        router.refresh();
                      } else toast.error(result.message);
                    });
                  }}
                  aria-label="Delete cake"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-cream-200 text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={save}
                disabled={pending}
                className="min-h-12 flex-1 rounded-md bg-rosewood px-4 text-sm font-medium text-cream-50 disabled:opacity-50"
              >
                {pending ? "Saving…" : "Save cake"}
              </button>
            </footer>
          </aside>
        </>
      ) : null}
    </div>
  );
}
