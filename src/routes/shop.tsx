import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/site/ProductCard";
import { CATEGORY_LABEL, liveProducts, type Category } from "@/lib/products";
import { useCatalog } from "@/lib/studio";

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
  useCatalog();
  const { category } = Route.useSearch();
  const cats = Object.keys(CATEGORY_LABEL) as Category[];
  const list = liveProducts().filter((p) => p.status !== "retired")
    .filter((p) => !category || p.category === category);

  return (
    <div className="mx-auto max-w-5xl px-5 pt-8 md:px-10">
      <h1 className="heading">The shop</h1>
      <p className="font-hand mt-3 text-2xl text-pink">everything here was painted by hand</p>
      <nav aria-label="Categories" className="mt-8 flex min-w-0 flex-wrap gap-x-4 gap-y-3 border-y py-5 md:gap-x-7">
        <Link to="/shop" search={{}} className={`eyebrow link-sketch pb-1 ${!category ? "text-pink" : ""}`}>All</Link>
        {cats.map((c) => (
          <Link key={c} to="/shop" search={{ category: c }} className={`eyebrow link-sketch pb-1 ${category === c ? "text-pink" : ""}`}>{CATEGORY_LABEL[c]}</Link>
        ))}
      </nav>
      {list.length === 0 ? (
        <p className="py-24 text-center text-muted-foreground">Nothing here yet — new sketches are on the way.</p>
      ) : (
        <div className="mt-8 grid min-w-0 grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6">
          {list.map((p) => <ProductCard key={p.id} product={p} compact />)}
        </div>
      )}
    </div>
  );
}
