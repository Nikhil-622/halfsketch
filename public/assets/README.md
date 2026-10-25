# Image drop folder

Drag photos here (`.jpg`, `.jpeg`, `.png`, `.webp`). Keep the original filename.

Then run `npm run optimize:images` to create compressed WebP versions (max 1400px) for Vercel, and point product / page paths at the `.webp` files.

A file named `Winter.jpeg` is served at:

`http://localhost:8080/assets/Winter.jpeg`

## The collection

- Product photos → save as `<name>_bookmark.png`, `<name>_postcard.png` or `<name>_calendar.png`, then optimize to WebP and list `/assets/<name>_….webp` in `src/lib/products.ts` (or keep the PNG naming so auto-listing works, then convert).
- Collection cover photos (homepage "All Collections" tiles) → set `img` in `COLLECTIONS` in `src/routes/index.tsx`.
- Mail Club inclusion photos → set `image` in `MAIL_CLUB.includes` in `src/lib/products.ts` (prefer `.webp`).

## Editorial (homepage / story, not products)

- `collection_polaroid.webp` — homepage "Latest Collection" band
- `about_us2.webp` — Our Story
- `logo.webp` — navbar and footer
