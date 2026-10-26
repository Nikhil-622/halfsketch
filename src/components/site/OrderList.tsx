import { Link } from "@tanstack/react-router";
import { formatPrice } from "@/lib/products";
import { isMailClub, type SavedOrder } from "@/lib/orders.functions";

function when(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Where an order is, in the order the studio moves it along.
function steps(order: SavedOrder) {
  return [
    { label: "Placed", done: true },
    { label: "Paid", done: order.paymentStatus === "paid" },
    { label: "Confirmed", done: order.status === "order_confirmed" },
    { label: "Shipped", done: order.fulfillment === "shipped" },
  ];
}

export function OrderList({ orders }: { orders: SavedOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="mt-8 border border-dashed border-foreground/30 px-6 py-12 text-center">
        <p className="font-script text-5xl leading-none">Nothing yet</p>
        <p className="type mt-3">Your little parcels will show up here once you place an order.</p>
        <Link to="/shop" className="btn-ink mt-6">Explore the collection</Link>
      </div>
    );
  }
  return (
    <ul className="mt-6 space-y-4">
      {orders.map((order) => {
        const cancelled = order.status === "order_cancelled";
        const list = steps(order);
        const current = list.filter((s) => s.done).at(-1)!.label;
        const c = order.customer;
        return (
          <li key={order.orderId} className="border border-foreground/20 bg-background">
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-foreground/15 bg-paper px-4 py-3">
              <div>
                <p className="eyebrow">{order.orderId}</p>
                <p className="mt-1 text-xs text-muted-foreground">{when(order.createdAt)}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-1.5">
                {isMailClub(order) ? <span className="border border-foreground px-2 py-1 text-[0.6rem] uppercase tracking-[0.12em]">Mail Club</span> : null}
                <span className={`px-2 py-1 text-[0.6rem] uppercase tracking-[0.12em] ${cancelled ? "border border-foreground/30 text-muted-foreground" : "bg-pink/20 text-foreground"}`}>
                  {cancelled ? "Cancelled" : current}
                </span>
              </div>
            </div>

            <div className="px-4 py-4">
              {cancelled ? (
                <p className="type text-muted-foreground">This order was cancelled. If that's a surprise, drop us a note from the Contact page.</p>
              ) : (
                <ol className="grid grid-cols-4" aria-label="Order progress">
                  {list.map((s, n) => (
                    <li key={s.label} className="relative flex flex-col items-center text-center">
                      {n > 0 ? <span aria-hidden className={`absolute right-1/2 top-[7px] h-px w-full ${s.done ? "bg-pink" : "bg-foreground/20"}`} /> : null}
                      <span aria-hidden className={`relative z-10 size-4 rounded-full border ${s.done ? "border-pink bg-pink" : "border-foreground/30 bg-background"}`} />
                      <span className={`mt-2 text-[0.6rem] uppercase tracking-[0.1em] ${s.done ? "text-foreground" : "text-muted-foreground"}`}>
                        {s.label}<span className="sr-only">{s.done ? " — done" : " — not yet"}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}

              <ul className="mt-5 space-y-2 text-sm">
                {order.items.map((item) => (
                  <li key={item.slug} className="flex justify-between gap-4">
                    <span>{item.name} <span className="text-muted-foreground">× {item.quantity}</span></span>
                    <span className="tabular-nums">{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 space-y-1 border-t border-foreground/15 pt-3 text-sm">
                {order.discount ? <p className="flex justify-between text-muted-foreground"><span>Offer</span><span className="tabular-nums">−{formatPrice(order.discount)}</span></p> : null}
                <p className="flex justify-between text-muted-foreground"><span>Shipping</span><span className="tabular-nums">{formatPrice(order.shipping)}</span></p>
                <p className="flex justify-between font-bold"><span>Total</span><span className="tabular-nums">{formatPrice(order.total)}</span></p>
              </div>

              <details className="group mt-4 border-t border-foreground/15 pt-3">
                <summary className="flex cursor-pointer list-none items-center justify-between text-xs uppercase tracking-[0.14em]">
                  Delivery details <span aria-hidden className="text-pink transition group-open:rotate-45">+</span>
                </summary>
                <address className="type mt-3 not-italic">
                  {c.customerName}<br />{c.phone}<br />{c.address}<br />{c.city}, {c.state} {c.postalCode}
                </address>
              </details>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
