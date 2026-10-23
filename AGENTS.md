<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Product catalogue lives in `src/lib/products.ts`; add pieces there (single source of truth, no DB needed for a small catalogue).
- Orders are priced only via the `createOrder` server function, then saved in Firestore (`orders`) from the browser. Profile and cart stay on `users/{uid}`. Publish `firestore.rules` so shoppers can read only their own orders and only the two studio emails can confirm one.
- Order submission is separate from payment; a future gateway (e.g. Razorpay) should update `paymentStatus` rather than change order creation.
- Stock lives only on Firestore `listings/{slug}` (`stock` count + `soldOut` pause), set in Admin → Stock and read by the shop, cart and `createOrder` through the catalogue. "Confirm stock" subtracts each order's quantity; a piece is sold out at 0 or while paused.
- Mail Club editions (`MAIL_CLUB` + a product with `edition` in `src/lib/products.ts`, page at `/mail-club`) open only once they have a price (Admin → Products) and copies (Admin → Stock).
