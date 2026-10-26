import { describe, expect, it } from "vitest";
import { MAIL_CLUB, PRODUCTS, overlay, productFromFile } from "@/lib/products";

const box = PRODUCTS.find((p) => p.slug === MAIL_CLUB.slug)!;

describe("November Mail Club edition", () => {
  it("costs ₹299 and stays closed until the studio adds copies", () => {
    expect(box.price).toBe(299);
    expect(box.available).toBe(false);
    expect(overlay(box, { slug: box.slug, stock: 20 })).toMatchObject({ available: true, price: 299 });
    expect(overlay(box, { slug: box.slug, price: 0, stock: 20 }).status).toBe("coming-soon");
  });

  it("opens with its real copy count instead of the one-of-a-kind cap", () => {
    const open = overlay(box, { slug: box.slug, price: 500, stock: 20 });
    expect(open).toMatchObject({ available: true, stock: 20, status: "limited" });
  });

  it("sells out when copies run out or the studio marks it sold out", () => {
    expect(overlay(box, { slug: box.slug, price: 500, stock: 0 }).status).toBe("sold-out");
    expect(overlay(box, { slug: box.slug, price: 500, stock: 20, soldOut: true }).available).toBe(false);
  });

  it("lists photos by their filename ending", () => {
    expect(productFromFile("/public/assets/red_house_bookmark.webp")).toMatchObject({
      name: "Red House", slug: "red-house-bookmark", category: "bookmarks", available: true,
      images: ["/assets/red_house_bookmark.webp"],
    });
    expect(productFromFile("/public/assets/sleepy_cat_postcard.png")).toMatchObject({ category: "postcards", images: ["/assets/sleepy_cat_postcard.webp"] });
    expect(productFromFile("/public/assets/november_calendar.png")).toMatchObject({ category: "calendars", available: false, status: "coming-soon" });
    expect(productFromFile("/public/assets/group_bookmark_sm.jpg")).toBeNull();
  });

  it("opens an unpriced photo-listed piece once the studio prices it", () => {
    const cal = productFromFile("/public/assets/november_calendar.png")!;
    expect(overlay(cal, { slug: cal.slug, price: 249 })).toMatchObject({ available: true, status: "new", stock: 1 });
    expect(cal.available).toBe(false);
  });

  it("keeps a piece's real count and sells out at zero or when paused", () => {
    const piece = { ...box, slug: "a-piece", category: "bookmarks" as const, status: "new" as const, available: true, stock: 1, price: 119 };
    delete piece.edition;
    expect(overlay(piece, { slug: piece.slug, stock: 5 })).toMatchObject({ stock: 5, available: true });
    expect(overlay(piece, { slug: piece.slug, stock: 0 })).toMatchObject({ available: false, status: "sold-out" });
    expect(overlay(piece, { slug: piece.slug, stock: 5, soldOut: true })).toMatchObject({ available: false, status: "sold-out" });
  });
});
