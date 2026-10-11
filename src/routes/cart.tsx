import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
  const [capped, setCapped] = useState<string | null>(null);
  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-6 md:px-10 md:pt-12">
      <h1 className="text-2xl font-semibold leading-none tracking-[-0.03em] md:text-[clamp(2.6rem,7vw,6.5rem)]">Your cart</h1>
      {items.length === 0 ? (
        <div className="py-24">
          <p className="font-hand text-3xl text-pink">nothing here yet…</p>
          <Link to="/shop" className="btn-ink mt-8">Continue shopping</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:mt-12 md:grid-cols-[1.6fr_1fr] md:gap-16">
          <ul className="divide-y border-y">
            {items.map(({ product: p, quantity }) => (
              <li key={p.slug} className="flex gap-3 py-4 md:gap-5 md:py-6">
                <img src={p.images[0]} alt={p.name} className="aspect-[4/5] w-16 shrink-0 bg-paper object-contain p-1 md:w-24 md:p-1.5" />
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <Link to="/shop/$slug" params={{ slug: p.slug }} className="link-sketch min-w-0 text-sm font-medium leading-tight">{p.name}</Link>
                    <span className="shrink-0 text-sm tabular-nums">{formatPrice(p.price * quantity)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-5">
                      <div className="flex items-center border text-xs" role="group" aria-label={`Quantity of ${p.name}`}>
                        <button className="px-2.5 py-1" aria-label="Decrease" onClick={() => { setCapped(null); setQty(p.slug, quantity - 1); }}>−</button>
                        <span className="w-5 text-center tabular-nums">{quantity}</span>
                        <button className="px-2.5 py-1" aria-label="Increase" onClick={() => quantity >= p.stock ? setCapped(p.slug) : setQty(p.slug, quantity + 1)}>+</button>
                      </div>
                      <button className="link-sketch text-[0.62rem] font-medium uppercase tracking-[0.12em] text-muted-foreground" onClick={() => { setCapped(null); remove(p.slug); }}>Remove</button>
                    </div>
                    {capped === p.slug ? <p className="mt-1 text-[0.62rem] text-pink" role="status">Only {p.stock} available</p> : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="h-fit bg-paper p-4 md:p-8">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between border-t pt-2 font-medium"><dt>Total</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
            </dl>
            <Link to="/checkout" className="btn-ink mt-4 w-full justify-center whitespace-nowrap !px-3 !py-2 !text-[0.62rem]">Proceed to checkout</Link>
            <Link to="/shop" className="btn-line mt-3 !py-1 !text-[0.62rem]">Continue shopping</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
