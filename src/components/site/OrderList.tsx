import { formatPrice } from "@/lib/products";
import { orderStatusLabel, type SavedOrder } from "@/lib/orders.functions";

function when(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function OrderList({
  orders,
  onConfirm,
  confirmingId,
}: {
  orders: SavedOrder[];
  onConfirm?: (orderId: string) => void;
  confirmingId?: string | null;
}) {
  if (orders.length === 0) {
    return <p className="type mt-10">No orders yet.</p>;
  }
  return (
    <ul className="mt-10 divide-y border-y">
      {orders.map((order) => {
        const confirmed = order.status === "order_confirmed";
        const c = order.customer;
        return (
          <li key={order.orderId} className="grid gap-6 py-6 md:grid-cols-12 md:gap-8 md:py-10">
            <div className="md:col-span-4">
              <p className="accent">{orderStatusLabel(order.status)}</p>
              <p className="eyebrow mt-3">{order.orderId}</p>
              <p className="mt-2 text-sm text-muted-foreground">{when(order.createdAt)}</p>
              {onConfirm && !confirmed ? (
                <button type="button" className="btn-line mt-6" disabled={confirmingId === order.orderId} onClick={() => onConfirm(order.orderId)}>
                  {confirmingId === order.orderId ? "Confirming…" : "Confirm order"}
                </button>
              ) : null}
            </div>
            <div className="md:col-span-4">
              <h2 className="eyebrow">Pieces</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {order.items.map((item) => (
                  <li key={item.slug} className="flex justify-between gap-4">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="tabular-nums">{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex justify-between border-t pt-4 text-sm font-medium">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(order.total)}</span>
              </p>
            </div>
            <address className="text-sm not-italic leading-relaxed text-muted-foreground md:col-span-4">
              <span className="eyebrow mb-4 block text-foreground">Sending to</span>
              {c.customerName}<br />
              {c.email}<br />
              {c.phone}<br />
              {c.address}<br />
              {c.city}, {c.state} {c.postalCode}
            </address>
          </li>
        );
      })}
    </ul>
  );
}
