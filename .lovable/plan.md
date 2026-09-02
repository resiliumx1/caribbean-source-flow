# Payment plan charges triggering Authorize.Net fraud filters

## What I found (verified)

Plan `8dd3fe9c…` — "Seamoss", Daquisiline Gomis, total **$1,227.60**, balance still **$1,227.60**, status active, created 31 Aug. The audit trail shows only `plan_created`.

- **No payment rows exist for this plan at all** (`payments` filtered by this plan: 0 rows).
- Every other recorded plan payment succeeded at $25–$800. The largest recorded success is $800.
- The two flagged transaction IDs from the emails (`81772104148`, `81779468899`) appear nowhere in `payments`, `orders.payment_transaction_id`, or `payment_attempts`.

So the gateway created transactions, but our backend saved nothing — the customer sees a failure while Authorize.Net has a transaction on file.

Two causes, one gateway-side and one code-side:

1. **Gateway side — Default Amount Filter.** It is a merchant-configured Fraud Detection Suite rule with an upper amount limit. $1,227.60 is well above every previously accepted charge, so it matches the rule. This is configuration in the Authorize.Net Merchant Interface, not something code can change.

2. **Code side — held-for-review responses are treated as declines.** In `supabase/functions/_shared/authnet.ts` the charge helper only accepts `responseCode === "1"`. Authorize.Net returns `responseCode "4"` ("Held for Review") when an FDS filter action is set to authorize-and-hold. That path throws a decline error, so no `payments` row is written, `apply_payment` never runs, and the balance stays full — even though a real transaction exists at the gateway. This matches the observed state exactly.

## What to change in code

`supabase/functions/_shared/authnet.ts`
- Treat `responseCode === "4"` as a distinct **held / under review** outcome instead of a decline. Return the `transId`, auth data and a `held: true` flag.
- Keep `responseCode` 2 (decline) and 3 (error) behaviour unchanged.
- Log the FDS filter details returned in the response for support.

`supabase/functions/authnet-plan-charge/index.ts`
- When the charge comes back held, still insert the `payments` row (idempotent on `transId`) with `status = 'pending_review'` and **do not** call `apply_payment` — the balance only drops once the transaction settles.
- Return a distinct response so the UI can say the payment is under review rather than failed.

`supabase/functions/plan-autobill/index.ts`
- Same held-handling so automatic charges don't silently vanish.

`src/pages/PaymentPlanPay.tsx`
- Show a clear "Payment received — under review by our payment processor. You'll be emailed once it clears." state instead of a red error when the response is held.
- Prevent immediate re-submission in that state so the customer doesn't create duplicate large charges.

Optional (recommend, ask before doing): cap a single plan payment to a configurable maximum (e.g. $999) with a message suggesting the customer split it, which avoids the amount filter entirely.

## What has to be done in the Authorize.Net Merchant Interface (no code can do this)

1. Fraud Detection Suite → Transaction Filters → **Default Amount Filter**: raise the upper limit above the largest legitimate plan payment (e.g. $2,500), or set its action to **Report and Process** so large legitimate payments go through and only generate a notification.
2. Search transactions `81772104148` and `81779468899` and check their status. If either is authorized/held, either void it or settle it and manually record the payment against this plan so the customer isn't charged twice.

## Notes

I could not correlate the two transaction IDs to any app record, and edge function logs for `authnet-plan-charge` have already rolled off, so the exact response code for those attempts is unconfirmed. The first task after approval is to add the held-response logging above, then re-attempt a charge so the response code is captured for certain before assuming the fix is complete.
