"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Receipt, Trash2, X } from "lucide-react";
import { deleteExpense, saveExpense } from "@/app/admin/expenses/actions";
import { formatPrice } from "@/lib/utils/format";
import { privateFileUrl } from "@/lib/admin/private-file";
import { cn } from "@/lib/utils/cn";

type Category = { id: string; name: string };

type Suggestion = {
  item: string;
  vendor: string | null;
  unit: string | null;
  unitPrice: number | null;
  amount: number;
  categoryId: string | null;
  lastBought: string;
  timesBought: number;
};

type Expense = {
  id: string;
  item: string;
  vendor: string | null;
  quantity: number | null;
  unit: string | null;
  amount: number;
  purchasedOn: string;
  note: string | null;
  receiptUrl: string | null;
  categoryId: string | null;
  categoryName: string | null;
  expenseType: "business" | "home";
};

const field =
  "h-11 w-full rounded-md border border-cream-200 bg-cream-50 px-3 text-base text-ink outline-none focus:border-rosewood";
const label = "mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60";

export function ExpensesScreen({
  expenses,
  categories,
  suggestions,
  todayIso,
}: {
  expenses: Expense[];
  categories: Category[];
  suggestions: Suggestion[];
  todayIso: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  // null = closed, "new" = blank form, otherwise the expense being edited.
  const [editing, setEditing] = useState<Expense | "new" | null>(null);

  const runningTotal = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses]
  );

  function applyFilter(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/admin/expenses?${next.toString()}`);
  }

  function remove(expense: Expense) {
    if (!window.confirm(`Delete "${expense.item}"? This cannot be undone.`)) return;

    startTransition(async () => {
      const result = await deleteExpense(expense.id);
      if (result.ok) {
        toast.success("Deleted");
        router.refresh();
      } else toast.error(result.message);
    });
  }

  return (
    <div className={cn("flex flex-col gap-4", pending && "opacity-90")}>
      {editing ? (
        <QuickEntry
          // Remount when switching rows, so the fields reload.
          key={editing === "new" ? "new" : editing.id}
          expense={editing === "new" ? null : editing}
          categories={categories}
          suggestions={suggestions}
          todayIso={todayIso}
          onDone={() => {
            setEditing(null);
            router.refresh();
          }}
          onSaved={() => router.refresh()}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-rosewood px-4 text-sm font-medium text-cream-50"
        >
          <Plus className="h-4 w-4" />
          Add a purchase
        </button>
      )}

      {/* Filters */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <input
          type="date"
          aria-label="From"
          value={params.get("from") ?? ""}
          onChange={(event) => applyFilter("from", event.target.value)}
          className={field}
        />
        <input
          type="date"
          aria-label="To"
          value={params.get("to") ?? ""}
          onChange={(event) => applyFilter("to", event.target.value)}
          className={field}
        />
        <select
          aria-label="Type"
          value={params.get("type") ?? ""}
          onChange={(event) => applyFilter("type", event.target.value)}
          className={field}
        >
          <option value="">Home &amp; Sweet Bites</option>
          <option value="business">Sweet Bites only</option>
          <option value="home">Home only</option>
        </select>
        <select
          aria-label="Category"
          value={params.get("category") ?? ""}
          onChange={(event) => applyFilter("category", event.target.value)}
          className={field}
        >
          <option value="">Any category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort by"
          value={params.get("sort") ?? "purchased_on"}
          onChange={(event) => applyFilter("sort", event.target.value)}
          className={field}
        >
          <option value="purchased_on">Newest first</option>
          <option value="amount">Largest first</option>
        </select>
      </div>

      <input
        aria-label="Vendor"
        defaultValue={params.get("vendor") ?? ""}
        onBlur={(event) => applyFilter("vendor", event.target.value)}
        placeholder="Filter by vendor"
        className={field}
      />

      {/* §13.2 - running total for the current filter, always visible. */}
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-md border border-cream-200 bg-cream-100 px-3 py-2.5">
        <span className="text-sm text-ink/70">
          {expenses.length} {expenses.length === 1 ? "purchase" : "purchases"} shown
        </span>
        <span className="text-lg font-medium text-ghee">{formatPrice(runningTotal)}</span>
      </div>

      {expenses.length === 0 ? (
        <p className="rounded-md border border-dashed border-cream-200 bg-cream-100/60 p-6 text-sm text-ink/70">
          No purchases logged for this filter. Add one as soon as you buy - it takes about twenty
          seconds and it is what makes the reports mean anything.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {expenses.map((expense) => (
            <li
              key={expense.id}
              className="flex items-start gap-3 rounded-md border border-cream-200 bg-cream-50 p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-medium text-ink">{expense.item}</span>
                  {expense.expenseType === "home" ? (
                    <span className="rounded-sm bg-pista/15 px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-pista">
                      Home
                    </span>
                  ) : null}
                  {expense.categoryName ? (
                    <span className="rounded-sm border border-cream-200 px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-ink/60">
                      {expense.categoryName}
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-xs text-ink/55">
                  {[
                    expense.purchasedOn,
                    expense.vendor,
                    expense.quantity
                      ? `${expense.quantity}${expense.unit ? ` ${expense.unit}` : ""}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {expense.note ? (
                  <p className="mt-1 text-xs text-ink/60">{expense.note}</p>
                ) : null}
                {expense.receiptUrl ? (
                  <a
                    href={privateFileUrl("receipts", expense.receiptUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex min-h-9 items-center gap-1.5 text-xs text-rosewood hover:underline"
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    View receipt
                  </a>
                ) : null}
              </div>

              <span className="shrink-0 text-sm font-medium text-ghee">
                {formatPrice(expense.amount)}
              </span>

              {/* A mistyped amount used to mean deleting the row and
                  retyping the whole purchase - the server action already
                  took an id, nothing ever passed one. */}
              <button
                type="button"
                onClick={() => setEditing(expense)}
                aria-label={`Edit ${expense.item}`}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink/40 hover:text-rosewood"
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => remove(expense)}
                aria-label={`Delete ${expense.item}`}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink/40 hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * §13.2 quick entry. Same 60-second target as manual order entry -
 * this gets filled in standing at a shop counter, one-handed.
 */
function QuickEntry({
  expense,
  categories,
  suggestions,
  todayIso,
  onDone,
  onSaved,
  onCancel,
}: {
  /** Null for a new purchase, otherwise the row being corrected. */
  expense: Expense | null;
  categories: Category[];
  suggestions: Suggestion[];
  todayIso: string;
  onDone: () => void;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [expenseType, setExpenseType] = useState<"business" | "home">(
    expense?.expenseType ?? "business"
  );
  const [item, setItem] = useState(expense?.item ?? "");
  const [categoryId, setCategoryId] = useState(
    expense?.categoryId ?? categories[0]?.id ?? ""
  );
  const [vendor, setVendor] = useState(expense?.vendor ?? "");
  const [quantity, setQuantity] = useState(
    expense?.quantity != null ? String(expense.quantity) : ""
  );
  const [unit, setUnit] = useState(expense?.unit ?? "");
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [purchasedOn, setPurchasedOn] = useState(expense?.purchasedOn ?? todayIso);
  const [note, setNote] = useState(expense?.note ?? "");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(expense?.receiptUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const itemRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const term = item.trim().toLowerCase();
    if (!term) return suggestions.slice(0, 6);
    return suggestions
      .filter((suggestion) => suggestion.item.toLowerCase().includes(term))
      .slice(0, 6);
  }, [item, suggestions]);

  /** Picking a suggestion pre-fills the last price paid - the point of §13.2. */
  function applySuggestion(suggestion: Suggestion) {
    setItem(suggestion.item);
    if (suggestion.categoryId) setCategoryId(suggestion.categoryId);
    if (suggestion.vendor) setVendor(suggestion.vendor);
    if (suggestion.unit) setUnit(suggestion.unit);
    setAmount(String(suggestion.amount));
    setShowSuggestions(false);
  }

  async function uploadReceipt(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/receipt", { method: "POST", body });
      if (!response.ok) throw new Error();
      const { path } = (await response.json()) as { path: string };
      setReceiptUrl(path);
    } catch {
      toast.error("Receipt didn't upload - the expense will still save.");
    } finally {
      setUploading(false);
    }
  }

  function submit(addAnother: boolean) {
    startTransition(async () => {
      const result = await saveExpense({
        id: expense?.id,
        categoryId: categoryId || null,
        item,
        vendor: vendor || null,
        quantity: quantity ? Number(quantity) : null,
        unit: unit || null,
        unitPrice:
          quantity && amount && Number(quantity) > 0
            ? Number(amount) / Number(quantity)
            : null,
        amount: Number(amount) || 0,
        purchasedOn,
        paymentMethod: null,
        note: note || null,
        receiptUrl,
        expenseType,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("Saved");
      if (addAnother) {
        // Shopping trips are several items at once - keep the date and
        // vendor, clear what changes.
        setItem("");
        setQuantity("");
        setAmount("");
        setNote("");
        setReceiptUrl(null);
        onSaved();
        itemRef.current?.focus();
      } else {
        onDone();
      }
    });
  }

  return (
    <div className="rounded-md border border-rosewood/40 bg-cream-100 p-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-ink">
          {expense ? "Edit purchase" : "New purchase"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="flex h-9 w-9 items-center justify-center rounded-md text-ink/60"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <span className={label}>Whose expense is this?</span>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["business", "Sweet Bites"],
                ["home", "Home"],
              ] as const
            ).map(([value, text]) => (
              <button
                key={value}
                type="button"
                onClick={() => setExpenseType(value)}
                aria-pressed={expenseType === value}
                className={cn(
                  "min-h-11 rounded-md border text-sm transition-colors",
                  expenseType === value
                    ? "border-rosewood bg-rosewood/10 font-medium text-ink"
                    : "border-cream-200 bg-cream-50 text-ink/75"
                )}
              >
                {text}
              </button>
            ))}
          </div>
          {/* §13.3 - only the bakery's own spending belongs in the P&L. */}
          <p className="mt-1 text-xs text-ink/50">
            Home purchases are tracked here but left out of the Reports totals.
          </p>
        </div>

        <div className="relative">
          <label className={label} htmlFor="exp-item">
            What did you buy?
          </label>
          <input
            id="exp-item"
            ref={itemRef}
            value={item}
            onChange={(event) => {
              setItem(event.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            autoComplete="off"
            placeholder="Flour"
            className={field}
          />

          {showSuggestions && matches.length > 0 ? (
            <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-cream-200 bg-cream-50 shadow-cream">
              {matches.map((suggestion) => (
                <li key={suggestion.item}>
                  <button
                    type="button"
                    onClick={() => applySuggestion(suggestion)}
                    className="flex min-h-12 w-full items-center justify-between gap-3 px-3 text-left hover:bg-cream-100"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-ink">{suggestion.item}</span>
                      <span className="block truncate text-xs text-ink/50">
                        last on {suggestion.lastBought}
                        {suggestion.timesBought > 1 ? ` · ${suggestion.timesBought}×` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm text-ghee">
                      {formatPrice(suggestion.amount)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={label} htmlFor="exp-amount">
              Amount paid
            </label>
            <input
              id="exp-amount"
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className={field}
            />
          </div>
          <div>
            <label className={label} htmlFor="exp-category">
              Category
            </label>
            <select
              id="exp-category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className={field}
            >
              {/* The list is bakery categories (Ingredients, Fuel...) -
                  home purchases usually don't fit one, so leave it optional. */}
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className={label} htmlFor="exp-qty">
              Quantity
            </label>
            <input
              id="exp-qty"
              type="number"
              inputMode="decimal"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className={field}
            />
          </div>
          <div>
            <label className={label} htmlFor="exp-unit">
              Unit
            </label>
            <input
              id="exp-unit"
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              placeholder="kg"
              className={field}
            />
          </div>
          <div>
            <label className={label} htmlFor="exp-date">
              Date
            </label>
            <input
              id="exp-date"
              type="date"
              value={purchasedOn}
              onChange={(event) => setPurchasedOn(event.target.value)}
              className={field}
            />
          </div>
        </div>

        <div>
          <label className={label} htmlFor="exp-vendor">
            Vendor
          </label>
          <input
            id="exp-vendor"
            value={vendor}
            onChange={(event) => setVendor(event.target.value)}
            placeholder="Al-Madina Store"
            className={field}
          />
        </div>

        <div>
          <label className={label} htmlFor="exp-note">
            Note
          </label>
          <input
            id="exp-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className={field}
          />
        </div>

        <div>
          <label className={label} htmlFor="exp-receipt">
            Receipt photo
          </label>
          <input
            id="exp-receipt"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadReceipt(file);
              event.target.value = "";
            }}
            className="min-h-11 w-full rounded-md border border-dashed border-cream-200 bg-cream-50 p-2.5 text-sm text-ink/80 file:mr-3 file:min-h-9 file:rounded-md file:border-0 file:bg-cream-200 file:px-3 file:text-sm file:text-ink"
          />
          {uploading ? <p className="mt-1 text-xs text-ink/60">Uploading…</p> : null}
          {receiptUrl ? <p className="mt-1 text-xs text-pista">Receipt attached</p> : null}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={pending}
            className="min-h-12 flex-1 rounded-md bg-rosewood px-4 text-sm font-medium text-cream-50 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          {/* One shopping trip is many items - saving shouldn't close the
              form. Only for new purchases: on an edit it would write the
              same row again instead of adding one. */}
          {expense ? null : (
            <button
              type="button"
              onClick={() => submit(true)}
              disabled={pending}
              className="min-h-12 rounded-md border border-cream-200 bg-cream-50 px-4 text-sm text-ink disabled:opacity-50"
            >
              Save &amp; add another
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
