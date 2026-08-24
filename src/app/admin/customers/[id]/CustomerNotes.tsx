"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveCustomerNotes } from "@/app/admin/customers/actions";

/** §13.4 - "prefers less sugar", "always orders for her son". */
export function CustomerNotes({ id, initialNotes }: { id: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [pending, startTransition] = useTransition();

  return (
    <section className="rounded-md border border-cream-200 bg-cream-50 p-3">
      <label htmlFor="notes" className="mb-2 block text-sm font-medium text-ink">
        Notes
      </label>
      <textarea
        id="notes"
        rows={4}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        onBlur={() =>
          startTransition(async () => {
            const result = await saveCustomerNotes(id, notes);
            if (result.ok) toast.success("Note saved");
            else toast.error(result.message);
          })
        }
        placeholder="Prefers less sugar. Always orders for her son."
        className="w-full rounded-md border border-cream-200 bg-cream-50 p-3 text-base text-ink outline-none focus:border-rosewood"
      />
      <p className="mt-1 text-xs text-ink/50">{pending ? "Saving…" : "Saves when you tap away"}</p>
    </section>
  );
}
