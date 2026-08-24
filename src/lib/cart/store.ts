"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, NewCartItem } from "@/lib/cart/types";

const MAX_QTY = 20;

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  /**
   * False until the persisted cart has been read back from
   * localStorage. Rendering counts before that would mismatch the
   * server-rendered HTML and trigger a hydration error.
   */
  hasHydrated: boolean;
  addItem: (item: NewCartItem) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  setHasHydrated: (value: boolean) => void;
};

/** Two lines merge only if every buyer-visible choice matches. */
function isSameLine(a: CartItem, b: NewCartItem): boolean {
  return (
    a.productId === b.productId &&
    a.sizeLabel === b.sizeLabel &&
    a.flavor === b.flavor &&
    a.cakeMessage.trim() === b.cakeMessage.trim()
  );
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      hasHydrated: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((line) => isSameLine(line, item));

          if (existing) {
            return {
              isOpen: true,
              items: state.items.map((line) =>
                line.id === existing.id
                  ? { ...line, qty: Math.min(MAX_QTY, line.qty + item.qty) }
                  : line
              ),
            };
          }

          return {
            isOpen: true,
            items: [...state.items, { ...item, id: crypto.randomUUID() }],
          };
        }),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((line) => line.id !== id) })),

      setQty: (id, qty) =>
        set((state) => ({
          items: state.items.map((line) =>
            line.id === id ? { ...line, qty: Math.min(MAX_QTY, Math.max(1, qty)) } : line
          ),
        })),

      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "sweetbites-cart",
      storage: createJSONStorage(() => localStorage),
      // Only the items persist. isOpen is UI state - a cart that
      // reopened itself on every page load would be maddening - and the
      // rest are actions.
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        // Fires once localStorage has been read. Runs even when there
        // was nothing stored, which is what lets the badge render 0
        // instead of hanging on a skeleton forever.
        state?.setHasHydrated(true);
      },
    }
  )
);

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, line) => {
    const addons = line.addons.reduce((a, addon) => a + addon.price, 0);
    return sum + (line.unitPrice + addons) * line.qty;
  }, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, line) => sum + line.qty, 0);
}

/** §8 rule 1 - the slowest item in the cart sets the date for all of them. */
export function cartLeadTimes(items: CartItem[]): number[] {
  return items.map((line) => line.leadTimeDays);
}
