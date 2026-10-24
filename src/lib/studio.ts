import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc, type Unsubscribe } from "firebase/firestore";
import { firebaseDb, firebaseDbAnywhere } from "./firebase";
import {
  catalogState,
  installListings,
  overlay,
  PRODUCTS,
  subscribeCatalog,
  type Category,
  type Listing,
  type Product,
} from "./products";

export const COLLECTIONS = ["Everyday", "Monsoon", "Winter", "Gift"];

function store(server = false) {
  return server ? firebaseDbAnywhere() : firebaseDb() ?? firebaseDbAnywhere();
}

function num(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.floor(n) : undefined;
}

function asListing(id: string, data: Record<string, unknown>): Listing {
  const row: Listing = { slug: typeof data["slug"] === "string" ? data["slug"] : id };
  const text = (key: string) => typeof data[key] === "string" ? data[key] : "";
  if (data["custom"] === true) row.custom = true;
  if (text("name")) row.name = text("name");
  if (text("description")) row.description = text("description");
  const price = num(data["price"]);
  const mrp = num(data["mrp"]);
  const cost = num(data["cost"]);
  const stock = num(data["stock"]);
  if (price !== undefined) row.price = price;
  if (mrp !== undefined) row.mrp = mrp;
  if (cost !== undefined) row.cost = cost;
  if (stock !== undefined) row.stock = stock;
  if (data["soldOut"] === true) row.soldOut = true;
  const category = data["category"];
  if (category === "bookmarks" || category === "postcards" || category === "calendars" || category === "mail-club") row.category = category;
  if (text("collection")) row.collection = text("collection");
  if (text("variants")) row.variants = text("variants");
  if (text("image")) row.image = text("image");
  if (Array.isArray(data["tiers"])) row.tiers = data["tiers"].map(Number).filter((n) => Number.isFinite(n));
  if (text("createdAt")) row.createdAt = text("createdAt");
  return row;
}

export async function listListings() {
  const db = store();
  if (!db) return [];
  const snap = await getDocs(collection(db, "listings"));
  return snap.docs.map((item) => asListing(item.id, item.data()));
}

/** Live listings so Stock counts move as soon as Confirm stock / Mark paid writes Firestore. */
export function watchListings(onError?: (error: Error) => void): Unsubscribe | null {
  const db = store();
  if (!db) {
    installListings([]);
    return null;
  }
  return onSnapshot(
    collection(db, "listings"),
    (snap) => installListings(snap.docs.map((item) => asListing(item.id, item.data()))),
    (error) => {
      installListings([]);
      onError?.(error instanceof Error ? error : new Error("We couldn't load stock."));
    },
  );
}

export async function saveListing(row: Listing) {
  const db = store();
  if (!db) throw new Error("Firebase is not configured.");
  await setDoc(doc(db, "listings", row.slug), { ...row, slug: row.slug }, { merge: true });
  // Snapshot watcher (when mounted) refreshes the catalogue; this covers one-shot callers too.
  installListings(await listListings());
}

export async function serverProduct(slug: string): Promise<Product | undefined> {
  const db = store(true);
  let row: Listing | undefined;
  if (db) {
    try {
      const snap = await getDoc(doc(db, "listings", slug));
      if (snap.exists()) row = asListing(snap.id, snap.data());
    } catch {
      row = undefined;
    }
  }
  if (row?.custom) {
    const blank: Product = {
      id: slug, name: row.name || "Untitled piece", slug, category: (row.category ?? "bookmarks") as Category,
      price: row.price ?? 0, description: row.description || "", story: row.description || "", details: [],
      images: [row.image || "/halfsketch-logo.png"], available: true, stock: row.stock ?? 1, status: "new",
      createdAt: row.createdAt || "",
    };
    return overlay(blank, row);
  }
  const base = PRODUCTS.find((p) => p.slug === slug);
  return base ? overlay(base, row) : undefined;
}

let listingsWatchStarted = false;

export function useCatalog() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const stop = subscribeCatalog(() => setTick((n) => n + 1));
    // One long-lived snapshot for the whole app — same idea as the old one-shot load.
    if (!listingsWatchStarted) {
      listingsWatchStarted = true;
      watchListings();
    }
    return stop;
  }, []);
  return catalogState();
}

export interface Ticket {
  id: string;
  title: string;
  name: string;
  email: string;
  message: string;
  orderId: string;
  status: "open" | "pending" | "resolved";
  tags: string[];
  createdAt: string;
}

function tagsFor(message: string) {
  const text = message.toLowerCase();
  const tags: string[] = [];
  if (/late|delay|urgent|days|asap/.test(text)) tags.push("High");
  if (/not receive|didn't|didnt|did not|missing|wrong|bad|never/.test(text)) tags.push("Negative");
  if (/ship|deliver|order|receive|recieve|parcel/.test(text)) tags.push("Shipping");
  return tags.length ? tags : ["General"];
}

export function suggestReply(ticket: Pick<Ticket, "orderId" | "message">) {
  const order = ticket.orderId || "your order";
  return `I'd be happy to help you with ${order}. Since we ship within India in 3–5 business days, it's possible that your order is on its way. Please sign in and check the live status in My Orders, or refer to your WhatsApp order confirmation for updates. If you have any further concerns, could you please reply with your WhatsApp order details?`;
}

function asTicket(id: string, data: Record<string, unknown>): Ticket {
  const status = data["status"];
  return {
    id,
    title: typeof data["title"] === "string" ? data["title"] : "Help with an order",
    name: typeof data["name"] === "string" ? data["name"] : "",
    email: typeof data["email"] === "string" ? data["email"] : "",
    message: typeof data["message"] === "string" ? data["message"] : "",
    orderId: typeof data["orderId"] === "string" ? data["orderId"] : "",
    status: status === "pending" || status === "resolved" ? status : "open",
    tags: Array.isArray(data["tags"]) ? data["tags"].filter((tag) => typeof tag === "string") : [],
    createdAt: typeof data["createdAt"] === "string" ? data["createdAt"] : "",
  };
}

export async function listTickets() {
  const db = store();
  if (!db) return [];
  const snap = await getDocs(collection(db, "tickets"));
  return snap.docs
    .map((item) => asTicket(item.id, item.data()))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function addTicket(input: { name: string; email: string; message: string; orderId?: string }) {
  const db = store();
  if (!db) throw new Error("Firebase is not configured.");
  const orderId = (input.orderId ?? "").trim();
  const tags = tagsFor(input.message);
  await addDoc(collection(db, "tickets"), {
    title: orderId ? `Help with order ${orderId}` : "Help with an order",
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    message: input.message.trim(),
    orderId,
    status: "open",
    tags,
    createdAt: new Date().toISOString(),
  });
}

export async function setTicketStatus(id: string, status: Ticket["status"]) {
  const db = store();
  if (!db) throw new Error("Firebase is not configured.");
  await updateDoc(doc(db, "tickets", id), { status });
}

export interface Review {
  id: string;
  slug: string;
  name: string;
  stars: number;
  text: string;
  createdAt: string;
}

export async function listReviews() {
  const db = store();
  if (!db) return [];
  const snap = await getDocs(collection(db, "reviews"));
  return snap.docs.map((item) => {
    const data = item.data();
    return {
      id: item.id,
      slug: typeof data["slug"] === "string" ? data["slug"] : "",
      name: typeof data["name"] === "string" ? data["name"] : "Customer",
      stars: Math.min(5, Math.max(1, Number(data["stars"]) || 5)),
      text: typeof data["text"] === "string" ? data["text"] : "",
      createdAt: typeof data["createdAt"] === "string" ? data["createdAt"] : "",
    } satisfies Review;
  }).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function addReview(row: Omit<Review, "id" | "createdAt">) {
  const db = store();
  if (!db) throw new Error("Firebase is not configured.");
  await addDoc(collection(db, "reviews"), { ...row, name: row.name.trim(), text: row.text.trim(), createdAt: new Date().toISOString() });
}

export async function removeReview(id: string) {
  const db = store();
  if (!db) throw new Error("Firebase is not configured.");
  await deleteDoc(doc(db, "reviews", id));
}

export async function hasOrdered(email: string) {
  const db = store(true);
  if (!db || !email.trim()) return false;
  try {
    const snap = await getDoc(doc(db, "customers", email.trim().toLowerCase()));
    return snap.exists() && Number(snap.data()["orders"]) >= 1;
  } catch {
    return false;
  }
}

export async function noteCustomer(email: string) {
  const db = store();
  if (!db) return;
  const id = email.trim().toLowerCase();
  const ref = doc(db, "customers", id);
  const snap = await getDoc(ref);
  const orders = snap.exists() ? Number(snap.data()["orders"]) || 0 : 0;
  await setDoc(ref, { email: id, orders: orders + 1 });
}

export async function compressImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const url = canvas.toDataURL("image/jpeg", 0.72);
  if (url.length > 400_000) throw new Error("That photo is still too big. Paste an image path instead.");
  return url;
}
