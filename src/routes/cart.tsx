import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Halfस्केच" },
      { name: "description", content: "Review the handmade pieces in your Halfस्केच cart." },
      { property: "og:title", content: "Your cart — Halfस्केच" },
      { property: "og:description", content: "Review your handmade pieces before checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, setQty, remove } = useCart();
  return (
    <div className="mx-auto max-w-[1100px] px-5 pt-12 md:px-10">
      <h1 className="display">Your cart</h1>
      {items.length === 0 ? (
        <div className="py-24">
          <p className="font-hand text-3xl text-pink">nothing here yet…</p>
          <Link to="/shop" className="btn-ink mt-8">Continue shopping</Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-16 md:grid-cols-[1.6fr_1fr]">
          <ul className="divide-y border-y">
            {items.map(({ product: p, quantity }) => (
              <li key={p.slug} className="flex gap-5 py-6">
                <img src={p.images[0]} alt={p.name} className="aspect-[4/5] w-24 bg-paper object-contain p-1.5" />
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-4">
                    <Link to="/shop/$slug" params={{ slug: p.slug }} className="font-medium link-sketch">{p.name}</Link>
                    <span className="tabular-nums">{formatPrice(p.price * quantity)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border text-sm" role="group" aria-label={`Quantity of ${p.name}`}>
                      <button className="px-3 py-1.5" aria-label="Decrease" onClick={() => setQty(p.slug, quantity - 1)}>−</button>
                      <span className="w-6 text-center tabular-nums">{quantity}</span>
                      <button className="px-3 py-1.5" aria-label="Increase" onClick={() => setQty(p.slug, quantity + 1)}>+</button>
                    </div>
                    <button className="eyebrow link-sketch text-muted-foreground" onClick={() => remove(p.slug)}>Remove</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="h-fit bg-paper p-8">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between border-t pt-3 text-base font-medium"><dt>Total</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
            </dl>
            <Link to="/checkout" className="btn-ink mt-8 w-full justify-center">Proceed to checkout</Link>
            <Link to="/shop" className="btn-line mt-4">Continue shopping</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
