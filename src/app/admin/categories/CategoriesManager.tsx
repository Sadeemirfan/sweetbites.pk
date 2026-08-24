"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { SortableList } from "@/components/admin/SortableList";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { deleteCategory, reorderCategories, saveCategory } from "@/app/admin/actions";
import { slugify } from "@/lib/admin/slugify";
import { cn } from "@/lib/utils/cn";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  productCount: number;
};

const field =
  "h-11 w-full rounded-md border border-cream-200 bg-cream-50 px-3 text-base text-ink outline-none focus:border-rosewood";
const label = "mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60";

type Draft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  is_active: boolean;
};

const BLANK: Draft = {
  name: "",
  slug: "",
  description: "",
  image_url: null,
  is_active: true,
};

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [items, setItems] = useState(categories);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pending, startTransition] = useTransition();

  // The list is held in state so reordering and deleting can be
  // optimistic - which means a save has to hand it back to the server's
  // copy, or a new category is written to the database and never
  // appears on screen.
  useEffect(() => setItems(categories), [categories]);

  function onReorder(ids: string[]) {
    // Reorder locally first - waiting on a round trip for a list the
    // baker is actively arranging feels broken.
    setItems((current) => ids.map((id) => current.find((item) => item.id === id)!));
    startTransition(async () => {
      await reorderCategories(ids);
    });
  }

  function save() {
    if (!draft) return;
    if (!draft.name.trim()) {
      toast.error("Give the category a name.");
      return;
    }

    startTransition(async () => {
      const result = await saveCategory({
        id: draft.id,
        name: draft.name.trim(),
        slug: (draft.slug || slugify(draft.name)).trim(),
        description: draft.description.trim() || null,
        image_url: draft.image_url,
        is_active: draft.is_active,
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

  function remove(category: Category) {
    if (category.productCount > 0) {
      toast.error(`Move this category's ${category.productCount} cakes first.`);
      return;
    }
    if (!window.confirm(`Delete "${category.name}"? This cannot be undone.`)) return;

    startTransition(async () => {
      const result = await deleteCategory(category.id);
      if (result.ok) {
        toast.success("Deleted");
        setItems((current) => current.filter((item) => item.id !== category.id));
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className={cn("flex flex-col gap-4", pending && "opacity-90")}>
      {draft ? (
        <div className="rounded-md border border-rosewood/40 bg-cream-100 p-3">
          <h2 className="mb-3 text-sm font-medium text-ink">
            {draft.id ? "Edit category" : "New category"}
          </h2>

          <div className="flex flex-col gap-3">
            <div>
              <label className={label} htmlFor="cat-name">
                Name
              </label>
              <input
                id="cat-name"
                value={draft.name}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    name: event.target.value,
                    // Only auto-slug new categories: changing a live
                    // category's slug would break its existing links.
                    slug: draft.id ? draft.slug : slugify(event.target.value),
                  })
                }
                className={field}
              />
            </div>

            <div>
              <label className={label} htmlFor="cat-slug">
                Web address
              </label>
              <input
                id="cat-slug"
                value={draft.slug}
                onChange={(event) => setDraft({ ...draft, slug: event.target.value })}
                className={field}
              />
              <p className="mt-1 text-xs text-ink/50">sweetbites.pk/gallery/{draft.slug || "…"}</p>
            </div>

            <div>
              <label className={label} htmlFor="cat-desc">
                One-line description
              </label>
              <input
                id="cat-desc"
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                className={field}
              />
            </div>

            <ImageUploader
              bucket="categories"
              value={draft.image_url}
              onChange={(url) => setDraft({ ...draft, image_url: url })}
            />

            <label className="flex min-h-11 items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={draft.is_active}
                onChange={(event) => setDraft({ ...draft, is_active: event.target.checked })}
                className="h-5 w-5 accent-rosewood"
              />
              Show on the website
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={save}
                disabled={pending}
                className="min-h-11 flex-1 rounded-md bg-rosewood px-4 text-sm font-medium text-cream-50 disabled:opacity-50"
              >
                {pending ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="min-h-11 rounded-md border border-cream-200 bg-cream-50 px-4 text-sm text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setDraft({ ...BLANK })}
          className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-rosewood px-4 text-sm font-medium text-cream-50"
        >
          <Plus className="h-4 w-4" />
          New category
        </button>
      )}

      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-cream-200 bg-cream-100/60 p-6 text-sm text-ink/70">
          No categories yet. Add one and it appears in the gallery straight away.
        </p>
      ) : (
        <SortableList
          items={items}
          onReorder={onReorder}
          renderItem={(category) => (
            <div className="flex items-center gap-3 pr-1">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-cream-100">
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{category.name}</p>
                <p className="truncate text-xs text-ink/55">
                  {category.productCount} {category.productCount === 1 ? "cake" : "cakes"}
                  {!category.is_active ? " · hidden" : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDraft({
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    description: category.description ?? "",
                    image_url: category.image_url,
                    is_active: category.is_active,
                  })
                }
                aria-label={`Edit ${category.name}`}
                className="flex h-11 w-11 items-center justify-center rounded-md text-ink/55 hover:text-rosewood"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => remove(category)}
                aria-label={`Delete ${category.name}`}
                className="flex h-11 w-11 items-center justify-center rounded-md text-ink/45 hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
}
