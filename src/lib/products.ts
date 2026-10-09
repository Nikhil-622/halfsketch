export type Category = "bookmarks" | "postcards" | "polaroids";
export type ProductStatus = "new" | "limited" | "sold-out" | "retired" | "coming-soon" | null;

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;
  price: number; // INR
  description: string;
  story: string;
  feeling?: string;
  details: { label: string; value: string }[];
  images: string[];
  available: boolean;
  stock: number;
  status: ProductStatus;
  sketchNo?: string;
  createdAt: string;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  bookmarks: "Bookmarks",
  postcards: "Postcards",
  polaroids: "Polaroids",
};

export const STATUS_LABEL: Record<Exclude<ProductStatus, null>, string> = {
  new: "New",
  limited: "Limited",
  "sold-out": "Sold out",
  retired: "Retired",
  "coming-soon": "Coming soon",
};

// Product imagery: drop new files in public/assets/, then point a product at /assets/<filename>.
export const IMAGES = {
  bookmark: "/assets/lotus_bookmark.png",
  postcard: "/assets/house_postcard.png",
  polaroid: "/assets/sunset_polaroid.png",
  studio: "/assets/collection_polaroid.png",
};

const paper = (size: string, material = "300gsm cold-press watercolour paper") => [
  { label: "Size", value: size },
  { label: "Paper", value: material },
  { label: "Medium", value: "Watercolour & ink, hand-painted" },
  { label: "Finish", value: "Matte, unvarnished" },
];

const handmade = (type: string) => [
  { label: "Type", value: type },
  { label: "Material", value: "Paper/card — exact type not specified" },
  { label: "Size", value: "Not provided" },
  { label: "Finish", value: "Handmade painted finish" },
  { label: "Handmade", value: "Yes" },
  { label: "Availability", value: "Available" },
];

// To add a product, append an object here — everything else updates automatically.
export const PRODUCTS: Product[] = [
  {
    id: "p1", name: "Birds at Sunset", slug: "birds-at-sunset", category: "bookmarks", price: 179,
    description: "A slim bookmark of birds on a wire, painted into an orange and red sunset.",
    story: "Six little silhouettes, and a sky that couldn't decide between gold and red. We let it keep both.",
    details: paper("5 × 20 cm"), images: ["/assets/sunset_bookmark.png"], available: true, stock: 6, status: "new",
    sketchNo: "001", createdAt: "2026-10-08",
  },
  {
    id: "p14", name: "A Lotus in Bloom", slug: "lotus-in-bloom", category: "bookmarks", price: 179,
    description: "A bookmark of a pink lotus opening on a wash of yellow and rose.",
    story: "A flower that never quite finishes opening — yellow at the top, pink at the stem, and a few leaves that decided to curl.",
    details: paper("5 × 20 cm"), images: ["/assets/lotus_bookmark.png"], available: true, stock: 6, status: "new",
    sketchNo: "013", createdAt: "2026-10-08",
  },
  {
    id: "p13", name: "The Corner Cart", slug: "the-corner-cart", category: "bookmarks", price: 179,
    description: "A bookmark of a blue rickshaw waiting under a shuttered window.",
    story: "Every street has one — a cart that is always a little crooked, and a window that has seen the whole afternoon.",
    details: paper("5 × 20 cm"), images: ["/assets/cart_bookmark.png"], available: true, stock: 6, status: "new",
    sketchNo: "012", createdAt: "2026-10-08",
  },
  {
    id: "p12", name: "Snow at the Window", slug: "snow-at-the-window", category: "bookmarks", price: 179,
    description: "A bookmark of a red house in the snow, under a violet night sky.",
    story: "Painted for the kind of evening that stays indoors — a small house, bare trees, and snow that never quite settles.",
    details: paper("5 × 20 cm"), images: ["/assets/snow_bookmark.png"], available: true, stock: 6, status: "new",
    sketchNo: "011", createdAt: "2026-10-08",
  },
  {
    id: "p2", name: "Somewhere Worth Writing From", slug: "house-in-the-field", category: "postcards", price: 180,
    description: "A little countryside scene that feels like a place you'd want to send a postcard from.",
    story: "Imagine finding a little place far away from the noise.\n\nA small house. Open fields. Flowers moving with the breeze. A sky with enough room to make you forget what time it is.\n\nSomewhere Worth Writing From feels like the kind of place you'd stop at for a while — and before leaving, you'd sit down and write to someone you miss.",
    feeling: "Quiet · nostalgic · comforting · distant · hopeful",
    details: handmade("Handmade Postcard"), images: ["/assets/house_postcard.png"], available: true, stock: 10, status: "new",
    sketchNo: "002", createdAt: "2026-10-08",
  },
  {
    id: "p3", name: "A Little Bouquet of Sunshine", slug: "little-bouquet", category: "polaroids", price: 69,
    description: "A little bundle of flowers, wrapped in the warmth of a golden afternoon.",
    story: "Some gifts don't need a reason.\n\nA few flowers gathered together, tied with a little ribbon, and carried home simply because they made you think of someone.\n\nA Little Bouquet of Sunshine is a tiny reminder of those gestures — the ones that don't need a special occasion to mean something.",
    feeling: "Warm · joyful · thoughtful · sunny · nostalgic",
    details: handmade("Handmade Polaroid"), images: ["/assets/bouquet_polaroid.png"], available: true, stock: 8, status: "new",
    sketchNo: "003", createdAt: "2026-10-08",
  },
  {
    id: "p7", name: "Where the Wildflowers Grow", slug: "cat-in-the-daisies", category: "polaroids", price: 69,
    description: "A quiet little moment in a field of flowers, where everything feels a little softer.",
    story: "Somewhere between the flowers, the grass, and the afternoon light, there's a little place where you can simply be.\n\nWhere the Wildflowers Grow captures that feeling — sitting quietly in a field, surrounded by tiny flowers, with nowhere you need to be. And maybe that's what makes the moment worth keeping.",
    feeling: "Peaceful · dreamy · cozy · gentle · free",
    details: handmade("Handmade art card"), images: ["/assets/cat_polaroid.png"], available: true, stock: 8, status: "new",
    sketchNo: "006", createdAt: "2026-10-08",
  },
  {
    id: "p8", name: "The Field in Bloom", slug: "red-field", category: "polaroids", price: 69,
    description: "A little field of red blooms, caught somewhere between wild and wonderfully alive.",
    story: "There's something about a field in bloom that makes you want to slow down.\n\nNo perfect arrangement. No flowers growing exactly where they're supposed to. Just little pops of red rising through the green, doing their own thing.\n\nThe Field in Bloom is a tiny reminder that beauty doesn't always need to be arranged — sometimes it simply grows where it wants to.",
    feeling: "Free · lively · warm · natural · joyful",
    details: handmade("Handmade Polaroid"), images: ["/assets/roses_polaroid.png"], available: true, stock: 8, status: "new",
    sketchNo: "007", createdAt: "2026-10-08",
  },
  {
    id: "p9", name: "The Beauty of Endings", slug: "beautiful-endings", category: "polaroids", price: 69,
    description: "A little sunset for the endings that deserve to be remembered.",
    story: "Not every ending is something to be sad about.\n\nSometimes an ending is simply the sky changing colour, the day becoming quieter, and a little light reminding you that something beautiful can come after.\n\nThe Beauty of Endings is a tiny reminder to let some things end gently — and to notice the beauty they leave behind.",
    feeling: "Warm · hopeful · nostalgic · reflective · peaceful",
    details: handmade("Handmade Polaroid"), images: ["/assets/sunset_polaroid.png"], available: true, stock: 8, status: "new",
    sketchNo: "008", createdAt: "2026-10-08",
  },
  {
    id: "p10", name: "Where the Night Meets the Sea", slug: "night-whale", category: "polaroids", price: 69,
    description: "A little piece of the ocean, painted under a sky full of stars.",
    story: "There are some places where the world feels impossibly quiet — just the sea below, the stars above, and a moment that doesn't need anything else.\n\nWhere the Night Meets the Sea is a tiny escape into that kind of stillness. A little blue world to keep close, for whenever you need somewhere quieter to go.",
    feeling: "Dreamy · peaceful · mysterious · free · comforting",
    details: handmade("Handmade Polaroid"), images: ["/assets/whale_polaroid.png"], available: true, stock: 8, status: "new",
    sketchNo: "009", createdAt: "2026-10-08",
  },
  {
    id: "p11", name: "I've Fallen for You", slug: "fallen-for-you", category: "polaroids", price: 69,
    description: "A tiny love story told in two leaves — because sometimes falling is the sweetest part.",
    story: "Two little leaves, one confession, and a very obvious fall.\n\nI've Fallen for You is a playful little love note disguised as a tiny painting. It's simple, slightly silly, and sweet in the way the best little things often are — a small piece made to make someone smile.",
    feeling: "Playful · sweet · romantic · whimsical · lighthearted",
    details: handmade("Handmade art card"),
    images: ["/assets/leaves_card.png"], available: true, stock: 8, status: "new",
    sketchNo: "010", createdAt: "2026-10-08",
  },
  {
    id: "p6", name: "Monsoon Street", slug: "monsoon-street", category: "postcards", price: 199,
    description: "A loose postcard sketch of a street just after the rain.",
    story: "Retired from the collection — but kept in the archive because we still like it.",
    details: paper("A6 · 10.5 × 14.8 cm"), images: ["/products/monsoon-street.jpg?v=2"], available: false, stock: 0, status: "retired",
    sketchNo: "005", createdAt: "2026-07-14",
  },
];

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const recentProducts = (n = 4) =>
  [...PRODUCTS].filter((p) => p.status !== "retired").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, n);
export const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const INSTAGRAM_URL = "https://www.instagram.com/halfsketch.in/";
