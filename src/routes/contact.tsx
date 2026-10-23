import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { INSTAGRAM_URL } from "@/lib/products";
import { addTicket } from "@/lib/studio";

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
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setNote("");
    try {
      await addTicket({
        name: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        orderId: String(data.get("orderId") || ""),
        message: String(data.get("message") || ""),
      });
      e.currentTarget.reset();
      setNote("Sent. The studio will see it on the support desk.");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "We couldn't send that.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1000px] px-5 py-8 md:px-10 md:py-16">
      <h1 className="display">Say hello.</h1>
      <p className="type mt-6 max-w-lg md:mt-8">Custom requests, personalised artwork, questions about an order or a collaboration idea — we're happiest talking on Instagram. You can also leave a note here.</p>
      <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="btn-ink mt-10">DM us on Instagram →</a>
      <form onSubmit={onSubmit} className="mt-12 grid max-w-lg gap-4">
        <input name="name" required placeholder="Name" className="field" />
        <input name="email" type="email" required placeholder="Email" className="field" />
        <input name="orderId" placeholder="Order number, if you have one" className="field" />
        <textarea name="message" required placeholder="How can we help?" className="field min-h-28" />
        <button className="btn-ink justify-center" disabled={busy}>{busy ? "Sending…" : "Send to the studio"}</button>
        {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
      </form>
      <p className="accent mt-12">we usually reply within a day or two</p>
    </div>
  );
}
