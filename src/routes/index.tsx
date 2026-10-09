import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";
import { ProductCard } from "@/components/site/ProductCard";
import { PersonalCta } from "@/components/site/PersonalCta";
import { IMAGES, INSTAGRAM_URL, recentProducts } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Halfस्केच — Handmade art, bookmarks, postcards & polaroids" },
      { name: "description", content: "A tiny independent art studio. Hand-painted bookmarks, postcards and polaroid artwork — a little unfinished, a lot of you." },
      { property: "og:title", content: "Halfस्केच — A little unfinished. A lot of you." },
      { property: "og:description", content: "Hand-painted bookmarks, postcards and polaroid artwork, made to be kept." },
    ],
  }),
  component: Home,
});

const wrap = "mx-auto max-w-[1400px] px-5 md:px-10";

function Home() {
  const recent = recentProducts(4);
  return (
    <>
      {/* HERO */}
      <section className={`${wrap} grid gap-10 pt-8 md:grid-cols-12 md:pt-16`}>
        <div className="animate-reveal md:col-span-6 md:pt-10">
          <Logo className="h-20 md:h-24" />
          <h1 className="display mt-10">
            A little unfinished.<br />
            <span className="text-pink">A lot of you.</span>
          </h1>
          <p className="mt-8 max-w-sm text-lg text-muted-foreground">Handmade little things, painted with feeling and made to be kept.</p>
          <div className="mt-10 flex flex-wrap items-center gap-8">
            <Link to="/shop" className="btn-ink">Explore the collection</Link>
            <Link to="/story" className="btn-line">Our story</Link>
          </div>
        </div>
        <div className="relative md:col-span-6">
          <img src={IMAGES.studio} alt="Hand-painted polaroids from the Halfस्केच collection" width={896} height={1152}
            className="ml-auto aspect-[4/5] w-[82%] object-cover" />
          <div className="absolute -bottom-10 left-0 w-[46%] rotate-[-4deg] bg-background p-2 pb-8 shadow-sm">
            <span className="tape -top-3 left-1/3 rotate-6" />
            <img src={IMAGES.polaroid} alt="Tiny painted sunset in a polaroid frame" width={896} height={1152} className="aspect-square w-full object-cover" />
          </div>
          <svg className="pointer-events-none absolute -left-4 top-6 hidden w-40 md:block" viewBox="0 0 160 80" fill="none" aria-hidden>
            <path className="sketch-line" d="M5 60 C 40 10, 90 10, 150 40" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          <p className="font-hand absolute -left-2 top-0 hidden -rotate-6 text-2xl md:block">painted last sunday</p>
        </div>
      </section>

      {/* WHY */}
      <section className={`${wrap} mt-20 grid gap-10 md:grid-cols-12`}>
        <p className="eyebrow text-muted-foreground md:col-span-3">Why Halfस्केच?</p>
        <div className="md:col-span-8">
          <h2 className="heading">Not everything needs to be perfectly finished to <em className="not-italic text-pink">mean</em> something.</h2>
          <div className="mt-10 grid gap-8 text-muted-foreground sm:grid-cols-2">
            <p>A wobbly line. A petal that went a bit too pink. The edge we decided not to clean up. These are the parts that tell you a person was here.</p>
            <p>We make small things — the kind you tuck into a book, pin above a desk, or post to someone far away — and let them keep a little of the hand that made them.</p>
          </div>
        </div>
      </section>

      {/* TWO PEOPLE */}
      <section className="mt-20 bg-paper py-14">
        <div className={`${wrap} grid items-center gap-12 md:grid-cols-2`}>
          <Link to="/story" aria-label="Our story" className="block">
            <img src="/assets/about_us.jpeg" alt="Nikhil and Disha" loading="lazy" width={1344} height={896} className="aspect-[3/2] w-full bg-background object-contain" />
          </Link>
          <div>
            <p className="eyebrow text-muted-foreground">Our story</p>
            <h2 className="heading mt-4">Two people.<br />One little idea.</h2>
            <dl className="mt-10 space-y-8">
              <div><dt className="font-hand text-3xl text-pink">Nikhil</dt><dd className="mt-1 text-muted-foreground">Paints every piece. The brush, the lines, the little mistakes — that's him.</dd></div>
              <div><dt className="font-hand text-3xl text-pink">Disha</dt><dd className="mt-1 text-muted-foreground">The ideas, the direction, the sourcing, the planning — and every post and parcel that reaches you.</dd></div>
            </dl>
            <Link to="/story" className="btn-line mt-10">Read the whole story</Link>
          </div>
        </div>
      </section>

      {/* COLLECTION */}
      <section className={`${wrap} mt-20`}>
        <h2 className="display max-w-3xl">Little things worth keeping.</h2>
        <div className="mt-16 grid gap-6 md:grid-cols-12">
          <CollectionTile className="md:col-span-5 md:row-span-2" img="/assets/group_bookmark.png" ratio="aspect-[3/4]" name="Bookmarks" line="For stories you keep returning to." contain />
          <CollectionTile className="md:col-span-7" img={IMAGES.postcard} ratio="aspect-[4/3]" name="Postcards" line="Tiny pieces of places, people & memories." />
          <CollectionTile className="md:col-span-5 md:col-start-8 md:-mt-0" img="/assets/collection_polaroid.png" ratio="aspect-square" name="Polaroids" line="For moments that deserve more than a camera roll." contain />
        </div>
      </section>

      {/* RECENTLY SKETCHED */}
      <section className={`${wrap} mt-20`}>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-6">
          <div>
            <h2 className="heading">Recently Sketched</h2>
            <p className="mt-3 text-muted-foreground">A few little things we've been working on lately.</p>
          </div>
          <Link to="/shop" className="btn-line">See everything</Link>
        </div>
        <div className="mt-10 flex snap-x gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible">
          {recent.map((p) => <div key={p.id} className="w-[70vw] shrink-0 snap-start md:w-auto"><ProductCard product={p} /></div>)}
        </div>
      </section>

      {/* PROCESS */}
      <section className={`${wrap} mt-20`}>
        <h2 className="heading">How it comes to life</h2>
        <ol className="relative mt-16 grid gap-12 md:grid-cols-4">
          <svg className="absolute left-0 top-6 hidden h-6 w-full md:block" preserveAspectRatio="none" viewBox="0 0 400 20" aria-hidden>
            <path d="M0 10 Q 50 0 100 10 T 200 10 T 300 10 T 400 10" stroke="var(--color-pink)" strokeDasharray="4 6" fill="none" />
          </svg>
          {[
            ["The idea", "A memory, a place, a flower on the way home."],
            ["The sketch", "Pencil first. Loose, a little unsure."],
            ["The details", "Paint, ink, and knowing when to stop."],
            ["The little piece", "Dried, packed by hand, sent to you."],
          ].map(([t, d], i) => (
            <li key={t} className="relative bg-background pr-4">
              <span className="font-hand text-5xl text-pink">0{i + 1}</span>
              <h3 className="eyebrow mt-4">{t}</h3>
              <p className="mt-3 text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* INSTAGRAM */}
      <section className={`${wrap} mt-20 grid items-center gap-10 md:grid-cols-[1fr_1.4fr]`}>
        <div>
          <h2 className="heading">Follow the sketchbook.</h2>
          <p className="mt-4 text-muted-foreground">New pieces, works in progress and the occasional mistake — first on Instagram.</p>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="btn-line mt-8">halfsketch.in</a>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[IMAGES.polaroid, IMAGES.studio, IMAGES.bookmark, IMAGES.postcard, "/assets/cart_bookmark.png", "/assets/sunset_bookmark.png"].map((src, i) => (
            <a key={i} href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="block overflow-hidden" aria-label="View on Instagram">
              <img src={src} alt="" loading="lazy" className="aspect-square w-full object-cover transition duration-500 hover:scale-105" />
            </a>
          ))}
        </div>
      </section>

      <PersonalCta />
    </>
  );
}

function CollectionTile({ img, name, line, ratio, className, contain = false }: { img: string; name: string; line: string; ratio: string; className: string; contain?: boolean }) {
  return (
    <Link to="/shop" search={{ category: name.toLowerCase() }} className={`group block ${className}`}>
      <div className={`overflow-hidden bg-paper ${ratio}`}>
        <img src={img} alt={name} loading="lazy" className={`h-full w-full transition duration-700 group-hover:scale-[1.03] ${contain ? "object-contain p-4" : "object-cover"}`} />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="eyebrow">{name}</h3>
        <p className="font-hand text-right text-xl text-muted-foreground">{line}</p>
      </div>
    </Link>
  );
}
