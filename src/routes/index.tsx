import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/site/ProductCard";
import { PersonalCta } from "@/components/site/PersonalCta";
import { IMAGES, INSTAGRAM_URL, liveProducts } from "@/lib/products";
import { useCatalog } from "@/lib/studio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Halfस्केच — Handmade art, bookmarks, postcards & polaroids" },
      { name: "description", content: "A tiny independent art studio. Hand-painted bookmarks, postcards and polaroid artwork — a little unfinished, a lot of you." },
      { property: "og:title", content: "Halfस्केच — A little unfinished. A lot of you." },
      { property: "og:description", content: "Hand-painted bookmarks, postcards and polaroid artwork, made to be kept." },
    ],
    links: [
      { rel: "preload", as: "image", href: IMAGES.studio, media: "(max-width: 767px)" },
      { rel: "preload", as: "image", href: IMAGES.studio, media: "(min-width: 768px)" },
    ],
  }),
  component: Home,
});

const wrap = "mx-auto max-w-[1400px] px-5 md:px-10";

function Home() {
  useCatalog();
  const recent = liveProducts().filter((p) => p.status !== "retired").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[calc(100svh-2.75rem)] overflow-hidden md:min-h-0 md:pt-16">
        <div className="absolute inset-0 md:hidden">
          <div className="relative flex h-full min-h-[22rem] flex-col justify-end overflow-hidden">
            <img src={IMAGES.studio} alt="Hand-painted polaroids from the Halfस्केच collection" width={1024} height={1536}
              fetchPriority="high" decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-[center_35%]" />
            <div className="relative px-5 pb-6">
              <h1 className="text-xl font-bold leading-none tracking-[-0.035em] text-foreground">
                A little unfinished.<br />
                <span className="text-pink">A lot of you.</span>
              </h1>
              <p className="mt-1.5 max-w-xs text-xs font-bold text-foreground">Handmade little things, painted with feeling and made to be kept.</p>
              <Link to="/shop" className="btn-ink mt-3 !px-4 !py-2 !text-[0.62rem] whitespace-nowrap">Explore the collection</Link>
            </div>
          </div>
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden scale-110 bg-cover bg-center opacity-40 blur-2xl md:block md:bg-[url('/assets/collection_polaroid.webp')]" />
        <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-b from-background/85 via-background/55 to-background md:block" aria-hidden />
        <div className={`${wrap} relative hidden md:grid md:grid-cols-12 md:items-start md:gap-10`}>
          <div className="animate-reveal md:col-span-6 md:pt-10">
            <h1 className="font-semibold leading-[0.95] tracking-[-0.035em] md:text-[clamp(2.6rem,7vw,6.5rem)]">
              A little unfinished.<br />
              <span className="text-pink">A lot of you.</span>
            </h1>
            <p className="mt-8 max-w-sm text-lg text-muted-foreground">Handmade little things, painted with feeling and made to be kept.</p>
            <div className="mt-10 flex flex-wrap items-center gap-8">
              <Link to="/shop" className="btn-ink whitespace-nowrap">Explore the collection</Link>
              <Link to="/story" className="btn-line">Our story</Link>
            </div>
          </div>
          <div className="relative md:col-span-6">
            <picture>
              <source media="(min-width: 768px)" srcSet={IMAGES.studio} />
              <img src={IMAGES.studioPhone} alt="Hand-painted polaroids from the Halfस्केच collection" width={1024} height={1536}
                decoding="async" className="ml-auto aspect-[4/5] w-[82%] object-cover" />
            </picture>
            <div className="absolute -bottom-10 left-0 w-[46%] rotate-[-4deg] bg-background p-2 pb-8 shadow-sm">
              <span className="tape -top-3 left-1/3 rotate-6" />
              <picture>
                <source media="(min-width: 768px)" srcSet={IMAGES.polaroid} />
                <img src={IMAGES.studioPhone} alt="Tiny painted sunset in a polaroid frame" width={896} height={1152} decoding="async" className="aspect-square w-full object-cover" />
              </picture>
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className={`${wrap} mt-8 grid gap-4 md:mt-12 md:grid-cols-12 md:gap-10`}>
        <p className="eyebrow text-muted-foreground md:col-span-3">Why Halfस्केच?</p>
        <div className="md:col-span-8">
          <h2 className="text-2xl font-semibold leading-none tracking-[-0.03em] md:text-[clamp(2rem,4.5vw,3.75rem)]">Not everything needs to be perfectly finished to <em className="not-italic text-pink">mean</em> something.</h2>
          <div className="mt-4 grid gap-4 text-muted-foreground sm:grid-cols-2 md:mt-8 md:gap-8">
            <p>A wobbly line. A petal that went a bit too pink. The edge we decided not to clean up. These are the parts that tell you a person was here.</p>
            <p>We make small things — the kind you tuck into a book, pin above a desk, or post to someone far away — and let them keep a little of the hand that made them.</p>
          </div>
        </div>
      </section>

      {/* TWO PEOPLE */}
      <section className="mt-8 bg-paper py-8 md:mt-12 md:py-10">
        <div className={`${wrap} grid items-center gap-6 md:grid-cols-2 md:gap-12`}>
          <Link to="/story" aria-label="Our story" className="block">
            <img src="/assets/about_us.jpeg" alt="Nikhil and Disha" loading="lazy" decoding="async" fetchPriority="low" width={1344} height={896} className="aspect-[3/2] w-full bg-background object-contain" />
          </Link>
          <div>
            <p className="eyebrow text-muted-foreground">Our story</p>
            <h2 className="heading mt-2">Two people.<br />One little idea.</h2>
            <dl className="mt-4 space-y-4 md:mt-6">
              <div><dt className="font-hand text-3xl text-pink">Nikhil</dt><dd className="mt-1 text-muted-foreground">Paints every piece. The brush, the lines, the little mistakes — that's him.</dd></div>
              <div><dt className="font-hand text-3xl text-pink">Disha</dt><dd className="mt-1 text-muted-foreground">The ideas, the direction, the sourcing, the planning — and every post and parcel that reaches you.</dd></div>
            </dl>
            <Link to="/story" className="btn-line mt-4">Read the whole story</Link>
          </div>
        </div>
      </section>

      {/* COLLECTION */}
      <section className={`${wrap} mt-8 md:mt-12`}>
        <h2 className="max-w-3xl text-3xl font-semibold leading-[0.95] tracking-[-0.035em] md:text-[clamp(2.6rem,7vw,6.5rem)]">Little things worth keeping.</h2>
        <div className="mt-6 grid min-w-0 max-w-full gap-6 md:mt-10 md:grid-cols-12">
          <CollectionTile className="md:col-span-5 md:row-span-2" img="/assets/group_bookmark_sm.jpg" ratio="aspect-[3/4]" name="Bookmarks" line="For stories you keep returning to." contain />
          <CollectionTile className="md:col-span-7" img={IMAGES.postcard} ratio="aspect-[4/3]" name="Postcards" line="Tiny pieces of places, people & memories." />
          <CollectionTile className="md:col-span-5 md:col-start-8 md:-mt-0" img={IMAGES.studio} ratio="aspect-square" name="Polaroids" line="For moments that deserve more than a camera roll." contain />
        </div>
      </section>

      {/* RECENTLY SKETCHED */}
      <section className={`${wrap} mt-8 min-w-0 max-w-full md:mt-12`}>
        <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-3">
          <div>
            <h2 className="heading">Recently Sketched</h2>
            <p className="mt-3 text-muted-foreground">A few little things we've been working on lately.</p>
          </div>
          <Link to="/shop" className="btn-line">See everything</Link>
        </div>
        <div className="mt-4 grid min-w-0 grid-cols-2 gap-x-4 gap-y-8 md:mt-8 md:grid-cols-4 md:gap-6">
          {recent.map((p) => <ProductCard key={p.id} product={p} compact />)}
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className={`${wrap} mt-8 grid items-center gap-6 md:mt-12 md:grid-cols-[1fr_1.4fr] md:gap-10`}>
        <div>
          <h2 className="heading">Follow the sketchbook.</h2>
          <p className="mt-3 text-muted-foreground">New pieces, works in progress and the occasional mistake — first on Instagram.</p>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="btn-line mt-3">halfsketch.in</a>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[IMAGES.polaroid, IMAGES.studio, IMAGES.bookmark, IMAGES.postcard, "/assets/cart_bookmark.png", "/assets/sunset_bookmark.png"].map((src, i) => (
            <a key={i} href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="block overflow-hidden" aria-label="View on Instagram">
              <img src={src} alt="" loading="lazy" decoding="async" fetchPriority="low" className="aspect-square w-full object-cover transition duration-500 hover:scale-105" />
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
    <Link to="/shop" search={{ category: name.toLowerCase() }} className={`group block min-w-0 max-w-full ${className}`}>
      <div className={`overflow-hidden bg-paper ${ratio}`}>
        <img src={img} alt={name} loading="lazy" decoding="async" fetchPriority="low" className={`h-full max-w-full w-full transition duration-700 group-hover:scale-[1.03] ${contain ? "object-contain p-4" : "object-cover"}`} />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="eyebrow">{name}</h3>
        <p className="min-w-0 text-right font-hand text-sm text-muted-foreground md:whitespace-nowrap md:text-xl">{line}</p>
      </div>
    </Link>
  );
}
