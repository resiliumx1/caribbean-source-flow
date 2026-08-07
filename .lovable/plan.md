# Consultations admin: filtered table view + Calendly import

Turn the Bookings tab of `/admin/consultations` into a proper filterable table, and add a manual button that pulls sessions booked through the old Calendly page in as read-only rows so all consultations live in one place.

## What changes for you

**Bookings tab becomes a table.** Columns: date and time (in the practitioner's timezone), customer name and email, session type, practitioner, mode, payment status, amount, source (Site or Calendly), and actions. Sorted by session date, most recent first. Below 768px each row collapses into a card so it stays usable on a phone.

**Three filters above the table**
- Date: preset ranges (today, next 7 days, this month, past sessions) plus a custom from/to range.
- Organizer: dropdown of practitioners. It shows Priest Kailash today and picks up any practitioner added later automatically.
- Payment status: Paid, Awaiting payment, Refunded, Cancelled.

Filters combine, a free-text search box matches name, email and booking reference, and the header shows a count plus the total value of what is currently filtered. A "Clear filters" action resets everything.

**Sync from Calendly button.** Sits at the top of the tab. Pressing it fetches scheduled sessions from your connected Calendly account and stores them as read-only rows. They appear in the table with a Calendly badge, show no recorded payment, and cannot be rescheduled, cancelled or emailed from here — Calendly stays the source of truth for those. Re-running the sync updates existing rows and adds anything new rather than duplicating. The button shows progress and a result summary (added / updated / skipped), with the last sync time beside it.

Imported Calendly sessions are kept out of the site's availability engine, so they will not block or be blocked by native bookings.

## Technical notes

- Link the existing workspace Calendly connection to this project so `CALENDLY_API_KEY` is available to backend code. All Calendly calls go through the Lovable connector gateway.
- New table `consultation_calendly_events`: `calendly_event_uri` (unique), `calendly_invitee_uri`, `organizer_name`, `organizer_email`, `event_name`, `starts_at`, `ends_at`, `invitee_name`, `invitee_email`, `invitee_timezone`, `status`, `location_type`, `join_url`, `raw` jsonb, `synced_at`. Admin-only RLS via `public.is_admin()`, with GRANTs for `authenticated` and `service_role`; no `wce_admin` access. Kept separate from `consultation_bookings` so the overlap-exclusion constraint and the payment/manage flows stay untouched.
- New edge function `consultation-calendly-sync`: verifies the caller is a full admin, resolves the Calendly user and organization via `/users/me`, pages `/scheduled_events` (plus `/scheduled_events/{uuid}/invitees` for attendee details), upserts on `calendly_event_uri`, and returns counts. Surfaces the gateway status and body verbatim on failure.
- Frontend: extract the bookings tab into `src/components/admin/consultations/BookingsTable.tsx` with a `useMemo` filter pipeline over a combined list of native bookings and imported Calendly events mapped to one row shape. Payment status derives from existing booking fields (`status`, refunded amount, `payment_transaction_id`); Calendly rows report none. Reuse existing shadcn table, select, popover-calendar and badge components and the site design system — no new styling language.
- No changes to `/wce-2026`, the WCE admin, or any `wce_` table.

## Verification

Typecheck and build; a signed-in admin run of the sync against the live Calendly connection confirming counts and idempotency on a second run; an anonymous select against the new table proving it returns nothing; screenshots of the table at 1440 and 390 with filters applied.