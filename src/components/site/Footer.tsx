import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { INSTAGRAM_URL } from "@/lib/products";

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-paper">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-10 md:gap-12 md:py-16 md:grid-cols-[1.4fr_1fr_1fr] md:px-10">
        <div>
          <Logo withTagline className="h-20 md:h-36" />
          <p className="type mt-4 max-w-xs">Handmade little things, painted with feeling and made to be kept.</p>
        </div>
        <ul className="space-y-1 text-sm md:space-y-3">
          <li><Link to="/shop" className="link-sketch inline-block py-1.5">Shop</Link></li>
          <li><Link to="/story" className="link-sketch inline-block py-1.5">Our Story</Link></li>
          <li><Link to="/contact" className="link-sketch inline-block py-1.5">Contact</Link></li>
        </ul>
        <div className="text-sm">
          <p className="eyebrow mb-3 text-muted-foreground">Say hello</p>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="link-sketch">halfsketch.in</a>
          <p className="accent mt-6">made by hand, in small batches</p>
        </div>
      </div>
      <p className="mx-auto max-w-[1400px] px-5 pb-8 text-xs text-muted-foreground md:px-10">© {new Date().getFullYear()} Halfस्केच</p>
    </footer>
  );
}
