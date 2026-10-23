import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth, type CartLine } from "./auth";
import { getProduct, type Product } from "./products";
import { useCatalog } from "./studio";

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
const LEGACY = "halfsketch-cart";

function cartKey(email: string) {
  return `${LEGACY}:${email.trim().toLowerCase()}`;
}

function readLocal(email: string): CartItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(cartKey(email)) || "[]") as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mergeCarts(local: CartItem[], cloud: CartLine[]): CartItem[] {
  const totals = new Map<string, number>();
  for (const line of [...cloud, ...local]) {
    const catalog = getProduct(line.slug);
    if (!catalog) {
      totals.set(line.slug, Math.min(99, (totals.get(line.slug) ?? 0) + line.quantity));
      continue;
    }
    if (!catalog.available) continue;
    totals.set(line.slug, Math.min(catalog.stock, (totals.get(line.slug) ?? 0) + line.quantity));
  }
  return [...totals.entries()].map(([slug, quantity]) => ({ slug, quantity }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { ready: authReady, user, loadCart, saveCart } = useAuth();
  const { ready: catalogReady } = useCatalog();
  const [raw, setRaw] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const syncing = useRef(false);
  const owner = useRef("");

  useEffect(() => {
    if (!authReady) return;
    let cancel = false;
    syncing.current = false;
    const email = user?.email?.trim().toLowerCase() ?? "";
    if (owner.current !== email) {
      owner.current = email;
      setRaw(email ? readLocal(email) : []);
      setLoaded(false);
    }
    localStorage.removeItem(LEGACY);
    (async () => {
      if (!email) {
        if (!cancel) setLoaded(true);
        return;
      }
      try {
        const local = readLocal(email);
        const cloud = await loadCart();
        if (cancel || owner.current !== email) return;
        const next = mergeCarts(local.length ? local : cloud, []);
        syncing.current = true;
        setRaw(next);
        setLoaded(true);
      } catch {
        if (!cancel && owner.current === email) {
          setRaw(readLocal(email));
          setLoaded(true);
        }
      }
    })();
    return () => { cancel = true; };
  }, [authReady, user, loadCart]);

  useEffect(() => {
    if (!loaded || !catalogReady) return;
    setRaw((r) => {
      const next = r.flatMap((line) => {
        const catalog = getProduct(line.slug);
        if (!catalog) return [];
        if (!catalog.available || catalog.stock < 1) return [];
        return [{ slug: line.slug, quantity: Math.min(catalog.stock, line.quantity) }];
      });
      const same = next.length === r.length && next.every((line, i) => line.slug === r[i]?.slug && line.quantity === r[i]?.quantity);
      return same ? r : next;
    });
  }, [loaded, catalogReady]);

  useEffect(() => {
    const email = user?.email?.trim().toLowerCase() ?? "";
    if (!loaded || !email || owner.current !== email) return;
    localStorage.setItem(cartKey(email), JSON.stringify(raw));
    if (syncing.current) saveCart(raw).catch(() => { /* keep this email's cart locally if Firebase is unreachable */ });
  }, [raw, loaded, user, saveCart]);

  const items = raw.flatMap((i) => {
    const catalog = getProduct(i.slug);
    if (!catalog) return [];
    return catalog.available ? [{ ...i, quantity: Math.min(catalog.stock, i.quantity), product: catalog }] : [];
  });

  const value: CartCtx = {
    items,
    count: items.reduce((s, i) => s + i.quantity, 0),
    subtotal: items.reduce((s, i) => s + i.quantity * i.product.price, 0),
    loaded,
    add: (slug, qty = 1) => setRaw((r) => {
      const catalog = getProduct(slug);
      const max = catalog?.stock ?? 0;
      if (max < 1) return r;
      const ex = r.find((i) => i.slug === slug);
      if (ex) return r.map((i) => i.slug === slug ? { ...i, quantity: Math.min(max, i.quantity + qty) } : i);
      return [...r, { slug, quantity: Math.min(max, qty) }];
    }),
    setQty: (slug, qty) => setRaw((r) => qty <= 0 ? r.filter((i) => i.slug !== slug)
      : r.map((i) => {
        const catalog = getProduct(slug);
        const max = catalog?.stock ?? 1;
        return i.slug === slug ? { ...i, quantity: Math.min(max, qty) } : i;
      })),
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
