import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  updateDoc,
  where,
} from "firebase/firestore";
import { firebaseAuth, firebaseDb } from "./firebase";
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
        return [{ slug, name, price, quantity }];
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
        subtotal: priced.subtotal,
        shipping: priced.shipping,
        total: priced.total,
        status: "order_placed",
        paymentStatus: "unpaid",
        createdAt,
      });
      return id;
    });
    return { ...priced, orderId, status: "order_placed", createdAt };
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
  try {
    await updateDoc(doc(db(), "orders", orderId), { status: "order_confirmed" });
  } catch (error) {
    throw blocked(error, "We couldn't confirm that order.");
  }
  return { orderId, status: "order_confirmed" };
}
