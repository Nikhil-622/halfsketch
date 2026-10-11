import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { firebaseDb, firebaseDbAnywhere } from "./firebase";

export const SHIPPING_RUPEES = 90;
export const PROMO_CODE = "HALFSKETCH06";

export interface Offer {
  code: string;
  label: string;
  active: boolean;
  percent: number;
  minOrder: number;
  customersOnly: boolean;
}

function asOffer(id: string, data: Record<string, unknown>): Offer | null {
  const code = (typeof data["code"] === "string" ? data["code"] : id).trim().toUpperCase();
  if (!code) return null;
  const percent = Number(data["percent"]);
  const minOrder = Number(data["minOrder"]);
  return {
    code,
    label: typeof data["label"] === "string" ? data["label"] : code,
    active: data["active"] !== false,
    percent: Number.isFinite(percent) ? Math.min(100, Math.max(0, Math.floor(percent))) : 0,
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

export function quote(subtotal: number, promo: string | undefined, offers: Offer[], activeCustomer = true) {
  const code = (promo ?? "").trim().toUpperCase();
  if (!code) return { ok: false, shipping: SHIPPING_RUPEES, discount: 0 };
  if (code === PROMO_CODE) return { ok: true, shipping: 0, discount: 0 };
  const offer = offers.find((item) => item.active && item.code === code);
  if (!offer) return { ok: false, shipping: SHIPPING_RUPEES, discount: 0 };
  if (offer.customersOnly && !activeCustomer) return { ok: false, shipping: SHIPPING_RUPEES, discount: 0 };
  if (offer.minOrder > 0 && subtotal < offer.minOrder) return { ok: false, shipping: SHIPPING_RUPEES, discount: 0 };
  const discount = Math.round(subtotal * offer.percent / 100);
  return { ok: true, shipping: offer.percent === 0 ? 0 : SHIPPING_RUPEES, discount };
}

export async function saveOffer(offer: Omit<Offer, "active"> & { active?: boolean }) {
  const store = firebaseDb();
  if (!store) throw new Error("Firebase is not configured.");
  const code = offer.code.trim().toUpperCase();
  if (!/^[A-Z0-9]{4,20}$/.test(code)) throw new Error("Use 4–20 letters or numbers for the code.");
  const percent = Math.min(100, Math.max(0, Math.floor(Number(offer.percent) || 0)));
  const minOrder = Math.max(0, Math.floor(Number(offer.minOrder) || 0));
  await setDoc(doc(store, "offers", code), {
    code,
    label: offer.label.trim() || code,
    active: offer.active !== false,
    percent,
    minOrder,
    customersOnly: offer.customersOnly === true,
  });
}

export async function removeOffer(code: string) {
  const store = firebaseDb();
  if (!store) throw new Error("Firebase is not configured.");
  await deleteDoc(doc(store, "offers", code.trim().toUpperCase()));
}
