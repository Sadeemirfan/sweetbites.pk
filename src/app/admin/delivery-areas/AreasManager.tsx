"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { deleteDeliveryArea, saveDeliveryArea } from "@/app/admin/actions";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type Area = {
  id: string;
  name: string;
  fee: number;
  isInsideCity: boolean;
  isActive: boolean;
};

const field =
  "h-11 w-full rounded-md border border-cream-200 bg-cream-50 px-3 text-base text-ink outline-none focus:border-rosewood";

export function AreasManager({ areas }: { areas: Area[] }) {
  const router = useRouter();
  const [items, setItems] = useState(areas);
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<Area | null>(null);

  // Deleting is optimistic, so the list is state - and a save has to
  // hand it back to the server's copy or the new area never appears.
  useEffect(() => setItems(areas), [areas]);

  function save(area: Area) {
    if (!area.name.trim()) {
      toast.error("Give the area a name.");
      return;
    }

    startTransition(async () => {
      const result = await saveDeliveryArea({
        id: area.id || undefined,
        name: area.name.trim(),
        fee: area.fee,
        is_inside_city: area.isInsideCity,
        is_active: area.isActive,
      });
      if (result.ok) {
        toast.success("Saved");
        setDraft(null);
        router.refresh();
      } else toast.error(result.message);
    });
  }

  function remove(area: Area) {
    if (!window.confirm(`Delete "${area.name}"? This cannot be undone.`)) return;

    startTransition(async () => {
      const result = await deleteDeliveryArea(area.id);
      if (result.ok) {
        setItems((current) => current.filter((item) => item.id !== area.id));
        toast.success("Deleted");
        router.refresh();
      } else toast.error(result.message);
    });
  }

  return (
    <div className={cn("flex flex-col gap-4", pending && "opacity-90")}>
      {draft ? (
        <div className="flex flex-col gap-3 rounded-md border border-rosewood/40 bg-cream-100 p-3">
          <input
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            placeholder="Area name"
            className={field}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={draft.fee || ""}
              onChange={(event) => setDraft({ ...draft, fee: Number(event.target.value) || 0 })}
              placeholder="Fee"
              className={field}
              disabled={draft.isInsideCity}
            />
            <label className="flex min-h-11 items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={draft.isInsideCity}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    isInsideCity: event.target.checked,
                    // Inside the city is free by definition (§0).
                    fee: event.target.checked ? 0 : draft.fee,
                  })
                }
                className="h-5 w-5 accent-rosewood"
              />
              Inside the city
            </label>
          </div>
          <label className="flex min-h-11 items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })}
              className="h-5 w-5 accent-rosewood"
            />
            Offer this area at checkout
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => save(draft)}
              className="min-h-11 flex-1 rounded-md bg-rosewood px-4 text-sm font-medium text-cream-50"
            >
              Save
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
      ) : (
        <button
          type="button"
          onClick={() =>
            setDraft({ id: "", name: "", fee: 0, isInsideCity: true, isActive: true })
          }
          className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-rosewood px-4 text-sm font-medium text-cream-50"
        >
          <Plus className="h-4 w-4" />
          New area
        </button>
      )}

      <ul className="flex flex-col gap-2">
        {items.map((area) => (
          <li
            key={area.id}
            className="flex items-center gap-3 rounded-md border border-cream-200 bg-cream-50 p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{area.name}</p>
              <p className="text-xs text-ink/55">
                {area.isInsideCity ? "Inside city" : "Village / outlying"}
                {!area.isActive ? " · hidden" : ""}
              </p>
            </div>
            <span className={cn("text-sm", area.fee === 0 ? "text-pista" : "text-ghee")}>
              {area.fee === 0 ? "Free" : formatPrice(area.fee)}
            </span>
            <button
              type="button"
              onClick={() => setDraft(area)}
              className="min-h-11 rounded-md border border-cream-200 px-3 text-sm text-ink"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => remove(area)}
              aria-label={`Delete ${area.name}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink/45 hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
