import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Logo } from "@/components/site/Logo";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { saveOrder } from "@/lib/orders-db";
import { formatPrice, getProduct } from "@/lib/products";
import {
  createOrder,
  PENDING_CHECKOUT_KEY,
  PROMO_KEY,
  UPI_ID,
  upiPayLink,
  type Customer,
  type Order,
} from "@/lib/orders.functions";

const PLACED_KEY = "halfsketch-payment-order";
const PLACE_LOCK = "halfsketch-payment-lock";
const WHATSAPP_NUMBER = "918451914469";

let placing: Promise<Order> | null = null;

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Payment — Halfस्केच" },
      { name: "description", content: "Pay for your Halfस्केच order with UPI." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaymentPage,
});

function readCustomer(): Customer | null {
  try {
    const raw = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Customer>;
    if (!data.customerName || !data.email || !data.phone || !data.address || !data.city || !data.state || !data.postalCode) return null;
    return {
      customerName: data.customerName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
    };
  } catch {
    return null;
  }
}

function readPlaced(): Order | null {
  try {
    const raw = sessionStorage.getItem(PLACED_KEY);
    if (!raw) return null;
    const order = JSON.parse(raw) as Partial<Order>;
    if (!order.orderId || !order.customer || !Array.isArray(order.items)) return null;
    return order as Order;
  } catch {
    return null;
  }
}

function whatsappHref(order: Order) {
  const pieces = order.items.map((item) => `${item.name} ×${item.quantity} — ${formatPrice(item.price * item.quantity)}`).join(", ");
  const c = order.customer;
  const text = `*New Halfस्केच order ${order.orderId}* • ${pieces} Shipping: ${formatPrice(order.shipping)} *Total: ${formatPrice(order.total)}* Name: ${c.customerName} Phone: ${c.phone} Email: ${c.email} Address: ${c.address}, ${c.city}, ${c.state} ${c.postalCode}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function PaymentPage() {
  const { items, clear, loaded: cartLoaded } = useCart();
  const { user, saveProfile } = useAuth();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [ready, setReady] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [qr, setQr] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const cartKey = items.map((item) => `${item.slug}:${item.quantity}`).join("|");
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    setCustomer(readCustomer());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !cartLoaded) return;
    let cancel = false;
    const saved = readPlaced();
    if (!cartKey) {
      if (saved) setOrder(saved);
      else if (!placing) navigate({ to: "/checkout" });
      return;
    }
    if (!customer) {
      if (!placing) navigate({ to: "/checkout" });
      return;
    }
    if (!placing && sessionStorage.getItem(PLACE_LOCK) === cartKey && !readPlaced()) {
      sessionStorage.removeItem(PLACE_LOCK);
    }
    const snapshot = itemsRef.current.map((item) => ({ slug: item.slug, quantity: item.quantity }));
    const buyer = customer;
    if (sessionStorage.getItem(PLACE_LOCK) !== cartKey) {
      sessionStorage.setItem(PLACE_LOCK, cartKey);
      placing = (async () => {
        try {
          for (const item of snapshot) {
            const product = getProduct(item.slug);
            if (!product?.available || item.quantity > product.stock) {
              throw new Error(product ? `Only ${product.stock} of "${product.name}" left.` : "One of the pieces in your cart is no longer available.");
            }
          }
          const promo = sessionStorage.getItem(PROMO_KEY) ?? "";
          const priced = await createOrder({ data: { customer: buyer, items: snapshot, promo } });
          const placed = await saveOrder(priced);
          if (user) {
            await saveProfile({
              name: buyer.customerName,
              email: buyer.email,
              phone: buyer.phone,
              address: buyer.address,
              city: buyer.city,
              state: buyer.state,
              postalCode: buyer.postalCode,
            });
          }
          sessionStorage.setItem(PLACED_KEY, JSON.stringify(placed));
          sessionStorage.setItem("halfsketch-last-order", JSON.stringify(placed));
          sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
          sessionStorage.removeItem(PROMO_KEY);
          sessionStorage.removeItem(PLACE_LOCK);
          clear();
          return placed;
        } catch (err) {
          sessionStorage.removeItem(PLACE_LOCK);
          placing = null;
          throw err;
        }
      })();
    }
    placing
      ?.then((placed) => { if (!cancel) setOrder(placed); })
      .catch((err: unknown) => {
        if (!cancel) setError(err instanceof Error ? err.message : "Something went wrong.");
      });
    return () => { cancel = true; };
  }, [ready, cartLoaded, customer, cartKey, attempt, user, saveProfile, clear, navigate]);

  useEffect(() => {
    if (!order) return;
    let cancel = false;
    QRCode.toDataURL(upiPayLink(order.total), { margin: 1, width: 320, errorCorrectionLevel: "M" })
      .then((url) => { if (!cancel) setQr(url); })
      .catch(() => { if (!cancel) setError("We couldn't prepare the payment code. Please try again."); });
    return () => { cancel = true; };
  }, [order]);

  async function copyUpi() {
    await navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
  }

  if (error && !order) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <p role="alert" className="text-destructive">{error}</p>
        <button type="button" className="btn-ink mt-8" onClick={() => { setError(null); setAttempt((n) => n + 1); }}>Try again</button>
      </div>
    );
  }

  if (!order) return <div className="min-h-[50vh]" />;

  const payLink = upiPayLink(order.total);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 pt-12 text-center md:pt-16">
      <Logo className="h-12" />
      <h1 className="heading mt-6">Order placed</h1>
      <p className="eyebrow mt-3">Order <span className="text-pink">{order.orderId}</span></p>
      <p className="mt-4 inline-flex items-center gap-2 border border-foreground/30 bg-paper px-4 py-2 text-[0.62rem] uppercase tracking-[0.14em]">
        <Clock className="size-4" aria-hidden="true" />
        Waiting for payment confirmation from store
      </p>
      <p className="type mt-5">
        Please complete the payment below. The studio will confirm your payment and ship your order once it is received.
      </p>
      <div className="mt-8 w-full max-w-[280px] border border-foreground/20 bg-paper px-6 pb-5 pt-6 max-md:order-1">
        {qr ? (
          <img src={qr} alt={`UPI code for ${formatPrice(order.total)}`} className="mx-auto h-56 w-56" />
        ) : (
          <div className="mx-auto grid h-56 w-56 place-items-center text-sm text-muted-foreground">Preparing the code…</div>
        )}
        <p className="mt-3 text-sm text-muted-foreground"><span className="md:hidden">Paying from another phone? </span>Scan with any UPI app</p>
      </div>
      <p className="mt-6 font-mono text-2xl">Pay {formatPrice(order.total)}</p>
      <a href={payLink} className="btn-ink mt-6 w-full">Pay in UPI app</a>
      <a
        href={whatsappHref(order)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-ink mt-3 w-full border-[#22c55e] text-[#15803d] hover:border-[#22c55e] hover:bg-[#22c55e] hover:text-white"
      >
        Send order details on WhatsApp
      </a>
      <div className="type mt-6 w-full border border-foreground/20 bg-paper px-5 py-5">
        <p>Can’t open a UPI app? Pay manually to:</p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-2 text-base text-foreground">
          {UPI_ID}
          <button type="button" className="btn-ink !min-h-0 !px-4 !py-2 !text-[0.6rem]" onClick={copyUpi}>
            {copied ? "Copied" : "Copy"}
          </button>
        </p>
      </div>
    </div>
  );
}
