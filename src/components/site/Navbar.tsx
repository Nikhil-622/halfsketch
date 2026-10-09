import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
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

export function Navbar() {
  const { count } = useCart();
  const { user, signOutUser } = useAuth();
  const email = user?.email ?? "";
  const admin = isAdminEmail(email);
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm">
      <nav aria-label="Main" className="mx-auto grid max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center px-5 py-3 md:px-10">
        <Link to="/" aria-label="Halfस्केच home" className="justify-self-start" onClick={() => setOpen(false)}>
          <Logo className="h-11 md:h-12" />
        </Link>
        <ul className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="eyebrow link-sketch pb-1" activeProps={{ className: "text-pink" }}>{l.label}</Link>
            </li>
          ))}
          <li><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="eyebrow link-sketch pb-1">Instagram</a></li>
        </ul>
        <div className="col-start-3 flex items-center justify-end gap-7">
          {user ? (
            <>
              <Link to="/account" className="grid size-8 place-items-center" aria-label="Your profile">
                <Avatar email={email} photoURL={user.photoURL} />
              </Link>
              {admin ? <Link to="/admin" className="eyebrow link-sketch">Orders</Link> : null}
              <button type="button" className="eyebrow link-sketch" onClick={() => signOutUser()}>Sign out</button>
            </>
          ) : (
            <Link to="/sign-in" className="eyebrow link-sketch">Sign in</Link>
          )}
          <Link to="/cart" className="eyebrow link-sketch" aria-label={`Cart, ${count} items`}>
            Cart <span className="font-hand text-lg normal-case tracking-normal text-pink">({count})</span>
          </Link>
          <button className="grid size-8 place-items-center md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="border-t px-5 pb-10 pt-6 md:hidden">
          <ul className="space-y-5">
            {[...links, { to: "/contact", label: "Contact" } as const].map((l) => (
              <li key={l.to}><Link to={l.to} onClick={() => setOpen(false)} className="heading block">{l.label}</Link></li>
            ))}
            <li><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="heading block">Instagram</a></li>
            <li>
              {user ? (
                <div className="space-y-5">
                  <Link to="/account" onClick={() => setOpen(false)} aria-label="Your profile" className="inline-flex">
                    <Avatar email={email} photoURL={user.photoURL} className="size-11 text-base" />
                  </Link>
                  {admin ? <Link to="/admin" onClick={() => setOpen(false)} className="heading block">Orders</Link> : null}
                  <button type="button" className="heading block" onClick={() => { setOpen(false); signOutUser(); }}>Sign out</button>
                </div>
              ) : (
                <Link to="/sign-in" onClick={() => setOpen(false)} className="heading block">Sign in</Link>
              )}
            </li>
          </ul>
          <p className="font-hand mt-8 text-2xl text-pink">a little unfinished ✎</p>
        </div>
      )}
    </header>
  );
}
