import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORY_LABEL, PRODUCTS, STATUS_LABEL } from "@/lib/products";

export const Route = createFileRoute("/archive")({
  head: () => ({
    meta: [
      { title: "The Archive — Halfस्केच" },
      { name: "description", content: "A curated archive of every Halfस्केच sketch — available, sold out and retired." },
      { property: "og:title", content: "The Halfस्केच Archive" },
      { property: "og:description", content: "Every little sketch we've made, kept in one place." },
    ],
  }),
  component: Archive,
});

function Archive() {
  const items = PRODUCTS.filter((p) => p.sketchNo).sort((a, b) => a.sketchNo!.localeCompare(b.sketchNo!));
  return (
    <div className="mx-auto max-w-[1400px] px-5 pt-12 md:px-10">
      <h1 className="display">The Halfस्केच Archive</h1>
      <p className="mt-6 max-w-md text-muted-foreground">Every numbered sketch we've made — the ones still here, and the ones that already found a home.</p>
      <ol className="mt-16 border-t">
        {items.map((p) => {
          const status = p.available ? "Available" : p.status ? STATUS_LABEL[p.status] : "Sold out";
          return (
            <li key={p.id} className="border-b">
              <Link to="/shop/$slug" params={{ slug: p.slug }} className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 py-5 md:grid-cols-[8rem_6rem_1fr_10rem_8rem] md:gap-8">
                <span className="font-hand text-2xl text-pink">Sketch {p.sketchNo}</span>
                <img src={p.images[0]} alt="" loading="lazy" className="hidden aspect-square w-20 bg-paper object-contain p-1.5 md:block" />
                <span className="text-lg font-medium transition group-hover:translate-x-1">{p.name}</span>
                <span className="eyebrow hidden text-muted-foreground md:block">{CATEGORY_LABEL[p.category]}</span>
                <span className={`eyebrow text-right ${p.available ? "" : "text-muted-foreground"}`}>{status}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
