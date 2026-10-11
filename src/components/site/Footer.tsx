import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { INSTAGRAM_URL } from "@/lib/products";

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-paper">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:px-10">
        <div>
          <Logo withTagline className="h-20 md:h-36" />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">Handmade little things, painted with feeling and made to be kept.</p>
        </div>
        <ul className="space-y-3 text-sm">
          <li><Link to="/shop" className="link-sketch">Shop</Link></li>
          <li><Link to="/story" className="link-sketch">Our Story</Link></li>
          <li><Link to="/contact" className="link-sketch">Contact</Link></li>
        </ul>
        <div className="text-sm">
          <p className="eyebrow mb-3 text-muted-foreground">Say hello</p>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="link-sketch">halfsketch.in</a>
          <p className="font-hand mt-6 text-2xl text-pink">made by hand, in small batches</p>
        </div>
      </div>
      <p className="mx-auto max-w-[1400px] px-5 pb-8 text-xs text-muted-foreground md:px-10">© {new Date().getFullYear()} Halfस्केच</p>
    </footer>
  );
}
