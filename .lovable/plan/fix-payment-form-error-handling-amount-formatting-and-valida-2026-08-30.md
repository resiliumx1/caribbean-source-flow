# Fix payment form error handling, amount formatting, and validation

The broken form in the screenshot is the payment plan portal (`/pay/:planId`, `src/pages/PaymentPlanPay.tsx`), which uses the shared card form `src/components/payments/AuthorizeNetCardForm.tsx` (also used by Checkout — it inherits the fixes automatically; no Checkout-specific edits).

## Changes

### 1. Surface real edge function errors — `PaymentPlanPay.tsx`
- Add an `extractFnError(error, fallback)` helper: when `supabase.functions.invoke` returns a `FunctionsHttpError`, `await error.context.json()` (fall back to `error.context.text()`), `console.log` the full parsed body, and use `body.error` / `body.message` (plus code if present) as the displayed message.
- Apply it to both invokes: `authnet-plan-charge` and `plan-autobill`, replacing the current generic `error?.message` ("Edge Function returned a non-2xx status code").

### 2. Amount formatting — `PaymentPlanPay.tsx`
- Switch the amount input from `type="number"` (locale-dependent, renders `1227,60` on comma-decimal locales) to `type="text"` `inputMode="decimal"`.
- Add `parseAmount(raw: string): number | null`: strip currency symbols, spaces, and thousands separators; convert comma decimal separator to a period (handles both `1,227.60` and `1227,60`); return `null` on NaN.
- Displayed presets (25% / 50% / Full) keep `toFixed(2)` (en-US period decimal).
- `validAmount` and the invoke bodies use the parsed number; if parsing fails, show "Enter a valid amount" and never invoke.

### 3. Card validation — `AuthorizeNetCardForm.tsx`
- Luhn check on the card number (13–19 digits).
- Expiry MM/YY: valid month, not in the past (compare against current year/month).
- CVV: 3–4 digits; cardholder name and zip non-empty (zip required).
- Per-field inline error messages shown on blur/submit; the Pay button stays disabled until all fields pass.

## Out of scope
- No changes to any edge function.
- No changes to `Checkout.tsx` or any other page (the shared form improvements apply there automatically).

## Verification
- Load `/pay/:planId` preview, confirm amount input accepts both formats, Pay button disabled until valid card data, and a failed charge now shows the actual error message from the function body.
