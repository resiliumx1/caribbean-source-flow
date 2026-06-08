## Goal
Let customers pay by debit/credit card on the checkout page without a separate payment processor, using PayPal as the underlying processor.

## Step 1 — Verify the existing guest "Debit or Credit Card" button
PayPal's vertical button stack already loads with `enableFunding: "venmo,paylater,card"` in `src/App.tsx`, which renders a black "Debit or Credit Card" button under the yellow PayPal button. Tapping it opens PayPal's hosted guest card form (card number, expiry, CVV, billing address) — no PayPal account needed. PayPal processes and settles to the existing PayPal Business account.

I'll open the live checkout in the preview browser at mobile width with a test cart item and confirm the black card button renders. If it does, this path already works today and just needs to be clearly labelled in the UI.

UI polish (small):
- Add a subtle "Pay with debit or credit card — no PayPal account required" helper line under the PayPal button stack so customers know the second button is the card option.

## Step 2 — Add embedded Advanced Card Fields (in-page card form)
Most customers expect to type card details directly into the checkout page, not in a popup. PayPal's `card-fields` component renders hosted, PCI-compliant card-number / expiry / CVV inputs inline.

### Changes

**`src/App.tsx`**
- Change `components: "buttons"` → `components: "buttons,card-fields"` in `paypalOptions`.

**`src/pages/Checkout.tsx`**
- Below the existing `<PayPalButtons>`, add a new "Or pay with card" section containing:
  - `<PayPalCardFieldsProvider>` wired to the same `createOrder` (reuses `pendingPayPalOrderIdRef` so retries don't double-charge) and the same `onApprove` → `submitOrderToBackend` flow used by `<PayPalButtons>`.
  - `<PayPalNumberField>`, `<PayPalExpiryField>`, `<PayPalCVVField>` styled with the existing checkout border / focus-ring / 44px touch-target tokens.
  - A "Pay $XX.XX with card" primary button that calls `cardFieldsForm.submit()`.
- Reuse the existing `onError` handler (debug-id surfacing, "window closed" detection, fire-and-forget `log-payment-attempt`, retry-save state).
- Eligibility gate: only render the card-fields block when `cardFieldsForm.isEligible()` returns true. If the merchant account isn't approved for Advanced Credit and Debit Card Payments, the block stays hidden and the existing black guest-card button (Step 1) remains the working fallback. No regression.
- Same cache-invalidation `useEffect` on `[totalUsd, delivery_type, cartCount]` clears the cached PayPal order id for card fields too.

### What does NOT change
- `src/lib/paypal.ts` (same client ID).
- `supabase/functions/paypal-checkout/index.ts` (same order-save path — card-fields captures and saves identically to button captures).
- `supabase/functions/log-payment-attempt/index.ts` (reused).
- No new secrets, no new tables, no new edge functions.

## Caveats to surface to the user
- **Advanced Card Fields requires PayPal Business approval for "Advanced Credit and Debit Card Payments."** US accounts usually have it by default; some regions / newer accounts need to apply in the PayPal dashboard. If it's not approved, the inline form silently won't render and customers fall back to the (working) black guest-card button.
- PayPal may still hide the card button for buyers in unsupported regions or buyers already logged into PayPal — that's controlled by PayPal, not by us.

## Files to touch
- `src/App.tsx` — add `card-fields` to `components`.
- `src/pages/Checkout.tsx` — add the card-fields block, helper text under buttons, eligibility gate.
