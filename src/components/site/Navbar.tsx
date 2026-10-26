import { Link } from "@tanstack/react-router";
import { BookHeart, Mail, Palette, ShoppingBag } from "lucide-react";
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";
import { isAdminEmail } from "@/lib/admins";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { INSTAGRAM_URL } from "@/lib/products";


const tabs = [
  { to: "/shop", label: "Collections", Icon: Palette },
  { to: "/mail-club", label: "Mail Club", Icon: Mail },
  { to: "/story", label: "Our Story", Icon: BookHeart },
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

const action = "link-sketch whitespace-nowrap py-2 text-[0.72rem] font-medium uppercase tracking-[0.12em] md:text-[0.7rem] md:tracking-[0.22em]";

export function Navbar() {
  const { count } = useCart();
  const { user, signOutUser } = useAuth();
  const email = user?.email ?? "";
  const admin = isAdminEmail(email);
  return (
    <header className="sticky top-0 z-40 border-b border-foreground/20 bg-paper/95 backdrop-blur-sm">
      <nav aria-label="Main" className="mx-auto flex max-w-[1400px] flex-nowrap items-center px-4 py-2 md:gap-10 md:px-10 md:py-2.5">
        <Link to="/" aria-label="Halfस्केच home">
          <Logo className="h-8 md:h-7" />
        </Link>
        <ul className="hidden items-center gap-9 md:ml-auto md:flex">
          {tabs.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="link-sketch inline-block whitespace-nowrap py-2 text-[0.6rem] uppercase tracking-[0.16em] md:text-[0.68rem] md:tracking-[0.22em]" activeProps={{ className: "text-pink" }}>{l.label}</Link>
            </li>
          ))}
          <li>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram" className="hidden size-8 place-items-center md:grid">
              <InstagramIcon className="size-5" />
            </a>
          </li>
        </ul>
        <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 md:ml-0 md:flex-nowrap md:gap-7">
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
          <Link to="/cart" className="inline-flex min-h-10 items-center gap-0.5 pl-2" aria-label={`Cart, ${count} items`}>
            <ShoppingBag className="size-5" />
            <span className="font-mono text-sm text-pink">({count})</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}


/** Phone-only navigation, pinned to the bottom of the screen. Pages with their own bottom bar sit above it (--tabbar). */
export function MobileTabBar() {
  return (
    <nav aria-label="Site sections" className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground/20 bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden">
      <ul className="grid h-[var(--tabbar)] grid-cols-3">
        {tabs.map(({ to, label, Icon }) => (
          <li key={to}>
            <Link to={to} className="flex h-full flex-col items-center justify-center gap-1 text-[0.58rem] uppercase tracking-[0.14em]" activeProps={{ className: "text-pink" }}>
              <Icon className="size-5" strokeWidth={1.5} aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
