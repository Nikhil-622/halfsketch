import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth, type CartLine } from "./auth";
import { getProduct, type Product } from "./products";

export interface CartItem { slug: string; quantity: number }
interface CartCtx {
  items: (CartItem & { product: Product })[];
  count: number;
  subtotal: number;
  loaded: boolean;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "halfsketch-cart";

function readLocal(): CartItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]") as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mergeCarts(local: CartItem[], cloud: CartLine[]): CartItem[] {
  const totals = new Map<string, number>();
  for (const line of [...cloud, ...local]) {
    const product = getProduct(line.slug);
    if (!product?.available) continue;
    totals.set(line.slug, Math.min(product.stock, (totals.get(line.slug) ?? 0) + line.quantity));
  }
  return [...totals.entries()].map(([slug, quantity]) => ({ slug, quantity }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { ready: authReady, user, loadCart, saveCart } = useAuth();
  const [raw, setRaw] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const syncing = useRef(false);

  useEffect(() => {
    if (!authReady) return;
    let cancel = false;
    syncing.current = false;
    (async () => {
      const local = readLocal();
      if (!user) {
        if (!cancel) {
          setRaw(local);
          setLoaded(true);
        }
        return;
      }
      try {
        const cloud = await loadCart();
        if (cancel) return;
        const merged = mergeCarts(local, cloud);
        syncing.current = true;
        setRaw(merged);
        setLoaded(true);
        await saveCart(merged);
      } catch {
        if (!cancel) {
          setRaw(local);
          setLoaded(true);
        }
      }
    })();
    return () => { cancel = true; };
  }, [authReady, user, loadCart, saveCart]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(KEY, JSON.stringify(raw));
    if (syncing.current && user) saveCart(raw).catch(() => { /* keep the local cart if Firebase is unreachable */ });
  }, [raw, loaded, user, saveCart]);

  const items = raw.flatMap((i) => {
    const product = getProduct(i.slug);
    return product && product.available ? [{ ...i, product }] : [];
  });

  const value: CartCtx = {
    items,
    count: items.reduce((s, i) => s + i.quantity, 0),
    subtotal: items.reduce((s, i) => s + i.quantity * i.product.price, 0),
    loaded,
    add: (slug, qty = 1) => setRaw((r) => {
      const max = getProduct(slug)?.stock ?? 1;
      const ex = r.find((i) => i.slug === slug);
      if (ex) return r.map((i) => i.slug === slug ? { ...i, quantity: Math.min(max, i.quantity + qty) } : i);
      return [...r, { slug, quantity: Math.min(max, qty) }];
    }),
    setQty: (slug, qty) => setRaw((r) => qty <= 0 ? r.filter((i) => i.slug !== slug)
      : r.map((i) => i.slug === slug ? { ...i, quantity: Math.min(getProduct(slug)?.stock ?? 1, qty) } : i)),
    remove: (slug) => setRaw((r) => r.filter((i) => i.slug !== slug)),
    clear: () => setRaw([]),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
