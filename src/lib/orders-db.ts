import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  updateDoc,
  where,
} from "firebase/firestore";
import { noteCustomer } from "./studio";
import { firebaseAuth, firebaseDb } from "./firebase";
import { PRODUCTS } from "./products";
import type { Order, PricedOrder, SavedOrder } from "./orders.functions";

function db() {
  const store = firebaseDb();
  if (!store) throw new Error("Firebase is not configured.");
  return store;
}

function blocked(error: unknown, fallback: string) {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  if (code === "permission-denied") {
    if (!firebaseAuth()?.currentUser) return new Error("Sign in, then place the order again.");
    return new Error("Firestore blocked this. In Firebase, open Firestore → Rules, paste the rules from firestore.rules, and publish them.");
  }
  console.error(error);
  return new Error(fallback);
}

function asOrder(data: Record<string, unknown>, id: string): SavedOrder {
  const text = (key: string) => (typeof data[key] === "string" ? data[key] : "");
  const num = (key: string) => {
    const n = Number(data[key]);
    return Number.isFinite(n) ? n : 0;
  };
  const items = Array.isArray(data["items"])
    ? data["items"].flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const row = item as Record<string, unknown>;
        const slug = typeof row["slug"] === "string" ? row["slug"] : "";
        const name = typeof row["name"] === "string" ? row["name"] : slug;
        const price = Number(row["price"]);
        const quantity = Number(row["quantity"]);
        if (!slug || !Number.isFinite(price) || !Number.isFinite(quantity)) return [];
        const edition = typeof row["edition"] === "string" ? row["edition"] : "";
        return [edition ? { slug, name, price, quantity, edition } : { slug, name, price, quantity }];
      })
    : [];
  return {
    orderId: text("orderId") || id,
    customer: {
      customerName: text("customerName"),
      email: text("email"),
      phone: text("phone"),
      address: text("address"),
      city: text("city"),
      state: text("state"),
      postalCode: text("postalCode"),
    },
    items,
    subtotal: num("subtotal"),
    shipping: num("shipping"),
    total: num("total"),
    status: text("status") || "order_placed",
    createdAt: text("createdAt"),
    paymentStatus: text("paymentStatus") || "unpaid",
    fulfillment: text("fulfillment") || "pending",
    discount: num("discount"),
  };
}

export async function saveOrder(priced: PricedOrder): Promise<Order> {
  const store = db();
  const createdAt = new Date().toISOString();
  const year = new Date().getFullYear();
  const counterRef = doc(store, "counters", "orders");
  try {
    const orderId = await runTransaction(store, async (tx) => {
      const snap = await tx.get(counterRef);
      const current = snap.exists() ? Number(snap.data()["next"]) : 0;
      const next = (Number.isFinite(current) ? current : 0) + 1;
      if (next > 9999) throw new Error("We couldn't place your order. Please try again.");
      const id = `HS-${year}-${String(next).padStart(4, "0")}`;
      const c = priced.customer;
      tx.set(counterRef, { next });
      tx.set(doc(store, "orders", id), {
        orderId: id,
        customerName: c.customerName,
        email: c.email,
        phone: c.phone,
        address: c.address,
        city: c.city,
        state: c.state,
        postalCode: c.postalCode,
        items: priced.items,
        // Lets the studio query "every November Mail Club order" directly.
        editions: [...new Set(priced.items.flatMap((item) => item.edition ? [item.edition] : []))],
        subtotal: priced.subtotal,
        shipping: priced.shipping,
        total: priced.total,
        status: "order_placed",
        paymentStatus: "unpaid",
        fulfillment: "pending",
        discount: priced.discount ?? 0,
        createdAt,
      });
      return id;
    });
    noteCustomer(priced.customer.email).catch(() => undefined);
    return { ...priced, orderId, status: "order_placed", paymentStatus: "unpaid", fulfillment: "pending", createdAt };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("We couldn't place")) throw error;
    throw blocked(error, "We couldn't place your order. Please try again.");
  }
}

export async function listOrdersByEmail(email: string): Promise<SavedOrder[]> {
  const store = db();
  try {
    const snap = await getDocs(query(collection(store, "orders"), where("email", "==", email.trim().toLowerCase())));
    return snap.docs
      .map((item) => asOrder(item.data(), item.id))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  } catch (error) {
    throw blocked(error, "We couldn't load your orders.");
  }
}

export async function listAllOrders(): Promise<SavedOrder[]> {
  const store = db();
  try {
    const snap = await getDocs(collection(store, "orders"));
    return snap.docs
      .map((item) => asOrder(item.data(), item.id))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  } catch (error) {
    throw blocked(error, "We couldn't load orders.");
  }
}

export async function confirmOrder(orderId: string) {
  if (!/^HS-\d{4}-\d{4}$/.test(orderId)) throw new Error("That order could not be found.");
  const store = db();
  try {
    await runTransaction(store, async (tx) => {
      const orderRef = doc(store, "orders", orderId);
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists()) throw new Error("That order could not be found.");
      const data = orderSnap.data();
      if (data["status"] === "order_confirmed") return;
      if (data["status"] === "order_cancelled") throw new Error("That order was cancelled.");
      const items = Array.isArray(data["items"]) ? data["items"] : [];
      const nextStock: { slug: string; stock: number }[] = [];
      for (const item of items) {
        if (!item || typeof item !== "object") continue;
        const row = item as Record<string, unknown>;
        const slug = typeof row["slug"] === "string" ? row["slug"] : "";
        const quantity = Math.floor(Number(row["quantity"]));
        if (!slug || !Number.isFinite(quantity) || quantity < 1) continue;
        // The count the studio set in Admin → Stock, or the catalogue's starting count if never set.
        const listSnap = await tx.get(doc(store, "listings", slug));
        const saved = listSnap.exists() ? Number(listSnap.data()["stock"]) : NaN;
        const left = Number.isFinite(saved) ? Math.floor(saved) : PRODUCTS.find((p) => p.slug === slug)?.stock ?? 0;
        const name = typeof row["name"] === "string" ? row["name"] : slug;
        if (left < quantity) throw new Error(`Not enough of "${name}" left to confirm this order.`);
        nextStock.push({ slug, stock: left - quantity });
      }
      for (const row of nextStock) tx.set(doc(store, "listings", row.slug), { stock: row.stock }, { merge: true });
      tx.update(orderRef, { status: "order_confirmed" });
    });
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith("Not enough") || error.message.startsWith("That order"))) throw error;
    throw blocked(error, "We couldn't confirm that order.");
  }
  return { orderId, status: "order_confirmed" };
}

async function patchOrder(orderId: string, patch: Record<string, string>) {
  if (!/^HS-\d{4}-\d{4}$/.test(orderId)) throw new Error("That order could not be found.");
  try {
    await updateDoc(doc(db(), "orders", orderId), patch);
  } catch (error) {
    throw blocked(error, "We couldn't update that order.");
  }
}

export function markPaid(orderId: string) {
  return patchOrder(orderId, { paymentStatus: "paid" });
}

export function markShipped(orderId: string) {
  return patchOrder(orderId, { fulfillment: "shipped" });
}

// Only unpaid, unconfirmed orders can be cancelled, so no stock has been taken and no refund is owed.
export function cancelOrder(orderId: string) {
  return patchOrder(orderId, { status: "order_cancelled" });
}
