import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/site/Avatar";
import { OrderList } from "@/components/site/OrderList";
import { isAdminEmail } from "@/lib/admins";
import { useAuth } from "@/lib/auth";
import { listOrdersByEmail } from "@/lib/orders-db";
import type { SavedOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My orders — Halfस्केच" },
      { name: "description", content: "Your Halfस्केच orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { ready, user, signOutUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<SavedOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      navigate({ to: "/sign-in" });
      return;
    }
    let cancel = false;
    const email = user.email ?? "";
    listOrdersByEmail(email)
      .then((rows) => { if (!cancel) setOrders(rows); })
      .catch((err: unknown) => { if (!cancel) setError(err instanceof Error ? err.message : "We couldn't load your orders."); });
    return () => { cancel = true; };
  }, [ready, user, navigate]);

  if (!ready || !user) return <div className="min-h-[50vh]" />;

  const email = user.email ?? "";
  return (
    <div className="mx-auto max-w-[1000px] px-5 pt-8 md:px-10 md:pt-12">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar email={email} photoURL={user.photoURL} className="size-14 text-lg" />
          <div>
            <p className="eyebrow text-muted-foreground">Signed in</p>
            <p className="mt-1 text-lg">{email}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          {isAdminEmail(email) ? <Link to="/admin" search={{ tab: "orders" }} className="btn-line">Studio orders</Link> : null}
          {isAdminEmail(email) ? <Link to="/admin" search={{ tab: "stock" }} className="btn-line">Stock</Link> : null}
          <button type="button" className="btn-line" onClick={() => signOutUser()}>Sign out</button>
        </div>
      </div>
      <h1 className="heading mt-10 md:mt-16">My orders</h1>
      {error ? <p className="mt-8 text-pink">{error}</p> : null}
      {orders ? <OrderList orders={orders} /> : !error ? <p className="type mt-10">Loading your orders…</p> : null}
    </div>
  );
}
