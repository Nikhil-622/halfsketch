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
