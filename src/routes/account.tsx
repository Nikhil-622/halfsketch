import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Avatar } from "@/components/site/Avatar";
import { BrushLoader } from "@/components/site/BrushLoader";
import { OrderList } from "@/components/site/OrderList";
import { isAdminEmail } from "@/lib/admins";
import { useAuth, type UserProfile } from "@/lib/auth";
import { listOrdersByEmail } from "@/lib/orders-db";
import type { SavedOrder } from "@/lib/orders.functions";

type Tab = "orders" | "profile";

export const Route = createFileRoute("/account")({
  validateSearch: (s: Record<string, unknown>): { tab?: Tab } => (s["tab"] === "profile" ? { tab: "profile" } : {}),
  head: () => ({
    meta: [
      { title: "My account — Halfस्केच" },
      { name: "description", content: "Your Halfस्केच profile and orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

const FIELDS: { key: keyof Omit<UserProfile, "email" | "cart">; label: string; auto: string; type?: string; full?: boolean; numeric?: boolean }[] = [
  { key: "name", label: "Full name", auto: "name", full: true },
  { key: "phone", label: "Phone number", auto: "tel", type: "tel" },
  { key: "postalCode", label: "Postal code", auto: "postal-code", numeric: true },
  { key: "address", label: "Address", auto: "street-address", full: true },
  { key: "city", label: "City", auto: "address-level2" },
  { key: "state", label: "State", auto: "address-level1" },
];

function AccountPage() {
  const { ready, user, profile, saveProfile, signOutUser } = useAuth();
  const navigate = useNavigate();
  const tab: Tab = Route.useSearch().tab ?? "orders";
  const [orders, setOrders] = useState<SavedOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      navigate({ to: "/sign-in", search: { redirect: "/account" } });
      return;
    }
    let cancel = false;
    listOrdersByEmail(user.email ?? "")
      .then((rows) => { if (!cancel) setOrders(rows); })
      .catch((err: unknown) => { if (!cancel) setError(err instanceof Error ? err.message : "We couldn't load your orders."); });
    return () => { cancel = true; };
  }, [ready, user, navigate]);

  if (!ready || !user) return <BrushLoader label="Just a moment…" />;

  const email = user.email ?? "";
  const first = (profile?.name || user.displayName || "").trim().split(/\s+/)[0];
  const active = (orders ?? []).filter((o) => o.status !== "order_cancelled");
  const pill = (on: boolean) => `flex-1 py-3 text-center text-[0.7rem] uppercase tracking-[0.18em] transition ${on ? "bg-foreground text-background" : "hover:bg-pink/20"}`;

  async function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const patch = Object.fromEntries(FIELDS.map((f) => [f.key, String(data.get(f.key) ?? "").trim()])) as Partial<UserProfile>;
    setBusy(true);
    setNote("");
    try {
      await saveProfile(patch);
      setNote("Saved. We'll fill these in for you at checkout.");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "We couldn't save that.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[760px] px-5 pt-6 md:px-10 md:pt-12">
      {/* who's here */}
      <section className="border border-foreground/20 bg-paper px-5 py-6 text-center md:py-8">
        <Avatar email={email} photoURL={user.photoURL} className="mx-auto size-20 border-2 border-pink text-2xl" />
        <h1 className="font-script mt-3 text-5xl leading-none md:text-6xl">{first ? `Hello, ${first}` : "Hello there"}</h1>
        <p className="type mt-2 break-all text-muted-foreground">{email}</p>
        <dl className="mx-auto mt-5 grid max-w-xs grid-cols-2 divide-x divide-foreground/15 border-y border-foreground/15 py-3">
          <div><dt className="eyebrow text-muted-foreground">Orders</dt><dd className="mt-1 text-xl tabular-nums">{orders ? active.length : "…"}</dd></div>
          <div><dt className="eyebrow text-muted-foreground">On its way</dt><dd className="mt-1 text-xl tabular-nums">{orders ? active.filter((o) => o.fulfillment !== "shipped").length : "…"}</dd></div>
        </dl>
      </section>

      {/* two tabs: orders and profile */}
      <nav aria-label="Account" className="mt-6 flex border border-foreground">
        <Link to="/account" search={{}} className={pill(tab === "orders")} aria-current={tab === "orders" ? "page" : undefined}>My orders</Link>
        <Link to="/account" search={{ tab: "profile" }} className={`${pill(tab === "profile")} border-l border-foreground`} aria-current={tab === "profile" ? "page" : undefined}>Profile</Link>
      </nav>

      {tab === "orders" ? (
        <section className="mt-2">
          {error ? <p className="type mt-6 text-pink">{error}</p> : null}
          {orders ? <OrderList orders={orders} /> : !error ? <p className="type mt-8 text-center text-muted-foreground">Loading your orders…</p> : null}
        </section>
      ) : (
        <section className="mt-6">
          <p className="type">Your delivery details. We fill these in for you at checkout.</p>
          <form key={profile ? "loaded" : "empty"} onSubmit={onSave} className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5">
            <label className="col-span-2">
              <span className="eyebrow text-muted-foreground">Email</span>
              <input value={email} readOnly className="field cursor-not-allowed text-muted-foreground" />
            </label>
            {FIELDS.map((f) => (
              <label key={f.key} className={f.full ? "col-span-2" : "col-span-2 sm:col-span-1"}>
                <span className="eyebrow text-muted-foreground">{f.label}</span>
                <input name={f.key} type={f.type ?? "text"} autoComplete={f.auto} inputMode={f.numeric ? "numeric" : undefined}
                  defaultValue={profile?.[f.key] ?? ""} className="field" />
              </label>
            ))}
            <button type="submit" className="btn-ink col-span-2" disabled={busy}>{busy ? "Saving…" : "Save details"}</button>
            {note ? <p role="status" className="accent col-span-2 text-center">{note}</p> : null}
          </form>
        </section>
      )}

      {isAdminEmail(email) ? (
        <section className="mt-10 border border-dashed border-foreground/30 px-5 py-4">
          <p className="eyebrow text-muted-foreground">The studio desk</p>
          <div className="mt-2 flex flex-wrap gap-x-8">
            <Link to="/admin" search={{ tab: "orders" }} className="btn-line">Studio orders</Link>
            <Link to="/admin" search={{ tab: "stock" }} className="btn-line">Stock</Link>
          </div>
        </section>
      ) : null}

      <div className="mt-8 text-center">
        <button type="button" className="btn-line" onClick={() => { void signOutUser(); navigate({ to: "/" }); }}>Sign out</button>
      </div>
    </div>
  );
}
