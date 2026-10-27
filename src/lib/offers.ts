import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { firebaseDb, firebaseDbAnywhere } from "./firebase";

export const SHIPPING_RUPEES = 90;

export interface Offer {
  code: string;
  label: string;
  description: string;
  active: boolean;
  /** Percent off the pieces. Ignored when flatOff > 0. 0% with no flatOff removes shipping. */
  percent: number;
  /** Fixed ₹ off the pieces. When set, percent is ignored for pricing. */
  flatOff: number;
  minOrder: number;
  customersOnly: boolean;
}

export type QuoteReason = "ok" | "empty" | "invalid" | "min_order" | "customers_only" | "inactive";

export interface QuoteResult {
  ok: boolean;
  shipping: number;
  discount: number;
  reason: QuoteReason;
  minOrder?: number;
  label?: string;
  need?: number;
}

function asOffer(id: string, data: Record<string, unknown>): Offer | null {
  const code = (typeof data["code"] === "string" ? data["code"] : id).trim().toUpperCase();
  if (!code) return null;
  const percent = Number(data["percent"]);
  const flatOff = Number(data["flatOff"]);
  const minOrder = Number(data["minOrder"]);
  return {
    code,
    label: typeof data["label"] === "string" ? data["label"] : code,
    description: typeof data["description"] === "string" ? data["description"] : "",
    active: data["active"] !== false,
    percent: Number.isFinite(percent) ? Math.min(100, Math.max(0, Math.floor(percent))) : 0,
    flatOff: Number.isFinite(flatOff) ? Math.max(0, Math.floor(flatOff)) : 0,
    minOrder: Number.isFinite(minOrder) ? Math.max(0, Math.floor(minOrder)) : 0,
    customersOnly: data["customersOnly"] === true,
  };
}

async function readOffers(server: boolean): Promise<Offer[]> {
  const store = server ? firebaseDbAnywhere() : firebaseDb();
  if (!store) return [];
  const snap = await getDocs(collection(store, "offers"));
  return snap.docs.flatMap((item) => {
    const offer = asOffer(item.id, item.data());
    return offer ? [offer] : [];
  });
}

export function listOffers() {
  return readOffers(false);
}

export function listOffersServer() {
  return readOffers(true).catch(() => [] as Offer[]);
}

export function quote(subtotal: number, promo: string | undefined, offers: Offer[], activeCustomer = true): QuoteResult {
  const code = (promo ?? "").trim().toUpperCase();
  if (!code) return { ok: false, shipping: SHIPPING_RUPEES, discount: 0, reason: "empty" };

  const any = offers.find((item) => item.code === code);
  if (!any) return { ok: false, shipping: SHIPPING_RUPEES, discount: 0, reason: "invalid" };
  if (!any.active) return { ok: false, shipping: SHIPPING_RUPEES, discount: 0, reason: "inactive", label: any.label };
  if (any.customersOnly && !activeCustomer) {
    return { ok: false, shipping: SHIPPING_RUPEES, discount: 0, reason: "customers_only", label: any.label };
  }
  if (any.minOrder > 0 && subtotal < any.minOrder) {
    return {
      ok: false,
      shipping: SHIPPING_RUPEES,
      discount: 0,
      reason: "min_order",
      minOrder: any.minOrder,
      label: any.label,
      need: any.minOrder - subtotal,
    };
  }
  if (any.flatOff > 0) {
    return {
      ok: true,
      shipping: SHIPPING_RUPEES,
      discount: Math.min(any.flatOff, subtotal),
      reason: "ok",
      label: any.label,
      minOrder: any.minOrder || undefined,
    };
  }
  const discount = Math.round(subtotal * any.percent / 100);
  return {
    ok: true,
    shipping: any.percent === 0 ? 0 : SHIPPING_RUPEES,
    discount,
    reason: "ok",
    label: any.label,
    minOrder: any.minOrder || undefined,
  };
}

/** Turn a ₹-off amount into a percent of a reference order (usually the minimum). */
export function percentFromFlat(flatOff: number, ofOrder: number) {
  const flat = Math.max(0, Math.floor(Number(flatOff) || 0));
  const base = Math.max(0, Math.floor(Number(ofOrder) || 0));
  if (flat <= 0 || base <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((flat / base) * 100)));
}

type SaveOfferInput = Omit<Offer, "active" | "description" | "flatOff" | "percent"> & {
  active?: boolean;
  description?: string;
  percent?: number;
  flatOff?: number;
};

export async function saveOffer(offer: SaveOfferInput) {
  const store = firebaseDb();
  if (!store) throw new Error("Firebase is not configured.");
  const code = offer.code.trim().toUpperCase();
  if (!/^[A-Z0-9]{4,20}$/.test(code)) throw new Error("Use 4–20 letters or numbers for the code.");
  const flatOff = Math.max(0, Math.floor(Number(offer.flatOff) || 0));
  const percent = flatOff > 0 ? 0 : Math.min(100, Math.max(0, Math.floor(Number(offer.percent) || 0)));
  const minOrder = Math.max(0, Math.floor(Number(offer.minOrder) || 0));
  const description = (offer.description ?? "").trim().slice(0, 200);
  await setDoc(doc(store, "offers", code), {
    code,
    label: offer.label.trim() || code,
    description,
    active: offer.active !== false,
    percent,
    flatOff,
    minOrder,
    customersOnly: offer.customersOnly === true,
  });
}

export async function removeOffer(code: string) {
  const store = firebaseDb();
  if (!store) throw new Error("Firebase is not configured.");
  await deleteDoc(doc(store, "offers", code.trim().toUpperCase()));
}
