import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { CATEGORY_LABEL, STATUS_LABEL, formatPrice, getProduct } from "@/lib/products";
import { addReview, listReviews, useCatalog, type Review } from "@/lib/studio";

export const Route = createFileRoute("/shop_/$slug")({
  loader: ({ params }) => {
    if (getProduct(params.slug)?.edition) throw redirect({ to: "/mail-club" });
    return { slug: params.slug, product: getProduct(params.slug) ?? null };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.product) return { meta: [{ title: "Piece — Halfस्केच" }, { name: "robots", content: "noindex" }] };
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
  const { slug, product: loaded } = Route.useLoaderData();
  const { ready } = useCatalog();
  const { add, items, openDrawer } = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [note, setNote] = useState("");
  const found = getProduct(slug) ?? loaded;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewNote, setReviewNote] = useState("");
  useEffect(() => { listReviews().then((rows) => setReviews(rows.filter((row) => row.slug === slug))).catch(() => setReviews([])); }, [slug]);
  if (!found) {
    if (!ready) return <div className="min-h-[50vh]" />;
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="heading">This sketch wandered off.</h1>
        <Link to="/shop" className="btn-ink mt-8">Back to the shop</Link>
      </div>
    );
  }
  const p = found;
  const soldOut = p.status === "sold-out" || (!p.available && p.status !== "retired" && p.status !== "coming-soon");

  return (
    <article className="mx-auto max-w-[1400px] px-5 pt-4 md:px-10 md:pt-8">
      <Link to="/shop" className="eyebrow link-sketch text-muted-foreground">← Shop</Link>
      <div className="mt-3 grid gap-8 md:mt-6 md:grid-cols-12 md:gap-12">
        <div className="relative md:col-span-7">
          <img src={p.images[0]} alt={p.name} width={900} height={1125} sizes="(max-width: 768px) 100vw, 40vw" fetchPriority="high" decoding="async" className="aspect-square w-full border border-foreground/15 bg-paper object-contain p-3 md:aspect-[4/5] md:p-8" />
          {soldOut ? (
            <span className="absolute left-1 top-1 bg-foreground px-1 py-px text-[0.5rem] font-medium uppercase leading-none tracking-[0.06em] text-background">Sold out</span>
          ) : null}
        </div>
        <div className="md:col-span-5 md:sticky md:top-24 md:self-start">
          <p className="eyebrow text-muted-foreground">
            {CATEGORY_LABEL[p.category]}{p.collection ? ` · ${p.collection}` : ""}{p.sketchNo && ` · Sketch ${p.sketchNo}`}
          </p>
          {/* Script flourishes need extra line-box room — line-clamp was clipping ascenders. */}
          <h1 className="heading mt-2 overflow-visible pt-2 leading-[1.3]">{p.name}</h1>
          {p.status && !soldOut && (
            <p className="mt-2 inline-block bg-foreground px-2 py-1 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-background">{STATUS_LABEL[p.status]}</p>
          )}
          <p className="mt-2 text-2xl tabular-nums">
            {p.mrp ? <span className="mr-2 text-lg text-muted-foreground line-through">{formatPrice(p.mrp)}</span> : null}
            {formatPrice(p.price)}
          </p>
          {p.variants ? <p className="mt-2 text-sm text-muted-foreground">Variants: {p.variants}</p> : null}
          <p className="type mt-3">{p.description}</p>

          {p.available ? (
            <div className="sticky bottom-[calc(var(--tabbar)+env(safe-area-inset-bottom))] z-20 -mx-5 mt-4 flex flex-wrap items-center gap-2 border-t bg-background/95 px-5 py-3 backdrop-blur-sm md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
              <div className="flex items-center border text-sm" role="group" aria-label="Quantity">
                <button className="size-11" aria-label="Decrease quantity" onClick={() => { setNote(""); setQty(Math.max(1, qty - 1)); }}>−</button>
                <span className="w-6 text-center tabular-nums" aria-live="polite">{qty}</span>
                <button className="size-11" aria-label="Increase quantity" onClick={() => qty >= p.stock ? setNote(`Only ${p.stock} available`) : (setNote(""), setQty(qty + 1))}>+</button>
              </div>
              <button className="btn-ink flex-1 whitespace-nowrap !px-4 !py-3 md:flex-none" onClick={() => {
                const held = items.find((i) => i.slug === p.slug)?.quantity ?? 0;
                if (held + qty > p.stock) { setNote(`Only ${p.stock} available`); return; }
                add(p.slug, qty); setAdded(true); setNote(""); openDrawer();
              }}>Add to cart</button>
              {note ? <p className="w-full text-[0.62rem] text-pink" role="status">{note}</p> : null}
              {added && (
                <button className="btn-line whitespace-nowrap !py-1" onClick={() => navigate({ to: "/cart" })}>Added — view cart →</button>
              )}
            </div>
          ) : (
            <p className="mt-10 eyebrow text-muted-foreground">This piece is no longer available.</p>
          )}

          <section className="mt-16 border-t pt-8">
            <h2 className="eyebrow">The story</h2>
            {p.story.split(/\n\n+/).map((para) => (
              <p key={para} className="type mt-4">{para}</p>
            ))}
          </section>
          {p.feeling && (
            <section className="mt-10 border-t pt-8">
              <h2 className="eyebrow">The feeling</h2>
              <p className="accent mt-4">{p.feeling}</p>
            </section>
          )}
          {p.details.length ? <section className="mt-10 border-t pt-8">
            <h2 className="eyebrow">The details</h2>
            <dl className="mt-4 divide-y text-sm">
              {p.details.map((d) => (
                <div key={d.label} className="flex justify-between gap-4 py-3"><dt className="text-muted-foreground">{d.label}</dt><dd className="text-right">{d.value}</dd></div>
              ))}
            </dl>
          </section> : null}
          <section className="mt-10 border-t pt-8">
            <h2 className="eyebrow">Reviews</h2>
            {reviews.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No reviews yet.</p> : reviews.map((review) => (
              <p key={review.id} className="mt-4 text-sm"><span className="font-medium">{review.name}</span> · {"★".repeat(review.stars)}<br />{review.text}</p>
            ))}
            <form className="mt-6 grid gap-3" onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const data = new FormData(form);
              setReviewNote("");
              try {
                await addReview({ slug, name: String(data.get("name") || ""), stars: Number(data.get("stars") || 5), text: String(data.get("text") || "") });
                setReviews(await listReviews().then((rows) => rows.filter((row) => row.slug === slug)));
                form.reset();
                setReviewNote("Saved. Thank you.");
              } catch (err) {
                setReviewNote(err instanceof Error ? err.message : "We couldn't save that review.");
              }
            }}>
              <input name="name" required placeholder="Your name" className="field" />
              <select name="stars" className="field" defaultValue="5" aria-label="Stars">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
              </select>
              <textarea name="text" required placeholder="How does this piece feel?" className="field min-h-24" />
              <button className="btn-line justify-self-start" type="submit">Leave a review</button>
              {reviewNote ? <p className="text-sm text-muted-foreground">{reviewNote}</p> : null}
            </form>
          </section>
          <section className="mt-10 bg-paper p-6">
            <h2 className="accent">a little note</h2>
            <p className="type mt-2">Every piece is painted by hand, so yours may differ slightly from the photos — a softer wash, a different stroke. That's the handmade part, not a flaw.</p>
          </section>
        </div>
      </div>
    </article>
  );
}
