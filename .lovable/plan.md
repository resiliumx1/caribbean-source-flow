Twilio is now connected to the project (secret `TWILIO_API_KEY` is available). Before I build, I need to confirm scope.

## What I'd like to build

A `send-sms` edge function that uses the Twilio gateway to send transactional SMS, plus hooks into existing order events so customers (and optionally admins) get texted automatically.

### Triggers (proposed defaults)
1. **Order placed** → SMS to customer: "Hi {name}, we got your order {order_number} ($X). We'll text again when it ships."
2. **Payment received** → SMS to customer: "Payment confirmed for order {order_number}. Thank you."
3. **Order shipped** (status → `shipped` with tracking) → SMS to customer with tracking carrier + number.
4. **Admin alert on new order** → SMS to a configured admin number.

All SMS only fire when the order has a valid phone number; failures are logged but don't block the order.

### Settings the user controls
- A `TWILIO_FROM_NUMBER` secret (the Twilio phone number messages send from) — I'll request this via add_secret in build mode.
- A `TWILIO_ADMIN_NUMBER` secret for admin alerts (optional; if absent, admin SMS is skipped).
- Per-trigger on/off toggles stored in the existing `store_settings` table (e.g. `sms_notify_order_placed`, `sms_notify_payment`, `sms_notify_shipped`, `sms_notify_admin`).

### Technical pieces
- New edge function `supabase/functions/send-sms/index.ts` — validates input with Zod, calls `https://connector-gateway.lovable.dev/twilio/Messages.json` using `LOVABLE_API_KEY` + `TWILIO_API_KEY`, returns Twilio message SID.
- New DB trigger on `orders` (INSERT, and UPDATE of `payment_status`/`status`) that calls the edge function via `pg_net` — OR I keep it simpler and invoke `send-sms` from the existing checkout / admin order-update code paths in the app. Recommendation: **invoke from app code**, because it's less moving parts and matches the existing notification pattern.
- Small admin UI toggle row added to the existing store-settings admin page so a non-technical admin can turn each SMS on/off.

### Out of scope (unless you say otherwise)
- Inbound SMS / two-way replies
- Marketing SMS (would need opt-in flow + STOP/HELP handling)
- WhatsApp (you said click-to-chat only; no work needed)
- Voice calls

## Questions before I build

1. Confirm the four triggers above (order placed, payment received, shipped, admin alert) — keep all, or drop some?
2. What Twilio number will messages send from? I'll request it as `TWILIO_FROM_NUMBER` via add_secret.
3. Do you want an admin alert SMS on every new order? If yes, what number? (Stored as `TWILIO_ADMIN_NUMBER`.)
4. Any custom message wording, or are my defaults above fine to start?

Once you answer, I'll switch to build mode and ship it.