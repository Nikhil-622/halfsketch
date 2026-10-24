import { Link, useRouterState } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";

const HIDDEN = new Set(["/cart", "/checkout", "/payment"]);

export function CartNudge() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { items, count, subtotal, drawerOpen, openDrawer } = useCart();

  if (count < 1 || drawerOpen || HIDDEN.has(pathname)) return null;

  const thumbs = items.slice(0, 2);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 z-30 flex justify-center px-4 bottom-[calc(var(--tabbar)+env(safe-area-inset-bottom)+0.75rem)] md:bottom-6"
    >
      <div className="pointer-events-auto flex w-full max-w-md animate-in fade-in slide-in-from-bottom-3 items-stretch gap-3 rounded-2xl border border-foreground/15 bg-paper/95 p-2 shadow-[0_10px_30px_-18px_rgb(0_0_0/0.45)] duration-300 fill-mode-both backdrop-blur-sm">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-1.5 text-left"
          onClick={openDrawer}
          aria-label={`Open cart, ${count} ${count === 1 ? "piece" : "pieces"}, ${formatPrice(subtotal)}`}
        >
          <span className="flex shrink-0 -space-x-2" aria-hidden>
            {thumbs.map(({ product: p }, i) => (
              <img
                key={p.slug}
                src={p.images[0]}
                alt=""
                className="size-9 rounded-xl border border-foreground/15 bg-background object-contain p-0.5"
                style={{ zIndex: thumbs.length - i }}
              />
            ))}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium leading-tight">
              {count} {count === 1 ? "piece" : "pieces"}
            </span>
            <span className="block text-xs tabular-nums text-muted-foreground">{formatPrice(subtotal)}</span>
          </span>
        </button>
        <Link
          to="/checkout"
          className="inline-flex shrink-0 items-center justify-center self-stretch rounded-2xl border border-foreground/30 bg-transparent px-4 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-foreground transition hover:border-pink hover:text-pink"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
