"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { ORDER_SOURCES, ORDER_STATUSES } from "@/lib/admin/constants";

const field =
  "h-11 rounded-md border border-cream-200 bg-cream-50 px-3 text-sm text-ink outline-none focus:border-rosewood";

/** §12 filters: date range, status, fulfilment, source channel, phone, order number. */
export function OrderFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");

  function apply(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/admin/orders?${next.toString()}`);
  }

  const hasFilters = ["status", "source", "fulfillment", "from", "to", "q"].some((key) =>
    params.get(key)
  );

  return (
    <div className="flex flex-col gap-2">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          apply("q", query);
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Phone or order number"
            inputMode="search"
            className={`${field} w-full pl-9`}
          />
        </div>
        <button
          type="submit"
          className="min-h-11 rounded-md border border-cream-200 bg-cream-50 px-4 text-sm text-ink"
        >
          Find
        </button>
      </form>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <select
          value={params.get("status") ?? ""}
          onChange={(event) => apply("status", event.target.value)}
          className={field}
        >
          <option value="">Any status</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        <select
          value={params.get("source") ?? ""}
          onChange={(event) => apply("source", event.target.value)}
          className={field}
        >
          <option value="">Any channel</option>
          {ORDER_SOURCES.map((source) => (
            <option key={source.value} value={source.value}>
              {source.label}
            </option>
          ))}
        </select>

        <select
          value={params.get("fulfillment") ?? ""}
          onChange={(event) => apply("fulfillment", event.target.value)}
          className={field}
        >
          <option value="">Pickup or delivery</option>
          <option value="delivery">Delivery</option>
          <option value="pickup">Pickup</option>
        </select>

        <input
          type="date"
          aria-label="Due from"
          value={params.get("from") ?? ""}
          onChange={(event) => apply("from", event.target.value)}
          className={field}
        />
        <input
          type="date"
          aria-label="Due to"
          value={params.get("to") ?? ""}
          onChange={(event) => apply("to", event.target.value)}
          className={field}
        />
      </div>

      {hasFilters ? (
        <button
          type="button"
          onClick={() => router.push("/admin/orders")}
          className="inline-flex min-h-11 items-center gap-1.5 self-start text-sm text-rosewood"
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
