import { createFileRoute } from "@tanstack/react-router";
import { PersonalCta } from "@/components/site/PersonalCta";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "Our Story — Halfस्केच" },
      { name: "description", content: "Two people, one little idea: the story behind Halfस्केच and its handmade art." },
      { property: "og:title", content: "Our Story — Halfस्केच" },
      { property: "og:description", content: "Two people. One little idea. Why we make things a little unfinished." },
    ],
  }),
  component: Story,
});

function Story() {
  return (
    <>
      <div className="mx-auto max-w-[1400px] px-5 pt-12 md:px-10">
        <h1 className="display max-w-5xl">Two people.<br />One little idea.</h1>
        <div className="mt-16 grid gap-12 md:grid-cols-12">
          <img src="/assets/about_us2.jpeg" alt="Nikhil and Disha" className="w-full bg-paper object-contain md:col-span-8" />
          <p className="font-hand self-end text-3xl leading-tight text-pink md:col-span-4">"it doesn't have to be finished to be finished."</p>
        </div>
        <div className="mt-24 grid gap-10 md:grid-cols-12">
          <p className="eyebrow text-muted-foreground md:col-span-3">The name</p>
          <div className="space-y-6 text-lg leading-relaxed md:col-span-7">
            <p>Halfस्केच — half sketch — came from the pieces we liked most: the ones that stopped a little early. The pencil still showing. The wash that ran off the edge.</p>
            <p>We realised the imperfect parts were exactly what made something feel like it was made for someone. So that's what we make: small, handmade things you can keep, gift, and attach a memory to.</p>
          </div>
        </div>
        <div className="mt-24 grid gap-16 md:grid-cols-2">
          <div className="border-t pt-8">
            <h2 className="heading">Nikhil</h2>
            <p className="font-hand mt-2 text-2xl text-pink">the one with the brush</p>
            <p className="mt-6 text-muted-foreground">Nikhil paints every piece you see here. Bookmarks, postcards, polaroids — each one starts with his pencil and ends when he decides to stop.</p>
          </div>
          <div className="border-t pt-8 md:mt-20">
            <h2 className="heading">Disha</h2>
            <p className="font-hand mt-2 text-2xl text-pink">the one with the ideas</p>
            <p className="mt-6 text-muted-foreground">Disha shapes what Halfस्केच becomes — the ideas, the brand, the planning and sourcing, how each piece is photographed and presented, and every conversation on Instagram.</p>
          </div>
        </div>
      </div>
      <PersonalCta />
    </>
  );
}
