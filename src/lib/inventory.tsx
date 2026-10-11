import { createContext, useContext, useState, type ReactNode } from "react";
import { type Product } from "./products";

const KEY = "halfsketch-stock";

export function withStock(product: Product, counts: Record<string, number> | null): Product {
  if (product.status === "retired") return product;
  const saved = counts && product.slug in counts ? counts[product.slug]! : product.stock;
  const stock = saved <= 0 ? 0 : 1;
  if (stock === 0) return { ...product, stock: 0, available: false, status: "sold-out" };
  return { ...product, stock: 1, available: true, status: product.status === "sold-out" ? "new" : product.status };
}

export function readStock(): Record<string, number> {
  if (typeof localStorage === "undefined") return {};
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, unknown>;
    const counts: Record<string, number> = {};
    for (const [slug, value] of Object.entries(data)) {
      const stock = Math.floor(Number(value));
      if (Number.isFinite(stock)) counts[slug] = stock <= 0 ? 0 : 1;
    }
    return counts;
  } catch {
    return {};
  }
}

export function listInventory() {
  return Promise.resolve(readStock());
}

export function setStock(slug: string, stock: number) {
  const count = Math.floor(stock);
  if (!Number.isFinite(count) || count < 0) throw new Error("Enter a stock count of 0 or more.");
  const counts = { ...readStock(), [slug]: count <= 0 ? 0 : 1 };
  localStorage.setItem(KEY, JSON.stringify(counts));
  return Promise.resolve();
}

interface InventoryCtx {
  counts: Record<string, number> | null;
  apply: (product: Product) => Product;
  save: (slug: string, stock: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<InventoryCtx | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<Record<string, number> | null>(() => readStock());

  const value: InventoryCtx = {
    counts,
    apply: (product) => withStock(product, counts),
    save: async (slug, stock) => {
      await setStock(slug, stock);
      setCounts(readStock());
    },
    refresh: async () => { setCounts(readStock()); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useInventory() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useInventory must be used inside InventoryProvider");
  return ctx;
}
