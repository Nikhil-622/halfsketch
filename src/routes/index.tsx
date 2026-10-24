import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";
import { PersonalCta } from "@/components/site/PersonalCta";
import { IMAGES, INSTAGRAM_URL, MAIL_CLUB, liveProducts } from "@/lib/products";
import { useCatalog } from "@/lib/studio";

const HERO = "/illustrations/fox-studio.svg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Halfस्केच — Handmade art, bookmarks, postcards & calendars" },
      { name: "description", content: "A tiny independent art studio. Hand-painted bookmarks, postcards and calendars — a little unfinished, a lot of you." },
      { property: "og:title", content: "Halfस्केच — A little unfinished. A lot of you." },
      { property: "og:description", content: "Hand-painted bookmarks, postcards and calendars, made to be kept." },
    ],
    links: [{ rel: "preload", as: "image", href: HERO }],
  }),
  component: Home,
});

const wrap = "mx-auto max-w-[1400px] px-5 md:px-10";
const frame = "border border-foreground/30 bg-paper object-cover shadow-[0_10px_30px_-18px_rgb(0_0_0/0.45)]";

// Cover photo per collection: drop a file in public/assets/ and put its path in `img`. Empty = "photo coming soon".
const COLLECTIONS = [
  { name: "Postcards", img: "/assets/happy_diwali_postcard.jpg", to: "/shop", category: "postcards" },
  { name: "Bookmarks", img: "/assets/red_house_bookmark.png", to: "/shop", category: "bookmarks" },
  { name: "Calendars", img: "", to: "/shop", category: "calendars" },
] as const;

function Home() {
  useCatalog();
  const recent = liveProducts().filter((p) => p.status !== "retired" && !p.edition).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const rail = useRef<HTMLDivElement>(null);
  return (
    <>
      {/* HERO — one full-bleed background picture with the words laid over it (swap HERO for the finished painting) */}
      <section className="relative isolate overflow-hidden">
        {/* phones: a soft, blurred copy of the picture fills the hero behind the words… */}
        <img src={HERO} alt="" aria-hidden width={1600} height={1000} decoding="async"
          className="absolute inset-0 -z-20 h-full w-full scale-[1.4] object-cover blur-md md:hidden" />
        <div aria-hidden className="absolute inset-0 -z-20 bg-background/45 md:hidden" />
        {/* …and the whole picture sits sharp underneath, fading in at its top edge. Laptops: full-bleed cover. */}
        <img src={HERO} alt="" width={1600} height={1000} fetchPriority="high" decoding="async"
          className="absolute inset-x-0 bottom-0 -z-10 h-auto w-full [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_22%)] [mask-image:linear-gradient(to_bottom,transparent,black_22%)] md:inset-0 md:h-full md:object-cover md:object-bottom md:[-webkit-mask-image:none] md:[mask-image:none]" />
        <div className="animate-reveal flex min-h-[calc(85svh-3.5rem)] flex-col items-center justify-center px-5 pb-[calc(62.5vw+0.5rem)] pt-8 text-center md:min-h-[calc(100svh-3.6rem)] md:justify-start md:pb-6 md:pt-[9vh]">
          <h1 className="font-script text-[clamp(2.9rem,11vw,9.5rem)] leading-[0.95] [text-shadow:0_0_28px_var(--color-background),0_0_10px_var(--color-background)]">
            A little unfinished.<br />
            <span className="text-pink">A lot of you.</span>
          </h1>
          <p className="type mx-auto mt-5 max-w-sm [text-shadow:0_0_12px_var(--color-background),0_0_4px_var(--color-background)]">
            Handmade little things, painted with feeling and made to be kept. Pull up a chair in our tiny studio.
          </p>
          <div className="mx-auto mt-7 flex w-full max-w-xs flex-col gap-3 md:mt-8">
            <Link to="/shop" className="btn-ink w-full bg-background/85">Explore the collection</Link>
            <Link to="/mail-club" className="btn-ink w-full bg-background/85">Explore the Mail Club</Link>
          </div>
        </div>
        <span className="sr-only">Illustration: a fox in a beret and striped sweater painting a sunset bookmark by the window.</span>
      </section>

      {/* THE MAIL CLUB — its own corner, separate from the collections */}
      <section className="border-y border-foreground/20 bg-paper">
        <div className={`${wrap} py-12 md:py-24`}>
          <h2 className="flex items-end gap-3">
            <span className="pb-2 text-xl md:text-2xl">The</span>
            <span className="font-script text-6xl leading-none md:text-8xl">Mail Club</span>
          </h2>
          <div className="mt-6 grid items-center gap-8 md:mt-10 md:grid-cols-2 md:gap-14">
            <Link to="/mail-club" className="group block overflow-hidden">
              <img src={MAIL_CLUB.cover} alt="The November Mail Club: a sleepy cat postcard, an ivy bookmark, a November calendar, three art stamps and a letter" loading="lazy" decoding="async" width={1200} height={1200}
                className={`${frame} aspect-square w-full transition duration-700 group-hover:scale-[1.02]`} />
            </Link>
            <div>
              <p className="eyebrow text-muted-foreground">{MAIL_CLUB.editionLabel} · one-time parcel</p>
              <p className="font-script mt-2 text-5xl leading-none md:text-6xl">{MAIL_CLUB.theme}</p>
              <p className="accent mt-4">“{MAIL_CLUB.message}”</p>
              <p className="type mt-4 max-w-md">A little parcel of handmade art and stationery, posted to your door once — no subscription, nothing renews.</p>
              <ul className="mt-5 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                {MAIL_CLUB.includes.map((item) => <li key={item.name} className="flex gap-2"><span aria-hidden className="text-pink">✦</span>{item.name}</li>)}
              </ul>
              <Link to="/mail-club" className="btn-ink mt-8 w-full max-w-xs bg-transparent">Explore the Mail Club</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ALL COLLECTIONS */}
      <section className={`${wrap} py-12 md:py-24`}>
        <h2 className="flex items-end gap-3">
          <span className="pb-2 text-xl md:text-2xl">All</span>
          <span className="font-script text-6xl leading-none md:text-8xl">Collections</span>
        </h2>
        <div ref={rail} className="mt-6 flex snap-x md:mt-10 snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] md:gap-6">
          {COLLECTIONS.map((c) => (
            <Link key={c.name} to={c.to} search={"category" in c ? { category: c.category } : {}}
              className="group w-[78%] shrink-0 snap-start sm:w-[45%] md:w-[31%]">
              <div className="aspect-[3/2] overflow-hidden bg-paper">
                {c.img ? (
                  <img src={c.img} alt={c.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                ) : (
                  <div className="grid h-full w-full place-items-center border border-dashed border-foreground/30 text-center">
                    <div>
                      <p className="font-script text-5xl leading-none text-pink">{c.name}</p>
                      <p className="mt-3 text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">Fresh pieces coming soon</p>
                    </div>
                  </div>
                )}
              </div>
              <h3 className="mt-4 text-2xl">{c.name}</h3>
              <span className="btn-ink mt-3 !px-5 !py-2 !text-[0.6rem] group-hover:bg-pink">View collection</span>
            </Link>
          ))}
        </div>
        <button type="button" aria-label="Next collection" className="mx-auto mt-8 block p-2 transition hover:translate-x-1 hover:text-pink"
          onClick={() => rail.current?.scrollBy({ left: rail.current.clientWidth * 0.8, behavior: "smooth" })}>
          <ArrowRight className="size-7" strokeWidth={1.2} />
        </button>
      </section>

      {/* RECENTLY SKETCHED — hidden for now. Remove this comment wrapper (and its closing marker below) to bring it back.
      <section className="relative isolate overflow-hidden border-y border-foreground/20">
        <div aria-hidden className="absolute inset-0 -z-10 scale-110 bg-[url('/assets/collection_polaroid.webp')] bg-cover bg-center opacity-50 blur-2xl" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-background/55" />
        <div className={`${wrap} grid items-center gap-10 py-14 md:grid-cols-2 md:py-24`}>
          <img src={IMAGES.studio} alt="Hand-painted polaroids from the Halfस्केच collection" loading="lazy" decoding="async" width={1024} height={1536}
            className={`${frame} mx-auto aspect-[4/5] w-full max-w-md`} />
          <div className="text-center md:text-right">
            <p className="font-script text-6xl leading-none md:text-8xl">Recently sketched</p>
            <p className="type mt-8 italic">fresh from the sketchbook</p>
            <p className="mt-2 font-mono text-3xl font-bold tracking-wide md:text-4xl">Latest Collection</p>
            <p className="type mt-4 md:ml-auto md:max-w-xs">Step inside a world of little suns, wildflowers and quiet streets — the newest pieces to leave our desk.</p>
            <Link to="/shop" className="btn-ink mt-8 min-w-56">View all artwork</Link>
          </div>
        </div>
      </section>

      {recent.length ? (
        <section className={`${wrap} min-w-0 max-w-full py-14 md:py-20`}>
          <div className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-6">
            {recent.map((p) => <ProductCard key={p.id} product={p} compact />)}
          </div>
        </section>
      ) : null}
      */}

      {/* ABOUT US */}
      <section className="border-y border-foreground/20 bg-paper px-5 py-16 text-center md:py-20">
        <h2 className="font-script text-6xl leading-none md:text-7xl">Nikhil &amp; Disha</h2>
        <p className="type mx-auto mt-6 max-w-md">
          We are two people with one little idea: small, handmade things that keep a little of the hand that made them. He paints every piece; she dreams them up and sends each one to you.
        </p>
        <Link to="/story" className="btn-ink mt-8 min-w-56 bg-transparent">Read our story</Link>
      </section>

      {/* THE SKETCHBOOK — collage */}
      <section className={`${wrap} grid items-center gap-10 py-12 md:grid-cols-2 md:gap-12 md:py-24`}>
        <div className="relative mx-auto aspect-square w-full max-w-xl">
          <img src="/assets/group_bookmark_sm.jpg" alt="" loading="lazy" className={`${frame} absolute left-[12%] top-[16%] z-10 h-[66%] w-[38%]`} />
          <img src="/assets/auto_postcard.jpeg" alt="" loading="lazy" className={`${frame} absolute left-0 top-[44%] z-20 h-[40%] w-[34%]`} />
          <img src={IMAGES.studioPhone} alt="" loading="lazy" className={`${frame} absolute right-[10%] top-0 z-20 h-[56%] w-[36%]`} />
          <img src="/assets/cat_postcard.jpeg" alt="" loading="lazy" className={`${frame} absolute bottom-0 right-[22%] z-30 h-[32%] w-[30%]`} />
        </div>
        <div className="md:pl-6">
          <p className="text-xl uppercase tracking-[0.12em]">The</p>
          <h2 className="font-script text-7xl leading-none text-pink md:text-8xl">Sketchbook</h2>
          <p className="type mt-6 max-w-sm">
            Here you can follow everything as it happens: new pieces, works in progress and the occasional happy mistake. Each one starts with a pencil line and ends when we decide to stop.
          </p>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Follow halfsketch.in on Instagram" className="mt-10 inline-flex items-center gap-4 transition hover:translate-x-1 hover:text-pink">
            <ArrowRight className="size-14" strokeWidth={1} />
            <span className="type">@halfsketch.in</span>
          </a>
        </div>
      </section>

      <PersonalCta />
    </>
  );
}
