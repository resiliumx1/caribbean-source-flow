## Goal
After a customer looks up their order in the concierge chat, offer them an optional opt-in: get an email (or SMS) the moment their shipment status changes (e.g. shipped → in transit → out for delivery → delivered).

## How it will work

```text
Customer pastes tracking #  →  bot returns status + ETA
                            →  bot shows "🔔 Notify me when this changes" card
                            →  customer enters email (or phone) + confirms
                            →  row written to tracking_subscriptions
Cron every 10 min  →  watcher edge function loops active subs,
                      compares order.status / fulfillment_status / tracking_number
                      to last_known_*, and sends a Resend email on change.
```

## Database (one migration)

`public.tracking_subscriptions`
- `id uuid pk`
- `order_id uuid → orders(id) on delete cascade`
- `channel text check in ('email','sms')`
- `contact text` (email address or E.164 phone)
- `last_known_status text`, `last_known_fulfillment text`, `last_known_tracking text`
- `verified boolean default false` (email double-opt-in via token)
- `verify_token uuid default gen_random_uuid()`
- `unsubscribe_token uuid default gen_random_uuid()`
- `active boolean default true`
- `created_at`, `updated_at`, `last_notified_at`
- unique(order_id, channel, lower(contact))

GRANTs + RLS: service_role full; anon insert only via edge function (no direct table policy for anon); authenticated select own rows where `contact = auth.email()`.

## Edge functions

1. **`tracking-subscribe`** (public, rate-limited 5/IP/hr)
   - Body: `{ orderQuery, channel, contact }`
   - Validates contact format, runs `lookupOrder()` to resolve the order, inserts subscription with current status as baseline, sends confirmation email via Resend containing a verify link + unsubscribe link.
2. **`tracking-verify`** — GET `?token=` → flips `verified=true`, renders a branded HTML success page.
3. **`tracking-unsubscribe`** — GET `?token=` → sets `active=false`, renders confirmation page.
4. **`tracking-status-watcher`** — scheduled (pg_cron, every 10 min). For each active+verified sub, fetches order, diffs against `last_known_*`, sends Resend email "📦 Update on order MK-…" with new status + carrier link, updates `last_known_*` and `last_notified_at`. Auto-deactivates when status becomes `delivered`.

Cron job created via `supabase--insert` (per scheduling guide).

## SMS support
Schema and `channel='sms'` path are wired, but actual send requires the Twilio connector. If `channel='sms'` and Twilio env not present, the subscribe function will return a friendly "SMS coming soon — we've saved your email instead?" prompt. (No partial Twilio code that would silently fail.)

## Concierge integration
- After a successful tracking lookup, the bot appends a short opt-in block to its reply:
  > 🔔 *Want to know when this moves? Reply* `notify me at you@email.com` *and we'll email you on every status change.*
- `concierge-chat` pre-LLM intercept gains a `notify me at <email>` / `notify me at <+phone>` parser that calls `tracking-subscribe` with the most recently looked-up order in the conversation (stored in `concierge_conversations.metadata`).
- Adds quick-action chip: "🔔 Notify me on updates" (only shown after a tracking lookup in the current session — gated on a local flag).

## Email template
New React Email template `shipment-status-update.tsx` registered in transactional registry, plus a one-off `tracking-subscription-confirm.tsx` for the double-opt-in. Both use existing brand styling. Footer includes the one-click unsubscribe link.

## Files

**New**
- `supabase/migrations/<ts>_tracking_subscriptions.sql`
- `supabase/functions/tracking-subscribe/index.ts`
- `supabase/functions/tracking-verify/index.ts`
- `supabase/functions/tracking-unsubscribe/index.ts`
- `supabase/functions/tracking-status-watcher/index.ts`
- `supabase/functions/_shared/tracking-notify.ts` (Resend send helper + status-diff util)
- `supabase/functions/_shared/transactional-email-templates/shipment-status-update.tsx`
- `supabase/functions/_shared/transactional-email-templates/tracking-subscription-confirm.tsx`

**Edited**
- `supabase/functions/concierge-chat/index.ts` (append opt-in CTA after lookups; parse `notify me at …`; store last-looked-up order in conversation metadata)
- `supabase/functions/_shared/transactional-email-templates/registry.ts`
- `src/components/concierge/ConciergePanel.tsx` (post-lookup quick chip)

## Out of scope
- Live carrier scan polling (still relies on internal `orders.status` / `fulfillment_status` changes made by the team)
- Branded SMS sending (schema only until Twilio is connected)
- Authenticated "manage all my subscriptions" page (use unsubscribe links for now)
