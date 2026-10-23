import { INSTAGRAM_URL } from "@/lib/products";

export function PersonalCta() {
  return (
    <section className="mx-auto mt-16 max-w-[1400px] px-5 md:px-10">
      <div className="relative bg-foreground px-6 py-12 text-background md:px-16 md:py-28">
        <p className="eyebrow text-pink">Want something personal?</p>
        <h2 className="display mt-6 max-w-4xl">Some memories deserve their own sketch.</h2>
        <p className="type mt-6 max-w-md text-background/70">Custom pieces, gifts, questions and collaborations happen over a conversation — not a form.</p>
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="btn-ink mt-8 w-full sm:w-auto bg-background text-foreground">DM us on Instagram →</a>
        <span className="accent absolute bottom-6 right-8 hidden -rotate-6 md:block">tell us the story ↴</span>
      </div>
    </section>
  );
}
