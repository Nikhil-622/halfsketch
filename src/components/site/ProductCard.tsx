import { Link } from "@tanstack/react-router";
import { CATEGORY_LABEL, STATUS_LABEL, formatPrice, type Product } from "@/lib/products";

export function ProductCard({ product, tall = false }: { product: Product; tall?: boolean }) {
  const unavailable = !product.available;
  return (
    <Link to="/shop/$slug" params={{ slug: product.slug }} className="group block">
      <div className={`relative overflow-hidden bg-paper p-4 ${tall ? "aspect-[3/4]" : "aspect-[4/5]"}`}>
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full object-contain transition duration-700 group-hover:scale-[1.03] ${unavailable ? "opacity-60 grayscale-[40%]" : ""}`}
        />
        {product.status && (
          <span className="font-hand absolute left-3 top-2 -rotate-3 text-xl text-pink">{STATUS_LABEL[product.status].toLowerCase()}</span>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <div>
          <h3 className="text-base font-medium">{product.name}</h3>
          <p className="eyebrow mt-1 text-muted-foreground">{CATEGORY_LABEL[product.category]}</p>
        </div>
        <p className="text-sm tabular-nums">{unavailable ? <span className="text-muted-foreground">—</span> : formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
