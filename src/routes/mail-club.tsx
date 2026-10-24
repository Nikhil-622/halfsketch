import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { SHIPPING_RUPEES } from "@/lib/orders.functions";
import { INSTAGRAM_URL, MAIL_CLUB, PRODUCTS, formatPrice, getProduct } from "@/lib/products";
import { useCatalog } from "@/lib/studio";

export const Route = createFileRoute("/mail-club")({
  head: () => ({
    meta: [
      { title: `November Mail Club — ${MAIL_CLUB.theme} — Halfस्केच` },
      { name: "description", content: `A one-time parcel of handmade art and stationery from Halfस्केच. ${MAIL_CLUB.message}` },
      { property: "og:title", content: "The November Mail Club — Halfस्केच" },
      { property: "og:description", content: `${MAIL_CLUB.theme}. ${MAIL_CLUB.message}` },
      { property: "og:type", content: "product" },
    ],
  }),
  component: MailClub,
});

const wrap = "mx-auto max-w-[1400px] px-5 md:px-10";

const STEPS = [
  ["You pre-order once", "Pay for this one parcel. There's no subscription and nothing renews."],
  ["We make & pack it by hand", "Every piece is painted, printed and tucked into its envelope at our desk."],
  ["It arrives in your letterbox", "A small parcel with your name on it — a slow afternoon, posted."],
] as const;

function MailClub() {
  const { ready } = useCatalog();
  const { items, add, setQty } = useCart();
  const navigate = useNavigate();
  const [qty, setQtyDraft] = useState(1);
  const base = PRODUCTS.find((p) => p.slug === MAIL_CLUB.slug)!;
  const p = getProduct(MAIL_CLUB.slug) ?? base;
  const open = p.available && p.price > 0;
  const soldOut = p.status === "sold-out";

  function preorder() {
    if (!open) return;
    const n = Math.min(Math.max(1, qty), p.stock);
    // Re-clicking just resets the quantity — it never stacks a second line or places an order by itself.
    if (items.some((i) => i.slug === p.slug)) setQty(p.slug, n);
    else add(p.slug, n);
    navigate({ to: "/checkout" });
  }

  const cta = !ready ? "Checking this edition…" : open ? "Pre-order now" : soldOut ? "This edition is sold out" : "Pre-orders open soon";

  return (
    <div className="pb-24 md:pb-0">
      {/* HERO + PURCHASE */}
      <section className="relative isolate overflow-hidden border-b border-foreground/20">
        <div aria-hidden className="absolute inset-0 -z-10 bg-paper" />
        <div className={`${wrap} grid items-center gap-8 py-8 md:grid-cols-2 md:gap-14 md:py-20`}>
          <img src={MAIL_CLUB.cover} alt="The November Mail Club: a sleepy cat postcard, an ivy bookmark, a November calendar, three art stamps and a letter" width={1200} height={1200}
            fetchPriority="high" className="mx-auto aspect-square w-full max-w-md border border-foreground/30 bg-background object-cover shadow-[0_10px_30px_-18px_rgb(0_0_0/0.45)]" />
          <div>
            <p className="eyebrow text-muted-foreground">Halfस्केच Mail Club · {MAIL_CLUB.editionLabel}</p>
            <h1 className="display mt-3">{MAIL_CLUB.theme}</h1>
            <p className="accent mt-3">“{MAIL_CLUB.message}”</p>
            <p className="type mt-5 max-w-md">
              A small parcel of handmade art and stationery — a postcard, a bookmark, a calendar, three art stamps and a letter — sent once,
              to remind you that quiet days count too.
            </p>

            <div className="mt-6 border-y border-foreground/20 py-5" id="buy">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="text-2xl tabular-nums">{ready && p.price > 0 ? formatPrice(p.price) : <span className="text-muted-foreground">Price coming soon</span>}</p>
                <p className="eyebrow">{!ready ? "" : open ? "Limited edition · pre-order" : soldOut ? "Sold out" : "Coming soon"}</p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">One-time purchase for the November edition — you'll never be charged again.</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {open ? (
                  <div className="flex items-center border text-sm" role="group" aria-label="Number of parcels">
                    <button type="button" className="size-11" aria-label="One fewer parcel" onClick={() => setQtyDraft(Math.max(1, qty - 1))}>−</button>
                    <span className="w-6 text-center tabular-nums" aria-live="polite">{qty}</span>
                    <button type="button" className="size-11" aria-label="One more parcel" disabled={qty >= p.stock} onClick={() => setQtyDraft(Math.min(p.stock, qty + 1))}>+</button>
                  </div>
                ) : null}
                <button type="button" className="btn-ink flex-1 whitespace-nowrap !px-4 md:flex-none" disabled={!open} onClick={preorder}>{cta}</button>
              </div>
              {ready && !open && !soldOut ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Want to know the moment it opens? <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="link-sketch text-foreground">Follow us on Instagram</a>.
                </p>
              ) : null}
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="eyebrow text-muted-foreground">Shipping</dt><dd className="mt-1">Posted within India. {formatPrice(SHIPPING_RUPEES)} shipping per order is added at checkout.{MAIL_CLUB.shipsNote ? ` ${MAIL_CLUB.shipsNote}` : ""}</dd></div>
              <div><dt className="eyebrow text-muted-foreground">Payment</dt><dd className="mt-1">Pay by UPI after checkout. Your order is confirmed once the studio has checked the payment.</dd></div>
            </dl>
          </div>
        </div>
      </section>

      {/* WHAT IS A MAIL CLUB */}
      <section className={`${wrap} py-12 md:py-20`}>
        <h2 className="flex flex-wrap items-end gap-x-3">
          <span className="pb-2 text-xl md:text-2xl">What is a</span>
          <span className="font-script text-6xl leading-none md:text-8xl">Mail Club?</span>
        </h2>
        <p className="type mt-4 max-w-xl">
          Think of it as a letter from an artist friend. Each edition is a little themed parcel of art you can hold, keep and use —
          made for one month, in small numbers, and posted to your door.
        </p>
        <ol className="mt-8 grid gap-6 md:grid-cols-3 md:gap-10">
          {STEPS.map(([title, line], i) => (
            <li key={title} className="border-t border-foreground/20 pt-4">
              <span className="font-script text-5xl leading-none text-pink">{i + 1}</span>
              <h3 className="mt-2 text-lg font-medium">{title}</h3>
              <p className="mt-1 text-muted-foreground">{line}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* INSIDE THE PARCEL */}
      <section className="border-y border-foreground/20 bg-paper py-12 md:py-20">
        <div className={wrap}>
          <p className="text-xl uppercase tracking-[0.12em]">Inside</p>
          <h2 className="font-script text-6xl leading-none md:text-8xl">the parcel</h2>
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-5 md:gap-6">
            {MAIL_CLUB.includes.map((item, i) => (
              <li key={item.name} className="min-w-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} loading="lazy" className="aspect-square w-full border border-foreground/15 bg-background object-cover" />
                ) : (
                  <div className="grid aspect-square w-full place-items-center border border-dashed border-foreground/30 bg-background p-3 text-center">
                    <div>
                      <span className="font-script text-5xl leading-none text-pink">{i + 1}</span>
                      <p className="mt-2 text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">Artwork photo coming soon</p>
                    </div>
                  </div>
                )}
                <h3 className="mt-3 text-sm font-medium leading-tight md:text-base">{item.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground md:text-sm">{item.line}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-muted-foreground">All five come together as one bundle — they aren't sold separately.</p>
        </div>
      </section>

      {/* THE LETTER */}
      <section className={`${wrap} grid items-center gap-8 py-12 md:grid-cols-2 md:gap-14 md:py-20`}>
        <div>
          <p className="eyebrow text-muted-foreground">The letter</p>
          <h2 className="heading mt-2">A note on doing nothing</h2>
          <p className="type mt-4 max-w-md">
            Every parcel carries a letter from us — about the guilt that creeps in on quiet days, about slowing down, and about the comfort
            hiding in ordinary moments.
          </p>
        </div>
        <figure className="relative mx-auto w-full max-w-md rotate-[-1.5deg] border border-foreground/20 bg-[repeating-linear-gradient(transparent,transparent_2.1rem,color-mix(in_oklab,var(--color-foreground)_10%,transparent)_2.1rem,color-mix(in_oklab,var(--color-foreground)_10%,transparent)_calc(2.1rem+1px))] bg-background px-7 py-8 shadow-[0_10px_30px_-18px_rgb(0_0_0/0.45)]">
          <span aria-hidden className="tape -top-3 left-1/3 rotate-3" />
          <p className="font-hand text-3xl">Dear you,</p>
          {MAIL_CLUB.letter.slice(0, MAIL_CLUB.letterPreview).map((para) => <p key={para} className="type mt-3 leading-[2.1rem]">{para}</p>)}
          <p className="type mt-3 leading-[2.1rem] text-muted-foreground">…the rest of this letter is waiting for you inside the parcel.</p>
          <p className="font-hand mt-4 text-right text-2xl text-pink">— Halfस्केच</p>
        </figure>
      </section>

      {/* QUESTIONS */}
      <section className={`${wrap} pb-12 md:pb-20`}>
        <h2 className="heading">Little questions</h2>
        <div className="mt-6 max-w-2xl divide-y border-y">
          {[
            ["Is this a subscription?", "No. You're buying the November edition only. Nothing renews and you'll never be charged automatically for a future parcel."],
            ["Can I send it as a gift?", "Yes — just enter the address of the person you'd like it to reach at checkout. We'll pack it the same way."],
            ["When is my order confirmed?", "Pre-ordering takes you to checkout and a UPI payment. Once the studio sees your payment arrive, your order moves to Order confirmed in My Orders."],
            ["Are the stamps real postage?", "No — they're small decorative artworks in the style of stamps, made for journals, letters and walls."],
          ].map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {q}<span aria-hidden className="text-pink transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
        <Link to="/shop" className="btn-line mt-8">Browse the rest of the shop</Link>
      </section>

      {/* MOBILE PURCHASE BAR */}
      <div className="fixed inset-x-0 bottom-[calc(var(--tabbar)+env(safe-area-inset-bottom))] z-30 flex items-center gap-3 border-t bg-background/95 px-5 py-3 backdrop-blur-sm md:hidden">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">November Mail Club</p>
          <p className="text-xs text-muted-foreground tabular-nums">{ready && p.price > 0 ? `${formatPrice(p.price)} · one-time` : "Price coming soon"}</p>
        </div>
        <button type="button" className="btn-ink ml-auto shrink-0 !px-4 !text-[0.62rem]" disabled={!open} onClick={preorder}>{!ready ? "Checking…" : open ? "Pre-order" : soldOut ? "Sold out" : "Opening soon"}</button>
      </div>
    </div>
  );
}
