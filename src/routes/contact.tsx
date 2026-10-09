import { createFileRoute } from "@tanstack/react-router";
import { INSTAGRAM_URL } from "@/lib/products";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Halfस्केच" },
      { name: "description", content: "Questions, custom pieces or collaborations — reach Halfस्केच on Instagram." },
      { property: "og:title", content: "Contact Halfस्केच" },
      { property: "og:description", content: "Say hello on Instagram for custom pieces, questions and collaborations." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="mx-auto max-w-[1000px] px-5 py-16 md:px-10">
      <h1 className="display">Say hello.</h1>
      <p className="mt-8 max-w-lg text-lg text-muted-foreground">Custom requests, personalised artwork, questions about an order or a collaboration idea — we're happiest talking on Instagram.</p>
      <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="btn-ink mt-10">DM us on Instagram →</a>
      <p className="font-hand mt-12 text-2xl text-pink">we usually reply within a day or two</p>
    </div>
  );
}
