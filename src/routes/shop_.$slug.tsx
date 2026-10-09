import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { CATEGORY_LABEL, STATUS_LABEL, formatPrice, getProduct } from "@/lib/products";

export const Route = createFileRoute("/shop_/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found — Halfस्केच" }, { name: "robots", content: "noindex" }] };
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.name} — Halfस्केच` },
        { name: "description", content: p.description },
        { property: "og:title", content: `${p.name} — Halfस्केच` },
        { property: "og:description", content: p.description },
        { property: "og:type", content: "product" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <h1 className="heading">This sketch wandered off.</h1>
      <Link to="/shop" className="btn-ink mt-8">Back to the shop</Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product: p } = Route.useLoaderData();
  const { add } = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <article className="mx-auto max-w-[1400px] px-5 pt-10 md:px-10">
      <Link to="/shop" className="eyebrow link-sketch text-muted-foreground">← Shop</Link>
      <div className="mt-8 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <img src={p.images[0]} alt={p.name} className="aspect-[4/5] w-full bg-paper object-contain p-4 md:p-8" />
        </div>
        <div className="md:col-span-5 md:sticky md:top-24 md:self-start">
          <p className="eyebrow text-muted-foreground">
            {CATEGORY_LABEL[p.category]}{p.sketchNo && ` · Sketch ${p.sketchNo}`}
          </p>
          <h1 className="heading mt-4">{p.name}</h1>
          {p.status && <p className="font-hand mt-2 text-2xl text-pink">{STATUS_LABEL[p.status].toLowerCase()}</p>}
          <p className="mt-6 text-2xl tabular-nums">{formatPrice(p.price)}</p>
          <p className="mt-6 text-muted-foreground">{p.description}</p>

          {p.available ? (
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <div className="flex items-center border" role="group" aria-label="Quantity">
                <button className="px-4 py-3" aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span className="w-8 text-center tabular-nums" aria-live="polite">{qty}</span>
                <button className="px-4 py-3" aria-label="Increase quantity" onClick={() => setQty(Math.min(p.stock, qty + 1))}>+</button>
              </div>
              <button className="btn-ink" onClick={() => { add(p.slug, qty); setAdded(true); }}>Add to cart</button>
              {added && (
                <button className="btn-line" onClick={() => navigate({ to: "/cart" })}>Added — view cart →</button>
              )}
            </div>
          ) : (
            <p className="mt-10 eyebrow text-muted-foreground">This piece is no longer available.</p>
          )}

          <section className="mt-16 border-t pt-8">
            <h2 className="eyebrow">The story</h2>
            {p.story.split(/\n\n+/).map((para) => (
              <p key={para} className="mt-4 leading-relaxed">{para}</p>
            ))}
          </section>
          {p.feeling && (
            <section className="mt-10 border-t pt-8">
              <h2 className="eyebrow">The feeling</h2>
              <p className="font-hand mt-4 text-2xl text-pink">{p.feeling}</p>
            </section>
          )}
          <section className="mt-10 border-t pt-8">
            <h2 className="eyebrow">The details</h2>
            <dl className="mt-4 divide-y text-sm">
              {p.details.map((d) => (
                <div key={d.label} className="flex justify-between gap-4 py-3"><dt className="text-muted-foreground">{d.label}</dt><dd className="text-right">{d.value}</dd></div>
              ))}
            </dl>
          </section>
          <section className="mt-10 bg-paper p-6">
            <h2 className="font-hand text-2xl text-pink">a little note</h2>
            <p className="mt-2 text-sm text-muted-foreground">Every piece is painted by hand, so yours may differ slightly from the photos — a softer wash, a different stroke. That's the handmade part, not a flaw.</p>
          </section>
        </div>
      </div>
    </article>
  );
}
