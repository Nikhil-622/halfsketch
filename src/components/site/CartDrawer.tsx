import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function CartDrawer() {
  const { items, count, subtotal, setQty, remove, drawerOpen, setDrawerOpen, closeDrawer } = useCart();

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-foreground/20 bg-paper p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-foreground/15 px-5 py-4 pr-12 text-left">
          <SheetTitle className="font-script text-5xl font-normal leading-none">Your cart</SheetTitle>
          <SheetDescription className="mt-1 text-sm text-muted-foreground">
            {count === 0 ? "Nothing here yet" : `${count} ${count === 1 ? "piece" : "pieces"}`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-4 px-5 py-10">
            <p className="accent">nothing here yet…</p>
            <Link to="/shop" className="btn-ink" onClick={closeDrawer}>Continue shopping</Link>
          </div>
        ) : (
          <>
            <ul className="min-h-0 flex-1 overflow-y-auto divide-y border-b border-foreground/15 px-5">
              {items.map(({ product: p, quantity }) => (
                <li key={p.slug} className="flex gap-3 py-4">
                  <img src={p.images[0]} alt="" className="aspect-[4/5] w-16 shrink-0 bg-background object-contain p-1" />
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to="/shop/$slug"
                        params={{ slug: p.slug }}
                        className="link-sketch min-w-0 text-sm font-medium leading-tight"
                        onClick={closeDrawer}
                      >
                        {p.name}
                      </Link>
                      <span className="shrink-0 text-sm tabular-nums">{formatPrice(p.price * quantity)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border text-sm" role="group" aria-label={`Quantity of ${p.name}`}>
                        <button type="button" className="size-8" aria-label="Decrease" onClick={() => setQty(p.slug, quantity - 1)}>−</button>
                        <span className="w-5 text-center tabular-nums">{quantity}</span>
                        <button
                          type="button"
                          className="size-8 disabled:opacity-30"
                          aria-label="Increase"
                          disabled={quantity >= p.stock}
                          onClick={() => setQty(p.slug, quantity + 1)}
                        >+</button>
                      </div>
                      <button
                        type="button"
                        className="link-sketch py-1 text-[0.58rem] font-medium uppercase tracking-[0.12em] text-muted-foreground"
                        onClick={() => remove(p.slug)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-auto space-y-3 border-t border-foreground/15 px-5 py-4">
              <div className="flex justify-between text-sm font-medium">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <Link to="/cart" className="btn-line w-full" onClick={closeDrawer}>View cart</Link>
              <Link to="/checkout" className="btn-ink w-full" onClick={closeDrawer}>Checkout</Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
