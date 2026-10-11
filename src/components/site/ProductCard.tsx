import { Link } from "@tanstack/react-router";
import { useInventory } from "@/lib/inventory";
import { CATEGORY_LABEL, STATUS_LABEL, formatPrice, type Product } from "@/lib/products";

export function ProductCard({ product: catalog, tall = false, compact = false }: { product: Product; tall?: boolean; compact?: boolean }) {
  const { apply } = useInventory();
  const product = apply(catalog);
  const soldOut = product.status === "sold-out" || (!product.available && product.status !== "retired" && product.status !== "coming-soon");
  const frame = compact ? "aspect-square p-2" : `${tall ? "aspect-[3/4]" : "aspect-[4/5]"} p-4`;
  return (
    <Link to="/shop/$slug" params={{ slug: product.slug }} className="group block min-w-0 max-w-full">
      <div className={`relative overflow-hidden bg-paper ${frame}`}>
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className="h-full w-full object-contain transition duration-700 group-hover:scale-[1.03]"
        />
        {soldOut || product.status ? (
          <span className="absolute left-1 top-1 bg-foreground px-1 py-px text-[0.5rem] font-medium uppercase leading-none tracking-[0.06em] text-background">{soldOut ? "Sold out" : STATUS_LABEL[product.status!]}</span>
        ) : null}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-medium leading-tight">{product.name}</h3>
          <p className="mt-1 truncate text-[0.58rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">{CATEGORY_LABEL[product.category]}</p>
        </div>
        <p className="shrink-0 text-right text-sm tabular-nums">
          {soldOut ? <span className="text-muted-foreground">—</span> : (
            <>
              {product.mrp ? <span className="block text-xs text-muted-foreground line-through">{formatPrice(product.mrp)}</span> : null}
              {formatPrice(product.price)}
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
