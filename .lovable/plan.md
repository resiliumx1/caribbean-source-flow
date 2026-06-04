
## 1. Shipping fees

### Database
- Migration: add `is_digital boolean NOT NULL DEFAULT false` to `products`.
- Backfill: mark current ebook/digital products via slug/category match where obvious (admin can toggle others afterwards).
- Add a "Digital product" checkbox to the admin product editor.

### Pricing rules (computed at checkout + re-verified in `paypal-checkout` edge fn)
A "physical cart" = cart contains at least one non-digital product.

| Scenario | Fee |
|---|---|
| All items digital | $0 |
| Physical, country = LC, **Pickup** selected | $0 |
| Physical, country = LC, **Local delivery** | 30 XCD (~$11.11 USD) |
| Physical, country ≠ LC (international) | $30 USD (81 XCD) |

Conversion uses the project's fixed 2.70 XCD/USD rate.

### Checkout UI
- Delivery-method radio group shown when country = LC and cart has physical items:
  - **Pickup at Mount Kailash (free)**
  - **Local delivery — Saint Lucia (30 XCD)**
- Hide address fields for Pickup; show them for delivery + international.
- Order summary shows the live shipping line; total updates as the user changes country/method.
- If cart is 100% digital → shipping section hidden, total = subtotal.

### Server (`paypal-checkout/index.ts`)
- Re-derive `is_digital` flags from DB (never trust client). Recompute shipping using the same rules. Persist `shipping_usd` / `shipping_xcd`.
- Extend `delivery_type` allowed values to `local | international | pickup`.

## 2. Retreat purchases (PayPal, full or 50% deposit)

### Database
- Extend `retreat_bookings` with:
  - `payment_option text check in ('full','deposit')` default `'full'`
  - `amount_paid_usd numeric`, `balance_due_usd numeric`
  - `paypal_order_id text`, `paypal_capture_id text`
- Confirm RLS: authenticated users insert their own booking; service role inserts via edge function.

### New edge function `retreat-checkout`
- Input: `retreat_type_id`, optional `retreat_date_id` (group) or `start_date`/`end_date` + `nights` (solo), `guest_count`, contact info, `payment_option`, PayPal `order_id` + `capture_id`.
- Server recalculates authoritative total:
  - Group → `retreat_dates.price_override_usd ?? retreat_types.base_price_usd` × guests.
  - Solo → `solo_pricing_tiers` lookup by nights × nights.
- `amount_paid_usd = payment_option === 'deposit' ? total * 0.5 : total`. `balance_due_usd = total - amount_paid`.
- Verifies PayPal capture amount matches `amount_paid_usd` (reject otherwise).
- Inserts booking with `payment_status = 'deposit_paid' | 'paid'`, increments `retreat_dates.spots_booked` for group retreats.
- Sends confirmation email via `send-order-emails` (new email type `retreat_booking_confirmation`, includes balance-due details).

### Frontend
- New route `/retreats/book/:slug` (with `?date=<retreat_date_id>` for group):
  - Step 1: choose date / nights / guests (reuse calendar + solo pricing components).
  - Step 2: contact form (name, email, phone, special requests).
  - Step 3: payment-option toggle — **Pay in full** vs **50% deposit (balance due before arrival)**. Shows amount due now + balance.
  - Step 4: PayPal buttons charging `amount_paid_usd`.
- "Book Now" CTAs on `GroupRetreatsList` items and the solo card in `RetreatPathSplit` / `RetreatCalendar`.
- Confirmation page `/retreats/booking-confirmation/:id` with receipt + balance reminder.

### Admin
- Add a simple `AdminRetreatBookings` list (reusing orders table styling) with a "Mark balance paid" button. Full booking management out of scope.

## 3. Out of scope
- Tax handling unchanged.
- Wholesale orders unaffected.
- Existing `local`/`international` orders preserved; new `pickup` value added.
