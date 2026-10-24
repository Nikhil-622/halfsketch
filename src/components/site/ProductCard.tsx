import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { CATEGORY_LABEL, STATUS_LABEL, formatPrice, type Product } from "@/lib/products";

export function ProductCard({ product, tall = false, compact = false }: { product: Product; tall?: boolean; compact?: boolean }) {
  const soldOut = product.status === "sold-out" || (!product.available && product.status !== "retired" && product.status !== "coming-soon");
  const frame = compact ? "aspect-square p-2" : `${tall ? "aspect-[3/4]" : "aspect-[4/5]"} p-4`;
  const { add, setQty, items, openDrawer } = useCart();
  const qty = items.find((i) => i.slug === product.slug)?.quantity ?? 0;
  const canBuy = product.available && !soldOut && product.price > 0 && product.status !== "coming-soon";
  const to = { to: "/shop/$slug", params: { slug: product.slug } } as const;
  return (
    <div className="group min-w-0 max-w-full">
      <Link {...to} className="block" tabIndex={-1} aria-hidden>
        <div className={`relative overflow-hidden border border-foreground/15 bg-paper ${frame}`}>
          <img
            src={product.images[0]}
            alt=""
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="h-full w-full object-contain transition duration-700 group-hover:scale-[1.03]"
          />
          {soldOut || product.status ? (
            <span className="absolute left-1 top-1 bg-foreground px-1 py-px text-[0.5rem] font-medium uppercase leading-none tracking-[0.06em] text-background">{soldOut ? "Sold out" : STATUS_LABEL[product.status!]}</span>
          ) : null}
        </div>
      </Link>
      <div className="mt-3 flex items-start justify-between gap-2">
        <Link {...to} className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-medium leading-tight">{product.name}</h3>
          <p className="mt-1 truncate text-[0.58rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">{CATEGORY_LABEL[product.category]}</p>
        </Link>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <p className="text-right text-sm tabular-nums">
            {soldOut || product.price <= 0 ? <span className="text-muted-foreground">—</span> : (
              <>
                {product.mrp ? <span className="block text-xs text-muted-foreground line-through">{formatPrice(product.mrp)}</span> : null}
                {formatPrice(product.price)}
              </>
            )}
          </p>
          {/* Quantity in the cart, right under the price: + adds (up to the stock), − takes one out. */}
          {canBuy ? (
            <div className="flex items-center border text-sm" role="group" aria-label={`${product.name} in your cart`}>
              <button type="button" className="size-8 disabled:opacity-30" aria-label={`One fewer ${product.name}`}
                disabled={qty === 0} onClick={() => setQty(product.slug, qty - 1)}>−</button>
              <span className={`w-5 text-center tabular-nums ${qty ? "text-pink" : ""}`} aria-live="polite">{qty}</span>
              <button type="button" className="size-8 disabled:opacity-30" aria-label={`Add ${product.name} to cart`}
                disabled={qty >= product.stock} onClick={() => { add(product.slug); openDrawer(); }}>+</button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
