import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/products";
import type { Order } from "@/lib/orders.functions";

export const Route = createFileRoute("/order-confirmation")({
  head: () => ({
    meta: [
      { title: "Order placed — Halfस्केच" },
      { name: "description", content: "Your Halfस्केच order has been placed." },
      { property: "og:title", content: "Order placed — Halfस्केच" },
      { property: "og:description", content: "Your little piece is officially on its way." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Confirmation,
});

function Confirmation() {
  const [order, setOrder] = useState<Order | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const s = sessionStorage.getItem("halfsketch-last-order"); if (s) setOrder(JSON.parse(s)); } catch { /* ignore */ }
    setReady(true);
  }, []);

  if (!ready) return <div className="min-h-[50vh]" />;
  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="heading">No recent order found.</h1>
        <Link to="/shop" className="btn-ink mt-8">Continue shopping</Link>
      </div>
    );
  }
  const c = order.customer;
  return (
    <div className="mx-auto max-w-[900px] px-5 pt-16 md:px-10">
      <p className="font-hand text-3xl text-pink">thank you, {c.customerName.split(" ")[0]} ♡</p>
      <h1 className="display mt-4">Order placed</h1>
      <p className="mt-8 eyebrow">Order <span className="text-pink">{order.orderId}</span></p>
      <p className="mt-4 max-w-lg text-muted-foreground">We've received this order. Once the studio checks your payment, it will show as Order confirmed.</p>

      <div className="mt-14 grid gap-12 border-t pt-10 md:grid-cols-2">
        <section>
          <h2 className="eyebrow">Summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {order.items.map((i) => (
              <li key={i.slug} className="flex justify-between"><span>{i.name} × {i.quantity}</span><span className="tabular-nums">{formatPrice(i.price * i.quantity)}</span></li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t pt-4 text-sm"><span>Shipping</span><span className="tabular-nums">{formatPrice(order.shipping)}</span></p>
          <p className="mt-4 flex justify-between font-medium"><span>Total</span><span className="tabular-nums">{formatPrice(order.total)}</span></p>
        </section>
        <section className="text-sm">
          <h2 className="eyebrow">Sending to</h2>
          <address className="mt-4 not-italic leading-relaxed text-muted-foreground">
            {c.customerName}<br />{c.address}<br />{c.city}, {c.state} {c.postalCode}<br />{c.phone}
          </address>
        </section>
      </div>
      <Link to="/shop" className="btn-ink mt-14">Continue shopping</Link>
    </div>
  );
}
