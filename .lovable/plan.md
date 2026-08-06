# Calendly Consultation Booking Integration

## Goal
Turn the existing "Private Healing Consultation" CTA into a real paid booking flow that uses the Mount Kailash Calendly account (`https://calendly.com/mountkailashrejuvenationcenter`). Visitors choose a 30-minute slot, pay in advance, and receive a Zoom link. The booking area appears on the homepage and on the webinar page.

## Current state
- Homepage `TrinityHomepage.tsx` already renders a `ConsultationCTA` section that links to `/retreats`.
- Webinars page (`Webinars.tsx`) has no consultation CTA.
- Authorize.net Accept.js is already wired for card payments (`AuthorizeNetCardForm.tsx` + `authnet-charge` edge function).
- Calendly is available as a gateway-enabled App connector (`connector_id: calendly`).

## Proposed approach
Use the **Calendly App connector** (workspace/business account) so the app can read event types and scheduled events on behalf of `mountkailashrejuvenationcenter`. Pre-payment is handled by our existing Authorize.net flow, then the visitor is redirected to a pre-filled Calendly scheduling page. Calendly itself enforces the 30-minute duration, 24-hour minimum notice, and auto-attaches Zoom.

## Plan

### 1. Connect Calendly to the project
- Link the existing `mountkailashrejuvenationcenter` Calendly account via the Calendly App connector (`standard_connectors--connect`, `connector_id: calendly`).
- Verify the connection exposes `CALENDLY_API_KEY` and `LOVABLE_API_KEY` for gateway calls.

### 2. Configure the Calendly event type
- In Calendly, create or edit a 30-minute one-on-one event type named "Private Healing Consultation".
- Set scheduling notice to **24 hours before** (so no same-day/next-day slots within 24h).
- Connect **Zoom** as the location provider so the invite automatically contains a Zoom link.
- Keep Calendly's native payment collection **off**; payment is collected by our app first.
- Copy the event type URI/UUID for the redirect URL.

### 3. Backend: payment-then-schedule flow
- Create a new Supabase Edge Function `calendly-consultation`.
- It accepts `{ name, email, phone, opaqueData, utm_* }`.
- It charges the card via Authorize.net for a fixed consultation fee (e.g. $150 USD) using the existing shared `authnet.ts` helper.
- On success it stores a record in a new `consultation_bookings` table and returns a Calendly pre-filled scheduling URL (`https://calendly.com/mountkailashrejuvenationcenter/30min?name=...&email=...&a1=phone`).
- The table tracks: id, name, email, phone, amount_paid_usd, payment_transaction_id, calendly_event_uri, status, utm fields, created_at.

### 4. Database
- Add `consultation_bookings` table with RLS (admins read all; customers read own via email match).
- Add `consultation_settings` table (or reuse `store_settings`) for the live fee amount and Calendly event slug, editable by admins.

### 5. Homepage consultation area
- Replace the existing `ConsultationCTA` "Begin Your Healing Journey" link with a real booking form.
- The form collects name, email, phone, then shows the Authorize.net card form.
- After payment success, redirect to the Calendly scheduling URL in the same tab.
- Keep the section visually consistent with the current design (gold CTA, portrait, botanical vine).

### 6. Webinar page consultation area
- Add a new `ConsultationBookingBand` component inside `Webinars.tsx`, placed after `WebinarHost` and before `WebinarSignup`.
- Reuse the same booking form component from the homepage so both pages share logic.

### 7. Admin visibility
- Add a lightweight "Consultation Bookings" view inside the existing admin dashboard (`/admin`) showing paid bookings, scheduled Calendly event URIs, and payment status.
- Allow admins to update the consultation fee via a settings card.

### 8. Tracking & notifications
- Fire `cta_click` / `begin_checkout` / `purchase` dataLayer events around the consultation flow.
- Send a confirmation email via the existing Resend setup once payment + Calendly booking is complete.

### 9. Testing
- Verify the 24-hour buffer blocks slots within the next day.
- Verify Zoom link appears in the Calendly invite.
- Verify payment failure does not create a Calendly link.
- Verify admin can see bookings and update pricing.

## Out of scope for this plan
- Recurring subscriptions for consultations.
- Per-user (App User Connector) Calendly accounts.
- Native Calendly payment collection (we keep Authorize.net as the single payment path).

## Open decision before building
What should the consultation fee be? Suggest $150 USD for 30 minutes, but this is configurable in admin settings.
