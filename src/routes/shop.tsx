import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { CATEGORY_LABEL, PRODUCTS, type Category } from "@/lib/products";

type Search = { category?: string | undefined };

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): Search => ({ category: typeof s["category"] === "string" ? s["category"] : undefined }),
  head: () => ({
    meta: [
      { title: "Shop — Halfस्केच" },
      { name: "description", content: "Shop hand-painted bookmarks, postcards and polaroid artwork from Halfस्केच." },
      { property: "og:title", content: "Shop handmade art — Halfस्केच" },
      { property: "og:description", content: "Hand-painted bookmarks, postcards and polaroids, made in small batches." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { category } = Route.useSearch();
  const [q, setQ] = useState("");
  const cats = Object.keys(CATEGORY_LABEL) as Category[];
  const list = PRODUCTS.filter((p) => p.status !== "retired")
    .filter((p) => !category || p.category === category)
    .filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-[1400px] px-5 pt-12 md:px-10">
      <h1 className="display">The shop</h1>
      <p className="font-hand mt-3 text-2xl text-pink">everything here was painted by hand</p>
      <div className="mt-12 flex flex-col gap-6 border-y py-5 md:flex-row md:items-center md:justify-between">
        <nav aria-label="Categories" className="flex flex-wrap gap-x-7 gap-y-3">
          <Link to="/shop" search={{}} className={`eyebrow link-sketch pb-1 ${!category ? "text-pink" : ""}`}>All</Link>
          {cats.map((c) => (
            <Link key={c} to="/shop" search={{ category: c }} className={`eyebrow link-sketch pb-1 ${category === c ? "text-pink" : ""}`}>{CATEGORY_LABEL[c]}</Link>
          ))}
        </nav>
        <label className="md:w-64">
          <span className="sr-only">Search pieces</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pieces…" className="field" />
        </label>
      </div>
      {list.length === 0 ? (
        <p className="py-24 text-center text-muted-foreground">Nothing here yet — new sketches are on the way.</p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 md:gap-x-10">
          {list.map((p, i) => <div key={p.id} className={i % 3 === 1 ? "md:mt-16" : ""}><ProductCard product={p} /></div>)}
        </div>
      )}
    </div>
  );
}
