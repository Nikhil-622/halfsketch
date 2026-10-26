export type Category = "bookmarks" | "postcards" | "calendars" | "mail-club";
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
  mrp?: number;
  collection?: string;
  variants?: string;
  /** Set on multi-copy editions (e.g. a Mail Club box). They keep a real copy count instead of being one of a kind. */
  edition?: string;
  /** Listed automatically from a photo named <name>_bookmark|_postcard|_calendar.png in public/assets/. */
  fromFile?: boolean;
}

export interface Listing {
  slug: string;
  custom?: boolean;
  name?: string;
  description?: string;
  price?: number;
  mrp?: number;
  cost?: number;
  stock?: number;
  soldOut?: boolean;
  category?: Category;
  collection?: string;
  variants?: string;
  image?: string;
  tiers?: number[];
  createdAt?: string;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  bookmarks: "Bookmarks",
  postcards: "Postcards",
  calendars: "Calendars",
  "mail-club": "Mail Club",
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
  // Shown for an admin-added piece that has no photo yet.
  placeholder: "/halfsketch-logo.png",
  studio: "/assets/collection_polaroid.webp",
  studioPhone: "/assets/collection_polaroid_sm.jpg",
};

export const spec = (size?: string) => [
  ...(size ? [{ label: "Size", value: size }] : []),
  { label: "Paper", value: "240gsm paper" },
  { label: "Medium", value: "Watercolour & ink, hand-painted" },
  { label: "Finish", value: "Matte, unvarnished" },
];

// The Mail Club bundle: ₹299 by default (a price saved in Admin → Products overrides it). Copies are set in
// Admin → Stock; until there is at least one copy the page shows "Pre-orders open soon".
// Artwork: drop photos in public/assets/ and fill in the `image` paths below. Empty = a labelled placeholder.
export const MAIL_CLUB = {
  slug: "november-mail-club",
  edition: "mail-club-2026-11",
  editionLabel: "November edition",
  theme: "The Art of Doing Nothing",
  message: "A little reminder that you don't have to be productive every minute of the day.",
  // Collage of the five pieces (made from the photos below). The inclusion photos live in public/assets/mc_*.webp.
  cover: "/assets/mail_club_cover.webp",
  // Optional text shown under shipping, e.g. "Posted in the first week of November". Leave empty until decided.
  shipsNote: "",
  includes: [
    { name: "Sleepy ginger cat postcard", line: "A ginger cat curled up asleep among fallen autumn leaves — for rest, comfort and slow days.", image: "/assets/mc_cat_postcard.webp" },
    { name: "Ivy-covered window bookmark", line: "A little window wrapped in red autumn ivy, to keep between the pages of whatever you're reading.", image: "/assets/mc_ivy_bookmark.webp" },
    { name: "November calendar", line: "The whole month on one page, with the same sleepy cat keeping you company.", image: "/assets/mc_november_calendar.webp" },
    { name: "Three art stamps", line: "Tiny stamp-style artworks — a cat in the leaves, an autumn bouquet and an ivy cottage. Decorative, not postage.", image: "/assets/mc_art_stamps.webp" },
    { name: "A personal letter", line: "A letter from us, about the guilt of doing nothing and the comfort of quiet days.", image: "/assets/mc_letter.webp" },
  ],
  // The letter as printed (after "Dear you,"), one paragraph per entry. The page shows only the first
  // `letterPreview` paragraphs and keeps the rest for the parcel.
  letterPreview: 4,
  letter: [
    "I wonder when we started feeling guilty about doing nothing.",
    "Somewhere along the way, even our quiet days began to feel like unfinished to-do lists. We count the things we accomplish, the places we go, the plans we make. And on the days when we do very little, we sometimes feel as though we have somehow fallen behind.",
    "But look at this little cat.",
    "It has found a place among the fallen leaves, tucked its paws beneath itself, and decided that, for now, this is enough. It doesn't seem concerned about the things it hasn't done today.",
    "Maybe there is something lovely in that.",
    "Maybe not every day needs to become a story worth telling. Maybe some days are simply meant to be lived slowly: a familiar song playing in the background, sunlight on the floor, a walk without a destination, or an afternoon when you finally let yourself rest.",
    "If you've been waiting for permission to slow down, perhaps this is your little reminder.",
    "You are allowed to exist without constantly trying to become something more.",
    "A little something to think about: What would your day look like if you didn't feel the need to make it productive?",
    "You don't have to write the answer down. Just let yourself wonder.",
    "Until the next little letter,",
    "P.S. I hope something small and ordinary makes you smile today. I think those are often the things worth keeping.",
  ] as string[],
} as const;

// To add a product, append an object here — everything else updates automatically.
export const PRODUCTS: Product[] = [
  {
    id: "mc-2026-11", name: "November Mail Club", slug: MAIL_CLUB.slug, category: "mail-club", price: 299,
    description: `${MAIL_CLUB.theme}. ${MAIL_CLUB.message} A one-time parcel of handmade art and stationery.`,
    story: "A small parcel of handmade art and stationery, posted once, for the slow days of November.",
    details: [
      { label: "Edition", value: `${MAIL_CLUB.editionLabel} · one-time purchase` },
      { label: "Inside", value: "Postcard, bookmark, calendar, 3 art stamps, a letter" },
      { label: "Medium", value: "Watercolour & ink, hand-painted originals, printed with care" },
    ],
    images: [MAIL_CLUB.cover], available: false, stock: 0, status: "coming-soon",
    edition: MAIL_CLUB.edition, collection: "Mail Club", createdAt: "2026-10-24",
  },
  {
    id: "b-red-house", name: "The Little Red House", slug: "red-house-bookmark", category: "bookmarks", price: 80,
    description: "A small red cottage on a green hill, a lone pine and a wide summer sky — tied with a cotton tassel.",
    story: "Some places you only visit in books. This one sits at the top of a quiet hill, with one pine tree for company and clouds drifting past as slowly as they like.\n\nWe painted it for the pages you read on lazy afternoons — so that every time you open your book, there's a little house waiting, door open, kettle probably on.",
    feeling: "Calm · homely · sunny · unhurried",
    details: [
      { label: "Medium", value: "Hand-painted" },
      { label: "Finish", value: "Cotton tassel" },
    ],
    images: ["/assets/red_house_bookmark.webp"], available: true, stock: 1, status: "new",
    collection: "Everyday", createdAt: "2026-10-24",
  },
  {
    id: "b-savor-citrus", name: "Savor the Story", slug: "lemon-bookmark", category: "bookmarks", price: 80,
    description: "A lemon half and a pink citrus wedge on soft seafoam — with “Savor the Story” lettered by hand.",
    story: "Some chapters are meant to be tasted slowly. We painted two bright slices of citrus on a quiet wash of green, then wrote a small reminder underneath: savor the story.\n\nKeep it between the pages of whatever you're reading when you need a little zest — and permission to linger.",
    feeling: "Bright · fresh · unhurried",
    details: [
      { label: "Medium", value: "Hand-painted watercolour" },
      { label: "Lettering", value: "Hand-written “Savor the Story”" },
      { label: "Finish", value: "Cotton tassel" },
    ],
    images: ["/assets/lemon_bookmark.webp"], available: true, stock: 1, status: "new",
    collection: "Everyday", createdAt: "2026-10-26",
  },
  {
    id: "b-flip-pages", name: "Flip Pages, Not Standards", slug: "emoji-bookmark", category: "bookmarks", price: 80,
    description: "A cool little crowned smiley with sunglasses, lost in a good book — and a cheeky line up top.",
    story: "Good books, better vibes. We painted a sunny character with a tiny crown, shades on, holding a green book — the kind of reader who knows exactly what they like.\n\nThe reminder at the top is half joke, half motto: flip pages, not standards. For the friend who chooses their stories carefully.",
    feeling: "Playful · cool · bookish",
    details: [
      { label: "Medium", value: "Hand-painted watercolour" },
      { label: "Lettering", value: "Hand-written “Flip pages not standards”" },
      { label: "Finish", value: "Cotton tassel" },
    ],
    images: ["/assets/emoji_bookmark.webp"], available: true, stock: 1, status: "new",
    collection: "Everyday", createdAt: "2026-10-26",
  },
  {
    id: "b-yellow-flowers", name: "Yellow Wildflowers", slug: "yellow-flower-bookmark", category: "bookmarks", price: 80,
    description: "Three small yellow blooms on a climbing green vine, painted on a soft meadow wash.",
    story: "These are the flowers you notice on a walk when you're not in a hurry — small, bright, and quietly cheerful.\n\nWe painted a simple vine of yellow wildflowers so your bookmark feels a little like carrying a scrap of sunshine between the pages.",
    feeling: "Gentle · sunny · simple",
    details: [
      { label: "Medium", value: "Hand-painted watercolour" },
      { label: "Finish", value: "Cotton tassel" },
    ],
    images: ["/assets/yellow_flower_bookmark.webp"], available: true, stock: 1, status: "new",
    collection: "Everyday", createdAt: "2026-10-26",
  },
  {
    id: "b-natures-chapter", name: "Nature's Chapter", slug: "quote-bookmark", category: "bookmarks", price: 80,
    description: "Two ink ferns against a soft blue circle, with “Nature's Chapter” lettered underneath.",
    story: "Some stories grow like ferns — slowly, quietly, toward the light. We drew two fronds over a pale blue wash and named the piece for the chapters that feel like a walk outdoors.\n\nA calm bookmark for the books you read when you want the world to soften a little.",
    feeling: "Calm · botanical · quiet",
    details: [
      { label: "Medium", value: "Ink & watercolour" },
      { label: "Lettering", value: "Hand-written “Nature's Chapter”" },
      { label: "Finish", value: "Cotton tassel" },
    ],
    images: ["/assets/quote_bookmark.webp"], available: true, stock: 1, status: "new",
    collection: "Everyday", createdAt: "2026-10-26",
  },
  {
    id: "p-happy-diwali", name: "A Diya for Diwali", slug: "happy-diwali-postcard", category: "postcards", price: 180,
    description: "A glowing clay diya, fireworks blooming above it and marigolds in every corner — painted in soft watercolour.",
    story: "Diwali always starts small: one diya, one flame, and then the whole sky joins in. We painted that moment — the warm little lamp, the fireworks opening like flowers, and \"Happy Diwali!\" written by hand in gold.\n\nSend it to someone you miss this festival, tuck it into a box of sweets, or keep it on your shelf long after the last cracker has gone quiet.",
    feeling: "Festive · warm · bright · hopeful",
    details: [
      { label: "Medium", value: "Hand-painted watercolour" },
      { label: "Lettering", value: "Hand-written \"Happy Diwali!\"" },
    ],
    images: ["/assets/happy_diwali_postcard.webp"], available: true, stock: 1, status: "new",
    collection: "Gift", createdAt: "2026-10-24",
  },
  // New pieces go here. Example (photo in public/assets/, category "bookmarks" | "postcards" | "calendars"):
  // Prefer WebP (run `npm run optimize:images` after dropping photos).
  // {
  //   id: "b1", name: "Piece name", slug: "piece-name", category: "bookmarks", price: 80,
  //   description: "One line for the card.", story: "A short paragraph for the product page.",
  //   details: spec("5 × 18 cm"), images: ["/assets/piece_name.webp"], available: true, stock: 1, status: "new",
  //   createdAt: "2026-10-24",
  // },
];

// Photo-listed pieces: save a photo in public/assets/ as <name>_bookmark.png|.webp, <name>_postcard… or
// <name>_calendar… and it appears in that section of the shop, named from the file
// ("red_house_bookmark.webp" → "Red House", at /shop/red-house-bookmark). It starts at the usual price for
// its kind; change any price in Admin → Products. Calendars have no usual price yet, so they show
// "Coming soon" until one is set there. A piece written out in PRODUCTS above with the same slug wins.
// After dropping photos, run `npm run optimize:images` and prefer the .webp files in this folder.
const FILE_KINDS = {
  bookmark: { category: "bookmarks", price: 80, line: "A hand-painted bookmark, made to keep your place in the stories you love." },
  postcard: { category: "postcards", price: 180, line: "A hand-painted postcard — to keep, to frame, or to send to someone far away." },
  calendar: { category: "calendars", price: 0, line: "A hand-painted calendar to keep the days company." },
} as const satisfies Record<string, { category: Category; price: number; line: string }>;

export function productFromFile(path: string): Product | null {
  const file = path.split("/").pop() ?? "";
  // Mail Club inclusion photos (mc_*.webp) stay on /mail-club only — not shop collections.
  if (/^mc_/i.test(file)) return null;
  const match = /^(.+)_(bookmark|postcard|calendar)\.(png|jpe?g|webp)$/i.exec(file);
  if (!match) return null;
  const words = match[1]!.split(/[^a-z0-9]+/i).filter(Boolean);
  if (!words.length) return null;
  const kind = FILE_KINDS[match[2]!.toLowerCase() as keyof typeof FILE_KINDS];
  const open = kind.price > 0;
  const stem = `${match[1]}_${match[2]!.toLowerCase()}`;
  // Serve the compressed WebP when present (optimize:images writes it next to the original).
  const image = `/assets/${stem}.webp`;
  return {
    id: `file-${stem}`,
    name: words.map((w) => w[0]!.toUpperCase() + w.slice(1).toLowerCase()).join(" "),
    slug: `${words.join("-").toLowerCase()}-${match[2]!.toLowerCase()}`,
    category: kind.category,
    price: kind.price,
    description: kind.line,
    story: kind.line,
    details: [],
    images: [image],
    available: open,
    stock: 1,
    status: open ? "new" : "coming-soon",
    createdAt: "",
    fromFile: true,
  };
}

// Vite lists matching files at build time. Prefer .webp; skip duplicate stems from leftover originals.
const seenFileSlugs = new Set(PRODUCTS.map((p) => p.slug));
for (const path of Object.keys(import.meta.glob("/public/assets/*_{bookmark,postcard,calendar}.{png,jpg,jpeg,webp}"))) {
  const piece = productFromFile(path);
  if (!piece || seenFileSlugs.has(piece.slug)) continue;
  seenFileSlugs.add(piece.slug);
  PRODUCTS.push(piece);
}

const HAMPER_TIERS = [299, 399, 499, 599];
export { HAMPER_TIERS };

let listings: Record<string, Listing> = {};
let catalogReady = false;
const listeners = new Set<() => void>();

export function installListings(rows: Listing[]) {
  listings = Object.fromEntries(rows.map((row) => [row.slug, row]));
  catalogReady = true;
  listeners.forEach((fn) => fn());
}

export function catalogState() {
  return { ready: catalogReady, listings };
}

export function subscribeCatalog(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

function pieceFrom(row: Listing): Product {
  const category = row.category ?? "bookmarks";
  return {
    id: row.slug,
    name: row.name || "Untitled piece",
    slug: row.slug,
    category,
    price: row.price ?? 0,
    description: row.description || "",
    story: row.description || "",
    details: [],
    images: [row.image || IMAGES.placeholder],
    available: true,
    stock: row.stock ?? 1,
    status: "new",
    createdAt: row.createdAt || new Date().toISOString().slice(0, 10),
    ...(row.collection ? { collection: row.collection } : {}),
    ...(row.variants ? { variants: row.variants } : {}),
  };
}

export function overlay(product: Product, row?: Listing): Product {
  if (!row) return product;
  const price = typeof row.price === "number" ? row.price : product.price;
  const stock = row.soldOut ? 0 : typeof row.stock === "number" ? row.stock : product.stock;
  const retired = product.status === "retired" || product.status === "coming-soon";
  const next: Product = {
    ...product,
    name: row.name || product.name,
    description: row.description || product.description,
    category: row.category || product.category,
    price,
    stock,
    available: retired ? product.available : stock > 0,
    status: retired ? product.status : stock <= 0 ? "sold-out" : product.status === "sold-out" ? "new" : product.status,
    images: row.image ? [row.image] : product.images,
  };
  if (typeof row.mrp === "number" && row.mrp > price) next.mrp = row.mrp;
  else delete next.mrp;
  if (row.collection) next.collection = row.collection;
  if (row.variants) next.variants = row.variants;
  if (product.edition || product.fromFile) {
    // Editions and photo-listed pieces open only once they have a price (and, for editions, copies).
    const open = next.price > 0 && next.stock > 0;
    next.available = open;
    next.status = open ? (product.edition ? "limited" : "new") : next.price > 0 && typeof row.stock === "number" ? "sold-out" : "coming-soon";
  }
  return next;
}

export function getProduct(slug: string) {
  const row = listings[slug];
  if (row?.custom) return overlay(pieceFrom(row), row);
  const base = PRODUCTS.find((p) => p.slug === slug);
  return base ? overlay(base, row) : undefined;
}

export function liveProducts() {
  const known = new Set(PRODUCTS.map((p) => p.slug));
  const custom = Object.values(listings).filter((row) => row.custom && !known.has(row.slug));
  return [...PRODUCTS.map((p) => getProduct(p.slug)!), ...custom.map((row) => getProduct(row.slug)!)];
}

export const recentProducts = (n = 4) =>
  liveProducts().filter((p) => p.status !== "retired").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, n);
export const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const INSTAGRAM_URL = "https://www.instagram.com/halfsketch.in/";
