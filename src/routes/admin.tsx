import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { OrderList } from "@/components/site/OrderList";
import { isAdminEmail } from "@/lib/admins";
import { useAuth } from "@/lib/auth";
import { confirmOrder, listAllOrders } from "@/lib/orders-db";
import type { SavedOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Orders — Halfस्केच" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { ready, user } = useAuth();
  const [orders, setOrders] = useState<SavedOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const email = user?.email ?? "";
  const admin = isAdminEmail(email);

  useEffect(() => {
    if (!ready || !user || !admin) return;
    let cancel = false;
    listAllOrders()
      .then((rows) => { if (!cancel) setOrders(rows); })
      .catch((err: unknown) => { if (!cancel) setError(err instanceof Error ? err.message : "We couldn't load orders."); });
    return () => { cancel = true; };
  }, [ready, user, admin]);

  async function onConfirm(orderId: string) {
    if (!user) return;
    setConfirmingId(orderId);
    setError(null);
    try {
      await confirmOrder(orderId);
      setOrders((prev) => prev?.map((order) => order.orderId === orderId ? { ...order, status: "order_confirmed" } : order) ?? prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't confirm that order.");
    } finally {
      setConfirmingId(null);
    }
  }

  if (!ready) return <div className="min-h-[50vh]" />;

  return (
    <div className="mx-auto max-w-[1000px] px-5 pt-12 md:px-10">
      <p className="font-hand text-3xl text-pink">the studio desk</p>
      <h1 className="display mt-3">Orders</h1>
      {!user || !admin ? (
        <div className="mt-12 max-w-md">
          <p className="text-muted-foreground">This page is only for the studio.</p>
          {!user ? <Link to="/sign-in" className="btn-line mt-8">Sign in</Link> : null}
        </div>
      ) : (
        <>
          {error ? <p className="mt-8 text-pink">{error}</p> : null}
          {orders ? <OrderList orders={orders} onConfirm={onConfirm} confirmingId={confirmingId} /> : !error ? <p className="mt-10 text-muted-foreground">Loading orders…</p> : null}
        </>
      )}
    </div>
  );
}
