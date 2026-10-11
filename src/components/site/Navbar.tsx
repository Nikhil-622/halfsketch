import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";
import { isAdminEmail } from "@/lib/admins";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { INSTAGRAM_URL } from "@/lib/products";

const links = [
  { to: "/shop", label: "Shop" },
  { to: "/story", label: "Our Story" },
] as const;

function InstagramIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

const action = "link-sketch text-[0.58rem] font-medium uppercase tracking-[0.08em] md:text-[0.7rem] md:tracking-[0.22em]";

export function Navbar() {
  const { count } = useCart();
  const { user, signOutUser } = useAuth();
  const email = user?.email ?? "";
  const admin = isAdminEmail(email);
  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm">
      <nav aria-label="Main" className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-y-1 px-4 py-1 md:grid md:grid-cols-[1fr_auto_1fr] md:px-10 md:py-1.5">
        <Link to="/" aria-label="Halfस्केच home" className="justify-self-start">
          <Logo className="h-6 md:h-7" />
        </Link>
        <ul className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="eyebrow link-sketch pb-1" activeProps={{ className: "text-pink" }}>{l.label}</Link>
            </li>
          ))}
          <li>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid size-8 place-items-center">
              <InstagramIcon className="size-5" />
            </a>
          </li>
        </ul>
        <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-x-2 gap-y-1 md:col-start-3 md:ml-0 md:flex-nowrap md:gap-7">
          {user ? (
            <>
              <Link to="/account" className="grid place-items-center" aria-label="Your profile">
                <Avatar email={email} photoURL={user.photoURL} className="size-6 text-[0.6rem] md:size-8 md:text-xs" />
              </Link>
              {admin ? <Link to="/admin" search={{ tab: "orders" }} className={action}>Orders</Link> : null}
              <button type="button" className={action} onClick={() => signOutUser()}>Sign out</button>
            </>
          ) : (
            <Link to="/sign-in" className={action}>Sign in</Link>
          )}
          <Link to="/cart" className="inline-flex items-center gap-0.5" aria-label={`Cart, ${count} items`}>
            <ShoppingBag className="size-4 md:size-5" />
            <span className="font-hand text-base text-pink md:text-lg">({count})</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
