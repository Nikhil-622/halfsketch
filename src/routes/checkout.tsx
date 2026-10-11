import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth, type UserProfile } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { listOffers, quote, type Offer } from "@/lib/offers";
import { PENDING_CHECKOUT_KEY, PROMO_KEY, SHIPPING_RUPEES, type Customer } from "@/lib/orders.functions";
import { hasOrdered } from "@/lib/studio";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Halfस्केच" },
      { name: "description", content: "Place your Halfस्केच order." },
      { property: "og:title", content: "Checkout — Halfस्केच" },
      { property: "og:description", content: "Place your order for handmade pieces." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

function profileValue(profile: UserProfile | null, name: keyof Customer) {
  if (!profile) return "";
  const values: Record<keyof Customer, string> = {
    customerName: profile.name,
    email: profile.email,
    phone: profile.phone,
    address: profile.address,
    city: profile.city,
    state: profile.state,
    postalCode: profile.postalCode,
  };
  return values[name];
}

const fields: { name: keyof Customer; label: string; type?: string; auto: string; full?: boolean }[] = [
  { name: "customerName", label: "Full name", auto: "name", full: true },
  { name: "email", label: "Email", type: "email", auto: "email" },
  { name: "phone", label: "Phone number", type: "tel", auto: "tel" },
  { name: "address", label: "Address", auto: "street-address", full: true },
  { name: "city", label: "City", auto: "address-level2" },
  { name: "state", label: "State", auto: "address-level1" },
  { name: "postalCode", label: "Postal code", auto: "postal-code" },
];

function Checkout() {
  const { items, subtotal } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");
  const [promo, setPromo] = useState("");
  const [rejected, setRejected] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    listOffers().then(setOffers).catch(() => setOffers([]));
  }, []);
  const priced = quote(subtotal, promo, offers, true);
  const shipping = priced.ok ? priced.shipping : SHIPPING_RUPEES;
  const discount = priced.ok ? priced.discount : 0;
  const total = Math.max(0, subtotal - discount + shipping);

  async function applyPromo() {
    const code = draft.trim().toUpperCase();
    const offer = offers.find((item) => item.active && item.code === code);
    const active = offer?.customersOnly ? await hasOrdered(profile?.email || "") : true;
    const next = quote(subtotal, draft, offers, active);
    setPromo(next.ok ? draft : "");
    setRejected(!next.ok);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const customer = Object.fromEntries(new FormData(e.currentTarget)) as unknown as Customer;
    sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(customer));
    sessionStorage.setItem(PROMO_KEY, promo);
    navigate({ to: "/payment" });
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="heading">Your cart is empty.</h1>
        <Link to="/shop" className="btn-ink mt-8">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-5 pt-12 md:px-10">
      <h1 className="display">Checkout</h1>
      <div className="mt-12 grid gap-16 md:grid-cols-[1.5fr_1fr]">
        <form key={user?.uid ?? "guest"} onSubmit={onSubmit} className="grid grid-cols-2 gap-x-6 gap-y-8">
          {fields.map((f) => (
            <label key={f.name} className={f.full ? "col-span-2" : "col-span-2 sm:col-span-1"}>
              <span className="eyebrow text-muted-foreground">{f.label}</span>
              <input name={f.name} type={f.type ?? "text"} autoComplete={f.auto} required className="field" defaultValue={profileValue(profile, f.name)} />
            </label>
          ))}
          <div className="col-span-2 bg-paper p-5 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Next:</span> a Google Pay code for {shipping === 0 ? "your pieces, with shipping removed." : `your pieces plus ₹${shipping} shipping.`} The order is placed after you pay.</p>
          </div>
          <button type="submit" className="btn-ink col-span-2 justify-center">Proceed to payment</button>
        </form>
        <aside className="h-fit border-t pt-6">
          <h2 className="eyebrow">Your order</h2>
          <ul className="mt-6 space-y-4">
            {items.map(({ product: p, quantity }) => (
              <li key={p.slug} className="flex items-center gap-4 text-sm">
                <img src={p.images[0]} alt="" className="aspect-square w-14 bg-paper object-contain p-1" />
                <span className="flex-1">{p.name} <span className="text-muted-foreground">× {quantity}</span></span>
                <span className="tabular-nums">{formatPrice(p.price * quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-end gap-3">
            <label className="min-w-0 flex-1">
              <span className="eyebrow text-muted-foreground">Promo code</span>
              <input value={draft} onChange={(e) => setDraft(e.target.value)} autoComplete="off" className="field" aria-label="Promo code" />
            </label>
            <button type="button" className="btn-line shrink-0" onClick={applyPromo}>Apply</button>
          </div>
          {rejected ? <p className="mt-2 text-sm text-pink">That code doesn't apply.</p> : null}
          <dl className="mt-6 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
            {discount > 0 ? <div className="flex justify-between"><dt>Offer</dt><dd className="tabular-nums">−{formatPrice(discount)}</dd></div> : null}
            <div className="flex justify-between"><dt>Shipping</dt><dd className="tabular-nums">{formatPrice(shipping)}</dd></div>
            <div className="flex justify-between text-base font-medium"><dt>Total</dt><dd className="tabular-nums">{formatPrice(total)}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
