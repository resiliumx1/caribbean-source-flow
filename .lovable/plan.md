## What the customer saw

The red banner — `Payment failed. Please try again or contact support at info@mountkailashslu.com` — is shown by the `onError` callback in `src/pages/Checkout.tsx` (lines 528–537). It fires when the **PayPal SDK itself throws an error**, *before* any money is captured and *before* anything reaches our backend.

## What actually happened (root cause)

The failure happened entirely inside PayPal, not in our checkout code:

- No row in `failed_order_alerts` — our edge function was never called.
- No `paypal-checkout` edge-function logs at all for this attempt.
- No matching order in `orders` near the customer's time.
- Order total $316 USD is well within PayPal limits, so it was not an amount rejection.

That means **no money was taken**. The customer can safely retry. Typical real-world causes for PayPal's `onError` at this stage:

1. Card declined inside the PayPal modal (most common — issuer blocked international/USD charge).
2. PayPal popup blocked by the mobile browser, or modal closed mid-flow.
3. Customer's PayPal account flagged / region restriction on USD.
4. Network drop while the PayPal iframe was loading.

The customer's screenshot is 384px wide (mobile) — mobile PayPal popups are the #1 cause of this exact toast in production.

## What I'd improve so we can diagnose the next one

The current `onError` swallows PayPal's actual error object — we only log `console.error("PayPal error:", err)` and show a generic toast. That's why we have nothing to look at. Small, low-risk improvements:

1. **Capture PayPal's error code into our DB.** Add a lightweight `payment_attempts` table (or reuse `failed_order_alerts` with a new `stage` column) so the `onError` handler POSTs `{ stage: 'paypal_sdk_error', error_message, error_name, paypal_debug_id, cart_total, email_if_filled }` to an edge function. This gives us a forensic trail without exposing anything sensitive.
2. **Show the customer a more helpful message.** Replace the generic toast with: "PayPal couldn't complete the payment. This usually means your card was declined or the PayPal window was closed. Try again, use a different card, or pay with a PayPal balance. If it keeps happening, email info@mountkailashslu.com." Keep the destructive-toast variant.
3. **Log PayPal's `debug_id`** (from `err?.details` / `err?.debug_id` when present) in the console alongside the existing message. Customers can quote this when emailing support.
4. (Optional) Detect "Window closed" specifically and toast `Payment window was closed — try again` instead of "failed".

These are all in `src/pages/Checkout.tsx` plus a tiny new `supabase/functions/log-payment-attempt/index.ts` and one migration. No change to pricing, shipping, or the capture/save flow.

## What to tell the customer right now

The payment did not go through and no money was charged. Ask her to:

- Try again (preferably from a desktop browser or a different network).
- If it still fails, try a different card or pay from PayPal balance.
- If she got a PayPal email with a "Transaction ID" or "Debug ID", forward it so we can look it up.

## Files I'd touch (if you approve step 2)

- `src/pages/Checkout.tsx` — richer `onError`, friendlier toast, fire-and-forget log call.
- `supabase/functions/log-payment-attempt/index.ts` *(new)* — accepts the SDK error payload.
- `supabase/migrations/<timestamp>_payment_attempts.sql` *(new)* — table + grants + admin-only RLS.
- `supabase/config.toml` — register the new function with `verify_jwt = false`.

Want me to proceed with the diagnostic logging improvements, or just leave the explanation and let the customer retry?