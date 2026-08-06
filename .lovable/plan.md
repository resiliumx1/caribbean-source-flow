# Self-hosted consultation booking system

Replaces the Calendly redirect with a fully branded booking system on the main site. Nothing under /wce-2026 or the WCE admin is touched.

## What already exists (inspected)

- `consultation_bookings` — Calendly-era shape (name, email, phone, amount_paid_usd, calendly_event_uri, scheduled_at, UTM columns). **0 rows**, so it can be reshaped in place rather than duplicated.
- `consultation_settings` — one `consultation` row: fee 150, 30 minutes, 24h notice, Calendly username/slug.
- `ConsultationBookingForm.tsx` (pay then redirect to Calendly), `use-consultation-settings.ts`, `ConsultationCTA` on the homepage, `ConsultationBookingBand` on webinars, `AdminConsultations.tsx`, and the `calendly-consultation` edge function.
- Admin nav already has a Consultations entry.

Everything is extended: the same bookings table, the same admin page, the same Authorize.net card form, the same coupons table, the same order email function.

## Delivery in five stages

Because this is large, it lands in reviewable stages. Each stage is verified before the next.

### Stage 1 — Data model and safety rails
- Reshape `consultation_bookings` to the full schema (booking reference, service, practitioner, starts_at/ends_at, timezone, intake answers, status, order link, Zoom fields, manage token, reminder timestamps, cancellation and reschedule fields). Existing UTM and payment columns are kept.
- New tables: `consultation_services`, `consultation_practitioners`, `consultation_availability`, `consultation_availability_overrides`, `consultation_intake_questions`.
- Enable `btree_gist` and add an `EXCLUDE USING gist` constraint so two overlapping bookings for one practitioner in `pending_payment` or `confirmed` cannot both exist.
- RLS: public read on active services, practitioners, availability, overrides and intake questions; admin-only writes. **No anonymous read on bookings at all** — all customer access goes through edge functions. Grants written per table.
- Seed one practitioner (Priest Kailash, America/St_Lucia) and one service from the current settings (Private Healing Consultation, 30 min, $150) so nothing regresses.

### Stage 2 — Availability and booking engine
- `consultation-availability`: expands recurring weekly windows over a date range, applies date overrides with precedence, slices into slots stepped by duration plus buffers, removes slots overlapping existing bookings including their buffers, applies min notice, max advance and max per day, and returns UTC instants. All timezone maths via a proper IANA library, so daylight saving is handled.
- `consultation-book`: the only path that creates a booking. Writes `pending_payment` first, catches the exclusion-constraint violation and returns a friendly "that time was just taken" error.
- `consultation-confirm`: called after payment succeeds; flips to `confirmed`, applies coupon discount, links the order, triggers Zoom and emails.
- `consultation-manage`: token-based read, reschedule and cancel, rate limited.
- Cleanup that releases `pending_payment` holds older than 20 minutes, plus reminder dispatch, both scheduled with pg_cron.

### Stage 3 — Public booking wizard at /consultations
Six steps, matching the site's design system: service, practitioner (auto-skipped when there is one), date and time, details plus intake questions, review with discount code and Authorize.net payment, confirmation with reference, add-to-calendar, Zoom link and manage link.
- Visitor timezone detected automatically and changeable, practitioner's local time shown as a secondary line.
- Progress indicator, lossless back navigation, state in sessionStorage, slots re-fetched periodically, UTM and `?ref=` captured on entry.
- Built mobile-first. `/consultations/manage/:token` for reschedule and cancel with the policy shown.

### Stage 4 — Zoom, emails and calendar files
- `zoom-create-meeting` using Server-to-Server OAuth against `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`. Waiting room on, join-before-host off. Join URL is customer-facing; start URL is admin only.
- If Zoom is missing or fails the booking still succeeds and is flagged in admin with a button to generate or attach a link later. Cancellation deletes the meeting, reschedule updates it.
- `consultation-emails` sibling of `send-order-emails` via Resend: customer confirmation, practitioner and admin notification, reschedule, cancellation, and 24h/1h reminders guarded by the sent-at timestamps.
- `.ics` generated with VTIMEZONE, a stable UID per booking and an incrementing SEQUENCE so reschedules update rather than duplicate.

### Stage 5 — Admin and account
- `/admin/consultations` extended into tabs: dashboard strip (today, upcoming, this week, revenue, no-show rate), calendar with day/week/month and practitioner selector colour-coded by status, bookings list with filters, search and CSV export, booking detail (reschedule, cancel, complete, no-show, resend, Zoom link, internal notes), services CRUD with intake questions, practitioners CRUD with photo upload, and availability editing as a weekly grid plus override calendar.
- Manual booking creation for phone enquiries with an option to skip payment.
- `/account` gains a Consultations section with upcoming and past bookings linking to their manage pages.

## Technical notes

- Timezones: every instant stored as `timestamptz` in UTC. Availability rows are wall-clock times interpreted in the practitioner's IANA zone at that date, so DST shifts are correct. Display conversion happens only in the browser.
- Payment ordering: booking row is written before payment is attempted, so a successful charge can never be orphaned. A failed charge leaves a `pending_payment` row that the cleanup releases.
- Zoom, coupons and email are all treated as non-fatal side effects of confirmation.
- The old `calendly-consultation` function and the Calendly-redirect form stay in place until the wizard is verified, then the homepage and webinar entry points are pointed at `/consultations`.

## Verification

Typecheck and build; a direct test that the exclusion constraint rejects an overlapping insert; an anonymous-client select against `consultation_bookings` proving it returns nothing; a booking made in a non-practitioner timezone checked against both sides; screenshots of the wizard at 1440 and 390 and of the admin calendar. Zoom will need the three secrets before live meeting creation can be verified.
