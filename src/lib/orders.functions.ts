import { createServerFn } from "@tanstack/react-start";
import { listOffersServer, PROMO_CODE, quote, SHIPPING_RUPEES } from "./offers";
import { hasOrdered, serverProduct } from "./studio";

export interface Customer {
  customerName: string; email: string; phone: string;
  address: string; city: string; state: string; postalCode: string;
}
export interface OrderItem { slug: string; name: string; price: number; quantity: number }
export { PROMO_CODE, SHIPPING_RUPEES };
export const PROMO_KEY = "halfsketch-promo";
export const PENDING_CHECKOUT_KEY = "halfsketch-pending-checkout";

export const UPI_ID = "dishasondur05@oksbi";

export function upiPayLink(amount: number) {
  const query = [
    `pa=${encodeURIComponent(UPI_ID)}`,
    `pn=${encodeURIComponent("Disha Sondur")}`,
    `am=${encodeURIComponent(amount.toFixed(2))}`,
    "cu=INR",
  ].join("&");
  return `upi://pay?${query}`;
}

export interface Order {
  orderId: string; customer: Customer; items: OrderItem[];
  subtotal: number; shipping: number; discount?: number; total: number; status: string; createdAt: string;
  paymentStatus?: string; fulfillment?: string;
}
export type SavedOrder = Order;
export type PricedOrder = Omit<Order, "orderId" | "createdAt">;

export function orderStatusLabel(status: string) {
  return status === "order_confirmed" ? "Order confirmed" : "Order placed";
}

interface Input { customer: Customer; items: { slug: string; quantity: number }[]; promo?: string }

const str = (v: unknown, max = 300) => {
  if (typeof v !== "string" || !v.trim() || v.length > max) throw new Error("Please fill in every field.");
  return v.trim();
};

// Order submission only — payment (e.g. Razorpay) will be a separate step later.
// Prices are decided here. The browser then stores the priced order in Firestore.
export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((d: Input): Input => {
    const c = d?.customer ?? ({} as Customer);
    const customer: Customer = {
      customerName: str(c.customerName, 120), email: str(c.email, 200), phone: str(c.phone, 30),
      address: str(c.address, 500), city: str(c.city, 100), state: str(c.state, 100), postalCode: str(c.postalCode, 12),
    };
    if (!/^\S+@\S+\.\S+$/.test(customer.email)) throw new Error("Please enter a valid email.");
    if (!Array.isArray(d.items) || d.items.length === 0 || d.items.length > 50) throw new Error("Your cart is empty.");
    const promo = typeof d.promo === "string" ? d.promo.slice(0, 40) : "";
    return { customer, items: d.items.map((i) => ({ slug: String(i.slug), quantity: Math.floor(Number(i.quantity)) })), promo };
  })
  .handler(async ({ data }): Promise<PricedOrder> => {
    const items: OrderItem[] = [];
    for (const i of data.items) {
      const p = await serverProduct(i.slug);
      if (!p || p.status === "retired") throw new Error("One of the pieces in your cart is no longer available.");
      if (i.quantity !== 1) throw new Error(`Only 1 of "${p.name}" can be ordered.`);
      items.push({ slug: p.slug, name: p.name, price: p.price, quantity: i.quantity });
    }
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const offers = await listOffersServer();
    const email = data.customer.email.toLowerCase();
    const matched = offers.find((offer) => offer.active && offer.code === (data.promo ?? "").trim().toUpperCase());
    const active = matched?.customersOnly ? await hasOrdered(email) : true;
    const priced = quote(subtotal, data.promo, offers, active);
    const shipping = priced.ok ? priced.shipping : SHIPPING_RUPEES;
    const discount = priced.ok ? priced.discount : 0;
    return {
      customer: { ...data.customer, email },
      items,
      subtotal,
      shipping,
      discount,
      total: Math.max(0, subtotal - discount + shipping),
      status: "order_placed",
    };
  });
