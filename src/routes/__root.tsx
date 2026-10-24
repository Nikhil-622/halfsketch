import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { useCatalog } from "@/lib/studio";
import { CartDrawer } from "@/components/site/CartDrawer";
import { CartNudge } from "@/components/site/CartNudge";
import { MobileTabBar, Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="display">Page not found</h1>
        <p className="accent mt-2">404</p>
        <p className="type mt-4">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-ink">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="heading">This page didn't load</h1>
        <p className="type mt-4">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-ink"
          >
            Try again
          </button>
          <a
            href="/"
            className="btn-line"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Halfस्केच — Handmade art, bookmarks, postcards & calendars" },
      { name: "description", content: "Handmade little things, painted with feeling and made to be kept. A little unfinished. A lot of you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=Mrs+Saint+Delafield&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// A small pink dab where a mouse clicks — the brush cursor touching paper. Skipped for touch and reduced motion.
function useBrushDabs() {
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const dab = document.createElement("span");
      dab.className = "brush-dab";
      dab.setAttribute("aria-hidden", "true");
      dab.style.left = `${e.clientX}px`;
      dab.style.top = `${e.clientY}px`;
      dab.addEventListener("animationend", () => dab.remove());
      document.body.appendChild(dab);
    };
    addEventListener("pointerdown", onDown);
    return () => removeEventListener("pointerdown", onDown);
  }, []);
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useCatalog();
  useBrushDabs();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <AuthProvider>
        <CartProvider>
          <a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>
          <Navbar />
          <main id="main"><Outlet /></main>
          <Footer />
          <div aria-hidden className="h-[calc(var(--tabbar)+env(safe-area-inset-bottom))] md:hidden" />
          <MobileTabBar />
          <CartNudge />
          <CartDrawer />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
