# Adjustable Payment Plans (PayPal Installments)

Lets MKRC staff create a payment plan for a customer (e.g. a retreat or course package), share a link, and let the customer pay any amount they choose toward the balance via PayPal — repeatedly, until paid in full.

Reuses the existing PayPal Live credentials (`PAYPAL_CLIENT_ID` in `src/lib/paypal.ts`, `PAYPAL_CLIENT_SECRET` already in backend secrets). No new secrets.

## What gets built

### 1. Database (one migration)
- `payment_plans` — customer_name, customer_email, package_name, total_amount, amount_paid (default 0), balance_remaining, min_payment (nullable), status (`active` | `paid` | `cancelled`).
- `payments` — plan_id (fk), amount, paypal_capture_id (UNIQUE for idempotency).
- `apply_payment(p_plan_id uuid, p_amount numeric)` SECURITY DEFINER function: atomically increments `amount_paid`, recomputes `balance_remaining`, flips status to `paid` when balance ≤ 0.
- RLS: admins manage everything; anon can `SELECT` a single `payment_plans` row by id (needed by the public `/pay/:id` page) and read its own balance fields only. `payments` is service-role-only. Standard GRANTs included.

### 2. Edge functions (PayPal secret stays server-side)
- `create-paypal-plan-order` — input `{ planId, requestedAmount }`. Loads plan, clamps amount to `min(requested, balance_remaining)`, validates against `min_payment` (or `$1`) and `status='active'`. Mints a PayPal access token, creates a v2 Orders order (`intent: CAPTURE`, USD, `custom_id: planId`, description: package name). Returns `{ orderID, amount }`.
- `capture-paypal-plan-order` — input `{ orderID }`. Captures via PayPal. Idempotent: if a `payments` row with that `paypal_capture_id` exists, returns the current balance. Otherwise inserts the payment and calls `apply_payment`. Returns updated plan totals.
- `paypal-plan-webhook` — handles `PAYMENT.CAPTURE.COMPLETED`. Same idempotent insert + `apply_payment`, so balances still settle if the customer closes the tab.

All three use the existing live base `https://api-m.paypal.com` and read `PAYPAL_CLIENT_SECRET` from env. CORS headers included on every response.

### 3. Admin UI — new page `/admin/payment-plans`
- "Create Payment Plan" dialog: customer name, email, package name, total amount, optional minimum payment.
- After creation, shows a copyable shareable link `https://<site>/pay/{planId}` with copy-to-clipboard.
- Table of plans: customer, package, total, paid, remaining, status, created date, copy-link action, view-payments drawer (list of captures with amount + date).
- Added to the existing `AdminLayout` sidebar nav, gated by the existing admin auth (`is_admin()`).

### 4. Public payment page — new route `/pay/:planId`
- No login required. Looks up the plan via the anon-readable row.
- Header card: customer name, package, total, amount paid so far, **remaining balance** (large).
- Amount input: pre-filled with remaining balance, min = `min_payment ?? 1`, max = remaining, USD.
- PayPal Smart Buttons (loaded via the existing client-id) wired so `createOrder` calls the `create-paypal-plan-order` function with the chosen amount, and `onApprove` calls `capture-paypal-plan-order` then shows a receipt + refreshed balance. Multiple partial payments supported — the user can come back and pay more anytime.
- If `balance_remaining ≤ 0`: shows "Paid in full ✓" and hides the button.
- Styled with the MKRC theme tokens (DM Sans / Cormorant Garamond, brand greens) to match the rest of the site; no GateEntrance interception on this route.

### 5. Light wiring
- New lazy route in `src/App.tsx` for `/pay/:planId` and `/admin/payment-plans`.
- New nav item in `AdminLayout` sidebar.
- Helper `src/lib/paymentPlans.ts` for the two function invocations.

## Technical notes
- PayPal env: **live** (matches current checkout). Webhook URL to register with PayPal will be surfaced after deploy.
- Idempotency is enforced by the `UNIQUE` constraint on `payments.paypal_capture_id` plus a `WHERE NOT EXISTS` guard, so the webhook and the browser callback are safe to both fire.
- `balance_remaining` is stored (not derived) so the public page can read it in a single anon-safe query.
- No subscriptions — each payment is a one-off PayPal capture, matching the project's no-recurring rule.

## Out of scope (ask if needed)
- Email receipts to the customer after each partial payment.
- Linking a plan back to an `orders` row.
- Refund / void flow from the admin UI.
- Non-USD currencies.
