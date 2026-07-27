# Payment Plans + Store Operations Upgrade

Delivered in four phases so each piece can be tested before the next lands.

---

## Phase 1 — Payment plan management

**Detail view.** Clicking a plan row opens a full detail panel showing customer info, package, totals, progress, and a **payment log**: every payment with date/time, amount, card type and last 4, transaction ID, and outcome (succeeded / refunded / partially refunded / failed). Failed and declined attempts are shown too, so you can immediately see if a customer's payment errored out and why (decline reason is already captured server-side).

**Edit.** Admins can edit customer name, email, package name, total amount, minimum payment, and status. Changing the total automatically recalculates the remaining balance from payments actually recorded — it never silently loses paid history. Every edit is written to an audit log (who, when, what changed).

**Archive + restore.** Delete becomes archive: a confirmation dialog ("Are you sure? This hides the plan and disables its payment link") archives the plan, hides it from the default list, and disables the public `/pay/:id` page. An **Archived** filter shows archived plans with a Restore button. Payment history is always preserved.

**Health check.** A banner on the plans list flags any plan whose recorded payments don't reconcile with its balance, plus any recent failed charge attempts, so errored payments surface instead of hiding.

---

## Phase 2 — Real refunds (Authorize.net)

- Each payment row gets a **Refund** action: full or partial amount, a required reason (dropdown: duplicate charge, customer request, service not rendered, fraud, other) and an optional admin note.
- A new `authnet-refund` edge function issues a genuine Authorize.net refund. If the transaction hasn't settled yet, Authorize.net can't refund it — the function automatically issues a **void** instead and labels it as such.
- Refunds are recorded as their own entries, the plan's paid amount and balance adjust back, and a paid plan reverts to active if a refund reopens a balance.
- Note: Authorize.net requires the card's last 4 digits to refund. We already receive them at charge time but don't store them, so from now on they're saved (masked only — never full card data). **Payments taken before this change cannot be refunded in-app** and must be refunded in the Authorize.net portal; the UI will say so explicitly rather than failing silently.
- The same refund flow is wired into shop orders (Phase 4).

---

## Phase 3 — Auto-billing on payment plans

- Optional per plan: choose an amount and a cadence (weekly / bi-weekly / monthly) and an end condition (until balance is zero).
- The customer authorizes it once on the `/pay/:id` page — clear consent text showing amount, frequency, and total remaining.
- Implemented with Authorize.net's recurring billing (ARB) so card details stay with Authorize.net, never our database.
- Admin can pause, resume, change the amount, or cancel a schedule; each auto-charge appears in the payment log like any other payment, and a failed auto-charge raises a Payment Alert.
- Shop product subscriptions are explicitly **not** part of this — the existing no-subscriptions rule for the store stays.

---

## Phase 4 — WooCommerce-style store features

**Coupons / discount codes** — admin-managed codes with percent or fixed amount, minimum order value, expiry date, total and per-customer usage limits, and optional product/category scope. Applied at checkout with live validation, shown as a discount line, and stored on the order.

**Inventory / stock control** — per-product (and per-variant) stock quantity, a low-stock threshold with admin alerts, automatic decrement on paid orders and increment on refund, and automatic out-of-stock display plus checkout blocking at zero. Products can opt out of stock tracking.

**Order refunds & editing** — refund shop orders (full or partial, with reason) through the same Authorize.net flow, and edit order line items, quantities, and shipping with totals recalculated and every change recorded in the order history.

**Abandoned carts & customer records** — carts that sit unpaid are captured with contact details where known and listed in admin with a recovery link. A customer view aggregates each buyer's orders, payment plans, lifetime spend, and last activity.

---

## Technical notes

- Database: add `archived_at`, `archived_by`, `notes` to `payment_plans`; add `status`, `type`, `card_last4`, `card_type`, `refunded_amount`, `parent_payment_id`, `reason`, `created_by` to `payments` (and rename usage of `paypal_capture_id` to a provider-neutral transaction id, keeping the column for compatibility). New tables: `payment_plan_audit`, `coupons`, `coupon_redemptions`, `order_refunds`, `abandoned_carts`, `plan_billing_schedules`. Products gain `stock_quantity`, `low_stock_threshold`, `track_inventory`.
- All new tables get GRANTs plus admin-only RLS via the existing `is_admin()` function; balance changes stay inside security-definer functions (`apply_payment`, new `apply_refund`) so totals can't drift.
- New edge functions: `authnet-refund`, `plan-autobill` (scheduled), `authnet-arb` for subscription setup. All reuse the existing shared `authnet.ts` helper with its XSD ordering validator and retry logic.
- The public `/pay/:id` page and `get-payment-plan` function are updated to reject archived plans.
