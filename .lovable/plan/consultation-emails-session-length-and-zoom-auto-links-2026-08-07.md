# Consultation emails, session length, and Zoom auto-links

## 1. Session length: 30–45 minutes

The one session type is currently set to 60 minutes with a 15-minute gap after. Change it to:

- Booked block: **45 minutes** (so a session that runs short at 30 minutes still fits, and nothing overruns)
- Gap after each session: 15 minutes (unchanged)
- Wording everywhere the client sees it: "45 minutes (typically 30–45)"

This flows into the booking wizard, the confirmation email, the calendar invitation, and the admin table automatically, since they all read the session record.

If you would rather offer two separate choices ("30 minute session" and "45 minute session" at different prices), say so and I will set up two session types instead.

## 2. Automated email confirmations

### After payment (native site bookings)
A branded confirmation already goes out the moment payment succeeds, with the reference, both time zones, duration, format, amount paid, a calendar attachment, and a manage-booking link. What gets added:

- The Zoom join link as the main button, not just a table row
- A clearly boxed disclaimer block (draft below)
- A short "what to prepare" line: your questions, current concerns, any history you want discussed

### Before the meeting
The 24-hour and 1-hour reminders already exist and run on a schedule. They will be updated to always carry the Zoom join link and the same disclaimer, so nobody has to dig for the original email.

### After a Calendly booking
Calendly sends its own confirmation, so ours would be a second email. Default in this plan:

- When a Calendly session is newly imported, send our branded confirmation (Zoom link taken from Calendly, plus the disclaimer) only for sessions still in the future — never for past ones
- A "Send confirmation" button on each Calendly row in the admin table for on-demand sends
- Every send is recorded so the same person is never emailed twice automatically

### Draft disclaimer wording (change any of it)

> Consultation fees are non-refundable. Sessions may be rescheduled once with at least 24 hours' notice.
>
> This consultation is educational and consultative in nature. It does not constitute medical diagnosis, treatment, or a doctor–patient relationship, and it is not a substitute for care from your licensed physician. Do not stop or change prescribed medication based on this session. In an emergency, contact your local emergency services.

## 3. Zoom: where to find the details

Zoom links can be created automatically for every booking and included in the confirmation and reminders. Zoom needs one app created in your account:

1. Sign in at **marketplace.zoom.us** with the account that hosts the consultations
2. **Develop → Build App → Server-to-Server OAuth → Create**, name it "Mount Kailash Bookings"
3. On the **App Credentials** screen, copy the three values shown there: Account ID, Client ID, Client Secret
4. Under **Scopes**, add: `meeting:write:admin`, `meeting:read:admin`, `user:read:admin`
5. Click **Activate your app**

Then paste the three values into a secure form I will open, and set the host email (the Zoom account's own login email) on the practitioner record in the consultations admin.

Requirements: the Zoom account must be on a plan where Server-to-Server OAuth is available, and you must be an account owner or admin to create the app. Until those three values are saved, bookings still confirm normally — the email says "link to follow" and the admin table keeps its "Create Zoom room" button.

### How it will then work end to end

```text
Client books and pays
  -> Zoom meeting created automatically for that exact time
  -> Confirmation email: Zoom button + calendar invite + disclaimer
  -> 24h before: reminder with the same link
  -> 1h before:  reminder with the same link
  -> Host start link goes to your internal notification, never to the client
```

Rescheduling updates the same Zoom meeting and re-sends; cancelling withdraws it.

## Technical notes

- Update the seeded row in `consultation_services` (duration 45); no schema change needed
- `_shared/consultation-email.ts`: add a disclaimer block and a "join" primary button; include the link in `reminder_24h` / `reminder_1h`
- Zoom secrets `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET` are already read by `_shared/zoom.ts`; requested through the secure secret form
- `consultation-pay` already calls the confirmation send after a successful charge — it gains an automatic Zoom-create attempt before sending
- Calendly sends: new `sent_confirmation_at` column on `consultation_calendly_events`, auto-send for future unsent rows during sync, plus a per-row manual action wired to the existing admin function