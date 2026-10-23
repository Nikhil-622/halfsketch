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
      { name: "description", content: "Shop hand-painted bookmarks, postcards and calendars from Halfस्केच." },
      { property: "og:title", content: "Shop handmade art — Halfस्केच" },
      { property: "og:description", content: "Hand-painted bookmarks, postcards and calendars, made in small batches." },
    ],
  }),
  component: Shop,
});

function Shop() {
  useCatalog();
  const { category } = Route.useSearch();
  const cats = (Object.keys(CATEGORY_LABEL) as Category[]).filter((c) => c !== "mail-club");
  const list = liveProducts().filter((p) => p.status !== "retired" && !p.edition)
    .filter((p) => !category || p.category === category);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 md:px-10 md:pt-8">
      <h1 className="heading">The shop</h1>
      <p className="accent mt-3">everything here was painted by hand</p>
      <nav aria-label="Categories" className="mt-5 flex min-w-0 gap-x-5 overflow-x-auto border-y py-3 [scrollbar-width:none] md:mt-8 md:flex-wrap md:gap-x-7 md:py-5">
        <Link to="/shop" search={{}} className={`eyebrow link-sketch shrink-0 py-2 ${!category ? "text-pink" : ""}`}>All</Link>
        {cats.map((c) => (
          <Link key={c} to="/shop" search={{ category: c }} className={`eyebrow link-sketch shrink-0 py-2 ${category === c ? "text-pink" : ""}`}>{CATEGORY_LABEL[c]}</Link>
        ))}
      </nav>
      {list.length === 0 ? (
        <p className="type py-24 text-center">Nothing here yet — new sketches are on the way.</p>
      ) : (
        <div className="mt-6 grid min-w-0 grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-3 md:gap-x-6">
          {list.map((p) => <ProductCard key={p.id} product={p} compact />)}
        </div>
      )}
    </div>
  );
}
