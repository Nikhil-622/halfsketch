# Image drop folder

Drag photos here (`.jpg`, `.jpeg`, `.png`, `.webp`). Keep the original filename.

Then tell the assistant which file belongs where. A file named `Winter.jpeg` is served at:

`http://localhost:8081/assets/Winter.jpeg`

## The collection

Starting fresh with three collections: Postcards, Bookmarks and Calendars. Nothing is listed yet.

- Product photos → just save them here as `<name>_bookmark.png`, `<name>_postcard.png` or `<name>_calendar.png`.
  They appear in that shop section automatically, named from the file (`red_house_bookmark.png` → "Red House").
  Use underscores between words. Set or change prices in Admin → Products (calendars show "Coming soon" until priced).
  Only `.png` files with those endings are listed, so editorial photos must not end in `_bookmark.png` etc.
- Collection cover photos (homepage "All Collections" tiles) → set `img` in `COLLECTIONS` in `src/routes/index.tsx`.
- Mail Club inclusion photos → set `image` in `MAIL_CLUB.includes` in `src/lib/products.ts`.

## Editorial (homepage / story, not products)

- `collection_polaroid.webp`, `collection_polaroid_sm.jpg`, `collection_polaroid.png` — homepage "Latest Collection" band and collage
- `group_bookmark_sm.jpg`, `group_bookmarks_editorial.png` — homepage collage
- `auto_postcard.jpeg`, `cat_postcard.jpeg` — homepage collage
- `about_us.jpeg`, `about_us2.jpeg` — Our Story
- `logo.png` — navbar and footer
