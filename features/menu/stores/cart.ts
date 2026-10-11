"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartComponent {
  componentId: string;
  name: string;
  priceDelta: number;
  quantity: number;
}

export interface CartLine {
  id: string;
  productId: string;
  name: string;
  imageUrl: string | null;
  basePrice: number;
  quantity: number;
  notes: string;
  components: CartComponent[];
}

export type NewCartLine = Omit<CartLine, "id">;

type CartState = {
  slug: string | null;
  lines: CartLine[];
  ensureSlug: (slug: string) => void;
  addLine: (line: NewCartLine) => void;
  removeLine: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  setNotes: (id: string, notes: string) => void;
  clear: () => void;
};

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      slug: null,
      lines: [],
      ensureSlug: (slug) => {
        if (get().slug !== slug) set({ slug, lines: [] });
      },
      addLine: (line) =>
        set((state) => ({ lines: [...state.lines, { ...line, id: newId() }] })),
      removeLine: (id) =>
        set((state) => ({ lines: state.lines.filter((line) => line.id !== id) })),
      setQuantity: (id, quantity) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.id === id ? { ...line, quantity: Math.max(1, quantity) } : line,
          ),
        })),
      setNotes: (id, notes) =>
        set((state) => ({
          lines: state.lines.map((line) => (line.id === id ? { ...line, notes } : line)),
        })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "web-menu-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
