import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { isAdminEmail } from "@/lib/admins";
import { useAuth } from "@/lib/auth";
import { listOffers, removeOffer, saveOffer, type Offer } from "@/lib/offers";
import { cancelOrder, confirmOrder, listAllOrders, markPaid, markShipped, watchAllOrders } from "@/lib/orders-db";
import { isMailClub, orderStatusLabel, PROMO_CODE, type SavedOrder } from "@/lib/orders.functions";
import { CATEGORY_LABEL, HAMPER_TIERS, PRODUCTS, catalogState, formatPrice, liveProducts, type Category, type Listing } from "@/lib/products";
import { COLLECTIONS, compressImage, listReviews, listTickets, removeReview, saveListing, setTicketStatus, suggestReply, useCatalog, type Review, type Ticket } from "@/lib/studio";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "stock", label: "Stock" },
  { id: "products", label: "Products" },
  { id: "hampers", label: "Hampers" },
  { id: "customers", label: "Customers" },
  { id: "support", label: "Support" },
  { id: "reviews", label: "Reviews" },
  { id: "offers", label: "Offers" },
] as const;

type Tab = (typeof tabs)[number]["id"];

export const Route = createFileRoute("/admin")({
  validateSearch: (search: Record<string, unknown>): { tab: Tab } => {
    const tab = search["tab"];
    return tabs.some((item) => item.id === tab) ? { tab: tab as Tab } : { tab: "overview" };
  },
  head: () => ({ meta: [{ title: "Studio — Halfस्केच" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

const pill = (on: boolean) => `rounded-full px-2.5 py-1 text-[0.68rem] leading-none ${on ? "bg-foreground text-background" : "border"}`;
const h2 = "text-base font-semibold leading-tight";
const note = "mt-1 text-xs leading-snug text-muted-foreground";

function when(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
}

function stage(order: SavedOrder) {
  if (order.status === "order_cancelled") return "cancelled";
  if (order.fulfillment === "shipped") return "shipped";
  if (order.paymentStatus === "paid") return "paid";
  return "pending";
}

function AdminPage() {
  const { tab } = Route.useSearch();
  const { ready, user } = useAuth();
  const catalog = useCatalog();
  const [orders, setOrders] = useState<SavedOrder[] | null>(null);
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const email = user?.email ?? "";
  const admin = isAdminEmail(email);

  useEffect(() => {
    if (!ready || !user || !admin) return;
    let cancel = false;
    let stopOrders: (() => void) | undefined;
    try {
      stopOrders = watchAllOrders(
        (rows) => { if (!cancel) setOrders(rows); },
        (err) => { if (!cancel) setError(err.message); },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't load orders.");
    }
    listTickets().then((rows) => { if (!cancel) setTickets(rows); }).catch(() => { if (!cancel) setTickets([]); });
    listReviews().then((rows) => { if (!cancel) setReviews(rows); }).catch(() => { if (!cancel) setReviews([]); });
    return () => {
      cancel = true;
      stopOrders?.();
    };
  }, [ready, user, admin]);

  if (!ready) return <div className="min-h-[50vh]" />;

  return (
    <div className="mx-auto max-w-[1000px] px-4 pt-4 text-sm leading-snug md:px-10">
      <p className="accent leading-none">the studio desk</p>
      <h1 className="heading mt-1">Studio</h1>
      {!user || !admin ? (
        <div className="mt-12 max-w-md">
          <p className="text-muted-foreground">This page is only for the studio.</p>
          {!user ? <Link to="/sign-in" className="btn-line mt-8">Sign in</Link> : null}
        </div>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tabs.map((item) => (
              <Link key={item.id} to="/admin" search={{ tab: item.id }} className={pill(tab === item.id)}>{item.label}</Link>
            ))}
          </div>
          {error ? <p className="mt-6 text-pink">{error}</p> : null}
          {tab === "overview" ? <Overview orders={orders} tickets={tickets} reviews={reviews} /> : null}
          {tab === "orders" ? <OrdersTab orders={orders} setOrders={setOrders} setError={setError} /> : null}
          {tab === "stock" ? <StockTab setError={setError} /> : null}
          {tab === "products" ? <ProductsTab ready={catalog.ready} setError={setError} /> : null}
          {tab === "hampers" ? <HampersTab setError={setError} /> : null}
          {tab === "customers" ? <CustomersTab orders={orders} /> : null}
          {tab === "support" ? <SupportTab tickets={tickets} setTickets={setTickets} setError={setError} /> : null}
          {tab === "reviews" ? <ReviewsTab reviews={reviews} setReviews={setReviews} setError={setError} /> : null}
          {tab === "offers" ? <OffersTab setError={setError} /> : null}
        </>
      )}
    </div>
  );
}

function Overview({ orders, tickets, reviews }: { orders: SavedOrder[] | null; tickets: Ticket[] | null; reviews: Review[] | null }) {
  const revenue = (orders ?? []).reduce((sum, order) => sum + order.total, 0);
  const cards = [
    ["Orders", orders ? String(orders.length) : "…"],
    ["Open tickets", tickets ? String(tickets.filter((ticket) => ticket.status === "open").length) : "…"],
    ["Customers", orders ? String(new Set(orders.map((order) => order.customer.email)).size) : "…"],
    ["Taken", orders ? formatPrice(revenue) : "…"],
    ["Reviews", reviews ? String(reviews.length) : "…"],
  ];
  return (
    <section className="mt-4">
      <h2 className={h2}>Overview</h2>
      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-xl border px-3 py-2">
            <p className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-lg font-semibold leading-tight tabular-nums">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StockTab({ setError }: { setError: (message: string | null) => void }) {
  const { ready, listings } = useCatalog();
  const [busy, setBusy] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const pieces = liveProducts().filter((product) => product.status !== "retired");
  // The real count, even while a piece is paused with Sold out.
  const countOf = (slug: string) => listings[slug]?.stock ?? PRODUCTS.find((p) => p.slug === slug)?.stock ?? 0;
  // When Confirm stock / Mark paid changes Firestore stock, drop drafts so inputs show the new counts.
  const stockKey = Object.entries(listings).map(([slug, row]) => `${slug}:${row.stock ?? ""}:${row.soldOut ? 1 : 0}`).sort().join("|");
  useEffect(() => {
    setDrafts((prev) => (Object.keys(prev).length ? {} : prev));
  }, [stockKey]);
  async function save(slug: string, patch: Partial<Listing>) {
    setBusy(slug);
    setError(null);
    try { await saveListing({ slug, ...patch }); }
    catch (err) { setError(err instanceof Error ? err.message : "We couldn't update that piece."); }
    finally { setBusy(""); }
  }
  return (
    <section className="mt-4">
      <h2 className={h2}>Stock</h2>
      <p className={note}>Set how many of each piece you have. Counts update live when you Mark paid or Confirm stock on an order. A piece shows Sold out on its own at 0. Use Sold out to pause a piece any time, and Put back to sell it again.</p>
      {!ready ? <p className="mt-3 text-muted-foreground">Loading stock…</p> : null}
      <ul className="mt-2 divide-y rounded-xl border">
        {pieces.map((product) => {
          const count = countOf(product.slug);
          const paused = listings[product.slug]?.soldOut === true;
          const draft = drafts[product.slug] ?? String(count);
          const changed = Math.max(0, Math.floor(Number(draft) || 0)) !== count;
          const unit = product.edition ? "copies" : "in stock";
          return (
            <li key={product.slug} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate font-medium leading-tight">{product.name}</p>
                <p className={`text-xs ${paused || count === 0 ? "text-pink" : "text-muted-foreground"}`}>
                  {paused ? `Sold out (paused) · ${count} ${unit}` : count === 0 ? "Sold out · 0 left" : `${count} ${unit}`}
                  {product.edition && product.price <= 0 ? " · set a price in Products to open pre-orders" : ""}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <input type="number" min={0} inputMode="numeric" className="field w-16 !py-1 text-center text-sm" aria-label={`How many of ${product.name}`}
                  value={draft} onChange={(e) => setDrafts((prev) => ({ ...prev, [product.slug]: e.target.value }))} />
                <button type="button" className={pill(changed)} disabled={!changed || busy === product.slug} onClick={async () => {
                  await save(product.slug, { stock: Math.max(0, Math.floor(Number(draft) || 0)) });
                  setDrafts((prev) => { const next = { ...prev }; delete next[product.slug]; return next; });
                }}>Save</button>
                <button type="button" className={pill(false)} disabled={busy === product.slug} onClick={() => save(product.slug, { soldOut: !paused })}>
                  {paused ? "Put back" : "Sold out"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function OrdersTab({ orders, setOrders, setError }: { orders: SavedOrder[] | null; setOrders: Dispatch<SetStateAction<SavedOrder[] | null>>; setError: (message: string | null) => void }) {
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "shipped" | "cancelled" | "mail club">("all");
  const [busy, setBusy] = useState("");
  const visible = (orders ?? []).filter((order) => filter === "all" || (filter === "mail club" ? isMailClub(order) : stage(order) === filter));
  async function run(id: string, work: () => Promise<void>, patch: Partial<SavedOrder>) {
    setBusy(id);
    setError(null);
    // Optimistic: badges/buttons flip immediately; the orders snapshot confirms or corrects next.
    setOrders((prev) => (prev ?? []).map((order) => order.orderId === id ? { ...order, ...patch } : order));
    try {
      await work();
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't update that order.");
      try { setOrders(await listAllOrders()); }
      catch { /* snapshot watcher will catch up if it can */ }
    } finally {
      setBusy("");
    }
  }
  return (
    <section className="mt-4">
      <h2 className={h2}>Orders</h2>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {(["all", "pending", "paid", "shipped", "cancelled", "mail club"] as const).map((id) => (
          <button key={id} type="button" className={pill(filter === id)} onClick={() => setFilter(id)}>{id.toUpperCase()}</button>
        ))}
      </div>
      {!orders ? <p className="mt-3 text-muted-foreground">Loading orders…</p> : null}
      <div className="mt-3 grid gap-2">
        {visible.map((order) => (
          <article key={order.orderId} className="rounded-xl border p-3">
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-pink/15 px-2 py-0.5 text-xs">{order.orderId}</span>
              <span className="rounded-full border px-2 py-0.5 text-xs capitalize">{stage(order)}</span>
              {isMailClub(order) ? <span className="rounded-full bg-foreground px-2 py-0.5 text-xs text-background">Mail Club</span> : null}
              {order.status === "order_confirmed" ? <span className="rounded-full border px-2 py-0.5 text-xs">{orderStatusLabel(order.status)}</span> : null}
            </div>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">{when(order.createdAt)}</p>
            <div className="mt-2 rounded-lg bg-paper px-3 py-2 text-xs leading-snug">
              <p className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground">Customer</p>
              <p className="mt-1 font-medium">{order.customer.customerName}</p>
              <p>{order.customer.phone}</p>
              <p className="break-all text-muted-foreground">{order.customer.email}</p>
              <p className="text-muted-foreground">{order.customer.address}, {order.customer.city}, {order.customer.state} — {order.customer.postalCode}</p>
            </div>
            <div className="mt-2 rounded-lg bg-paper px-3 py-2 text-xs leading-snug">
              <p className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground">Items</p>
              {order.items.map((item) => (
                <p key={item.slug} className="mt-1 flex justify-between gap-2"><span className="min-w-0">{item.name} × {item.quantity}</span><span className="shrink-0 tabular-nums">{formatPrice(item.price * item.quantity)}</span></p>
              ))}
              <p className="mt-1 flex justify-between border-t pt-1 font-medium"><span>Total</span><span className="tabular-nums">{formatPrice(order.total)}</span></p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {stage(order) === "cancelled" ? null : <>
              {stage(order) === "pending" ? <button type="button" className={pill(false)} disabled={busy === order.orderId} onClick={() => run(order.orderId, () => markPaid(order.orderId), { paymentStatus: "paid", status: "order_confirmed" })}>Mark paid</button> : null}
              {order.fulfillment !== "shipped" ? <button type="button" className={pill(false)} disabled={busy === order.orderId} onClick={() => run(order.orderId, () => markShipped(order.orderId), { fulfillment: "shipped" })}>Mark shipped</button> : null}
              {order.status !== "order_confirmed" ? <button type="button" className={pill(false)} disabled={busy === order.orderId} onClick={() => run(order.orderId, () => confirmOrder(order.orderId).then(() => undefined), { status: "order_confirmed" })}>Confirm stock</button> : null}
              {stage(order) === "pending" && order.status === "order_placed" ? <button type="button" className={pill(false)} disabled={busy === order.orderId} onClick={() => run(order.orderId, () => cancelOrder(order.orderId), { status: "order_cancelled" })}>Cancel unpaid order</button> : null}
              </>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductsTab({ ready, setError }: { ready: boolean; setError: (message: string | null) => void }) {
  const products = liveProducts().filter((product) => product.status !== "retired");
  const listings = catalogState().listings;
  const [drafts, setDrafts] = useState<Record<string, { mrp: string; price: string; cost: string; stock: string }>>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const next: Record<string, { mrp: string; price: string; cost: string; stock: string }> = {};
    for (const product of liveProducts()) {
      const row = listings[product.slug];
      next[product.slug] = { mrp: String(row?.mrp ?? 0), price: String(product.price), cost: String(row?.cost ?? 0), stock: String(row?.stock ?? 0) };
    }
    setDrafts(next);
  }, [listings, ready]);
  return (
    <section className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={h2}>Products</h2>
        <button type="button" className="btn-ink !px-3 !py-2 !text-[0.62rem]" disabled={busy} onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            for (const product of products) {
              const row = drafts[product.slug];
              if (!row) continue;
              await saveListing({ slug: product.slug, price: Math.max(0, Number(row.price) || 0), mrp: Math.max(0, Number(row.mrp) || 0), cost: Math.max(0, Number(row.cost) || 0) });
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : "We couldn't save prices.");
          } finally {
            setBusy(false);
          }
        }}>{busy ? "Saving…" : "Save prices"}</button>
      </div>
      <p className={note}>Crossed price, selling price, and private cost. Leave crossed at 0 for no strikethrough. How many you have is set in the Stock tab. The Mail Club opens for pre-order once it has a price here and copies there.</p>
      <ul className="mt-2 divide-y rounded-xl border">
        {products.map((product) => {
          const row = drafts[product.slug] ?? { mrp: "0", price: String(product.price), cost: "0", stock: "0" };
          const profit = (Number(row.price) || 0) - (Number(row.cost) || 0);
          const labels = { mrp: "Crossed", price: "Selling", cost: "Cost" } as const;
          return (
            <li key={product.slug} className="px-3 py-2">
              <p className="font-medium leading-tight">{product.name}</p>
              <p className="text-[0.65rem] leading-tight text-muted-foreground">{Number(row.cost) > 0 ? `Profit ${formatPrice(profit)}` : CATEGORY_LABEL[product.category]}</p>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {(["mrp", "price", "cost"] as const).map((key) => (
                  <label key={key} className="min-w-0">
                    <span className="text-[0.6rem] uppercase tracking-[0.06em] text-muted-foreground">{labels[key]}</span>
                    <input type="number" min={0} className="field !py-1 text-sm" aria-label={`${labels[key]} for ${product.name}`} value={row[key]} onChange={(e) => setDrafts((prev) => ({ ...prev, [product.slug]: { ...row, [key]: e.target.value } }))} />
                  </label>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <AddPiece setError={setError} />
    </section>
  );
}

function AddPiece({ setError }: { setError: (message: string | null) => void }) {
  const [image, setImage] = useState("");
  const [soldOut, setSoldOut] = useState(false);
  const [tiers, setTiers] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
    const stock = soldOut ? 0 : Math.max(0, Number(data.get("stock") || 0));
    const row: Listing = {
      slug, custom: true, name, description: String(data.get("description") || ""),
      price: Math.max(0, Number(data.get("price") || 0)), mrp: Math.max(0, Number(data.get("mrp") || 0)),
      cost: Math.max(0, Number(data.get("cost") || 0)), stock, soldOut, tiers,
      category: String(data.get("category") || "bookmarks") as Category,
      collection: String(data.get("collection") || ""),
      variants: String(data.get("variants") || ""),
      image: image || String(data.get("image") || ""),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    if (!slug) return;
    setBusy(true);
    setError(null);
    try {
      await saveListing(row);
      form.reset();
      setImage("");
      setSoldOut(false);
      setTiers([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't save that piece.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-2 rounded-xl border p-3">
      <h3 className={h2}>Add a piece</h3>
      <input name="name" required placeholder="Name" className="field !py-1 text-sm" />
      <textarea name="description" placeholder="Description" className="field min-h-16 !py-1 text-sm" />
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="leading-tight"><span className="text-[0.65rem] uppercase tracking-[0.06em] text-muted-foreground">Selling price (₹)</span><input name="price" type="number" min={0} required className="field !py-1 text-sm" /></label>
        <label className="leading-tight"><span className="text-[0.65rem] uppercase tracking-[0.06em] text-muted-foreground">MRP / original ₹</span><input name="mrp" type="number" min={0} className="field !py-1 text-sm" placeholder="Optional" /></label>
        <label className="leading-tight"><span className="text-[0.65rem] uppercase tracking-[0.06em] text-muted-foreground">Your cost ₹</span><input name="cost" type="number" min={0} className="field !py-1 text-sm" /><span className="text-[0.65rem] leading-tight text-muted-foreground">Private — for profit</span></label>
        <label className="leading-tight"><span className="text-[0.65rem] uppercase tracking-[0.06em] text-muted-foreground">Stock available</span><input name="stock" type="number" min={0} defaultValue={1} className="field !py-1 text-sm" /><span className="text-[0.65rem] leading-tight text-muted-foreground">Private — customers never see this</span></label>
      </div>
      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={soldOut} onChange={(e) => setSoldOut(e.target.checked)} /> Mark as sold out</label>
      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.06em] text-muted-foreground">Hamper eligibility</p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
          {HAMPER_TIERS.map((tier) => (
            <label key={tier} className="flex items-center gap-1 text-xs">
              <input type="checkbox" checked={tiers.includes(tier)} onChange={(e) => setTiers((prev) => e.target.checked ? [...prev, tier] : prev.filter((item) => item !== tier))} />
              {formatPrice(tier)}
            </label>
          ))}
        </div>
      </div>
      <label className="btn-ink w-fit cursor-pointer !px-3 !py-2 !text-[0.62rem]">
        Upload image
        <input type="file" accept="image/png,image/jpeg" className="sr-only" onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try { setImage(await compressImage(file)); } catch (err) { setError(err instanceof Error ? err.message : "We couldn't use that photo."); }
        }} />
      </label>
      {image ? <p className="text-xs text-muted-foreground">Photo attached.</p> : null}
      <input name="image" className="field !py-1 text-sm" placeholder="or paste an image path / URL" />
      <div className="grid gap-2 sm:grid-cols-2">
        <select name="category" className="field !py-1 text-sm" aria-label="Category">{Object.entries(CATEGORY_LABEL).filter(([id]) => id !== "mail-club").map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
        <select name="collection" className="field !py-1 text-sm" aria-label="Collection"><option value="">Collection</option>{COLLECTIONS.map((item) => <option key={item}>{item}</option>)}</select>
      </div>
      <input name="variants" className="field !py-1 text-sm" placeholder="Variants, comma separated (e.g. S, M, L)" />
      <button className="btn-ink justify-center !py-2 !text-[0.62rem]" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
    </form>
  );
}

function HampersTab({ setError }: { setError: (message: string | null) => void }) {
  useCatalog();
  const [query, setQuery] = useState("");
  const listings = catalogState().listings;
  const products = liveProducts().filter((product) => product.status !== "retired" && product.name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <section className="mt-4">
      <h2 className={h2}>Hampers</h2>
      <p className={note}>Tick a budget to save it. Sold-out pieces stay locked.</p>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="field mt-2 !py-1 text-sm" />
      <p className="mt-1 text-center text-xs text-muted-foreground">Showing {products.length} pieces</p>
      <ul className="mt-2 divide-y rounded-xl border">
        {products.map((product) => {
          const locked = product.stock <= 0;
          const chosen = listings[product.slug]?.tiers ?? [];
          return (
            <li key={product.slug} className="px-3 py-2">
              <p className="font-medium leading-tight">{product.name}</p>
              <p className="text-[0.65rem] leading-tight text-muted-foreground">{CATEGORY_LABEL[product.category]}{product.collection ? ` · ${product.collection}` : ""} · {formatPrice(product.price)}</p>
              <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1">
                {HAMPER_TIERS.map((tier) => (
                  <label key={tier} className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" disabled={locked} checked={chosen.includes(tier)} aria-label={`${product.name} ${formatPrice(tier)} hamper`} onChange={async (e) => {
                      const tiers = e.target.checked ? [...chosen, tier] : chosen.filter((item) => item !== tier);
                      setError(null);
                      try { await saveListing({ slug: product.slug, tiers }); } catch (err) { setError(err instanceof Error ? err.message : "We couldn't save that hamper."); }
                    }} />
                    {formatPrice(tier)}
                  </label>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CustomersTab({ orders }: { orders: SavedOrder[] | null }) {
  const rows = [...(orders ?? []).reduce((map, order) => {
    const email = order.customer.email.toLowerCase();
    const current = map.get(email) ?? { name: order.customer.customerName, email, phone: order.customer.phone, spent: 0, count: 0 };
    current.spent += order.total;
    current.count += 1;
    map.set(email, current);
    return map;
  }, new Map<string, { name: string; email: string; phone: string; spent: number; count: number }>()).values()].sort((a, b) => b.spent - a.spent);
  return (
    <section className="mt-4">
      <h2 className={h2}>Customers</h2>
      <p className={note}>{orders ? `${rows.length} customers · sorted by total spent.` : "Loading customers…"}</p>
      {rows.length === 0 && orders ? <p className="mt-3 text-muted-foreground">No customers yet.</p> : null}
      {rows.length > 0 ? (
        <ul className="mt-2 divide-y rounded-xl border">
          {rows.map((row) => (
            <li key={row.email} className="px-3 py-2">
              <p className="font-medium leading-tight">{row.name || "Customer"}</p>
              <p className="break-all text-xs leading-snug text-muted-foreground">{row.email}</p>
              <p className="text-xs leading-snug">{row.phone} · {formatPrice(row.spent)} · {row.count} {row.count === 1 ? "order" : "orders"}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function SupportTab({ tickets, setTickets, setError }: { tickets: Ticket[] | null; setTickets: (rows: Ticket[]) => void; setError: (message: string | null) => void }) {
  const [filter, setFilter] = useState<"all" | "open" | "pending" | "resolved">("all");
  const [copied, setCopied] = useState("");
  const rows = (tickets ?? []).filter((ticket) => filter === "all" || ticket.status === filter).sort((a, b) => Number(b.tags.includes("High")) - Number(a.tags.includes("High")));
  const open = (tickets ?? []).filter((ticket) => ticket.status === "open").length;
  return (
    <section className="mt-4">
      <h2 className={h2}>Support</h2>
      <p className={note}>{tickets ? `${tickets.length} tickets · ${open} open · sorted by urgency.` : "Loading tickets…"}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {(["all", "open", "pending", "resolved"] as const).map((id) => (
          <button key={id} type="button" className={pill(filter === id)} onClick={() => setFilter(id)}>{id[0]!.toUpperCase() + id.slice(1)}</button>
        ))}
      </div>
      <div className="mt-2 grid gap-2">
        {rows.map((ticket) => {
          const tags = ticket.status === "resolved" ? [...ticket.tags, "Resolved"] : ticket.tags;
          const reply = suggestReply(ticket);
          return (
            <article key={ticket.id} className="rounded-xl border p-3">
              <h3 className="font-semibold leading-tight">{ticket.title}</h3>
              <p className="mt-0.5 break-all text-xs leading-snug">{ticket.name} · {ticket.email}</p>
              <p className="text-xs leading-snug text-muted-foreground">{when(ticket.createdAt)}{ticket.orderId ? ` · ${ticket.orderId}` : ""}</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {tags.map((tag) => <span key={tag} className="rounded-full border px-2 py-0.5 text-[0.65rem] leading-none">{tag}</span>)}
              </div>
              <p className="mt-1.5 text-xs leading-snug">“{ticket.message}”</p>
              <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-snug">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[0.65rem] uppercase tracking-[0.06em]">Suggested reply</p>
                  <button type="button" className="underline" onClick={() => { navigator.clipboard.writeText(reply).then(() => setCopied(ticket.id)); }}>Copy</button>
                </div>
                <p className="mt-1">{reply}</p>
                {copied === ticket.id ? <p className="mt-1 text-muted-foreground">Copied.</p> : null}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(["open", "pending", "resolved"] as const).map((status) => (
                  <button key={status} type="button" className={pill(ticket.status === status)} onClick={async () => {
                    setError(null);
                    try {
                      await setTicketStatus(ticket.id, status);
                      setTickets((tickets ?? []).map((item) => item.id === ticket.id ? { ...item, status } : item));
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "We couldn't update that ticket.");
                    }
                  }}>{status}</button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ReviewsTab({ reviews, setReviews, setError }: { reviews: Review[] | null; setReviews: (rows: Review[]) => void; setError: (message: string | null) => void }) {
  return (
    <section className="mt-4">
      <h2 className={h2}>Reviews</h2>
      <p className={note}>{reviews ? `${reviews.length} reviews` : "Loading reviews…"}</p>
      <div className="mt-2 grid gap-2">
        {(reviews ?? []).map((review) => (
          <article key={review.id} className="rounded-xl border px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium leading-tight">{review.name} · {"★".repeat(review.stars)}</p>
              <button type="button" className={pill(false)} onClick={async () => {
              setError(null);
              try {
                await removeReview(review.id);
                setReviews((reviews ?? []).filter((item) => item.id !== review.id));
              } catch (err) {
                setError(err instanceof Error ? err.message : "We couldn't remove that review.");
              }
              }}>Remove</button>
            </div>
            <p className="text-xs leading-snug text-muted-foreground">{review.slug}</p>
            <p className="mt-0.5 text-xs leading-snug">{review.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function OffersTab({ setError }: { setError: (message: string | null) => void }) {
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [percent, setPercent] = useState("10");
  const [minOrder, setMinOrder] = useState("");
  const [customersOnly, setCustomersOnly] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => { listOffers().then(setOffers).catch((err: unknown) => setError(err instanceof Error ? err.message : "We couldn't load offers.")); }, [setError]);

  return (
    <section className="mt-4">
      <h2 className={h2}>Create an offer</h2>
      <form className="mt-2 grid gap-2 rounded-xl border p-3" onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          await saveOffer({ code, label, percent: Number(percent), minOrder: Number(minOrder) || 0, customersOnly, active: true });
          setOffers(await listOffers());
          setCode("");
          setLabel("");
        } catch (err) {
          setError(err instanceof Error ? err.message : "We couldn't save that offer.");
        } finally {
          setBusy(false);
        }
      }}>
        <label className="leading-tight"><span className="text-[0.65rem] uppercase tracking-[0.06em] text-muted-foreground">Code</span><input value={code} onChange={(e) => setCode(e.target.value)} required className="field !py-1 text-sm" placeholder="FRI26" /></label>
        <label className="leading-tight"><span className="text-[0.65rem] uppercase tracking-[0.06em] text-muted-foreground">Label</span><input value={label} onChange={(e) => setLabel(e.target.value)} className="field !py-1 text-sm" placeholder="Friendship day offer" /></label>
        <label className="leading-tight"><span className="text-[0.65rem] uppercase tracking-[0.06em] text-muted-foreground">Percent off (%)</span><input type="number" min={0} max={100} value={percent} onChange={(e) => setPercent(e.target.value)} className="field !py-1 text-sm" /></label>
        <label className="leading-tight"><span className="text-[0.65rem] uppercase tracking-[0.06em] text-muted-foreground">Minimum order ₹</span><input type="number" min={0} value={minOrder} onChange={(e) => setMinOrder(e.target.value)} className="field !py-1 text-sm" placeholder="Optional" /></label>
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={customersOnly} onChange={(e) => setCustomersOnly(e.target.checked)} /> Active customers can use it</label>
        <p className="text-xs leading-snug text-muted-foreground">0% off removes shipping. A higher percent comes off the pieces and keeps ₹90 shipping. HALFSKETCH06 always removes shipping.</p>
        <button className="btn-ink justify-center !py-2 !text-[0.62rem]" disabled={busy}>{busy ? "Saving…" : "Create offer"}</button>
      </form>
      <ul className="mt-2 divide-y rounded-xl border">
        <li className="flex items-center justify-between gap-2 px-3 py-2">
          <div><p className="font-medium leading-tight">{PROMO_CODE}</p><p className="text-xs leading-snug text-muted-foreground">Free shipping · built in</p></div>
          <span className="rounded-full bg-foreground px-2 py-0.5 text-[0.65rem] text-background">Active</span>
        </li>
        {(offers ?? []).filter((offer) => offer.code !== PROMO_CODE).map((offer) => (
          <li key={offer.code} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
            <div className="min-w-0">
              <p className="font-medium leading-tight">{offer.code}</p>
              <p className="text-xs leading-snug text-muted-foreground">{offer.label} · {offer.percent}% off{offer.minOrder ? ` · min ${formatPrice(offer.minOrder)}` : ""}{offer.customersOnly ? " · customers only" : ""}</p>
            </div>
            <button type="button" className={pill(false)} onClick={async () => {
              setError(null);
              try { await removeOffer(offer.code); setOffers(await listOffers()); } catch (err) { setError(err instanceof Error ? err.message : "We couldn't remove that offer."); }
            }}>Remove</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
