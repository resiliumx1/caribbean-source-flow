# Hook up Zoom auto-created meeting links

## Don't paste secrets in chat

Please don't paste the Zoom credentials into the chat — chat messages aren't a safe place for secrets. Once you approve this, I'll open a secure form where you enter the three values directly; they get stored encrypted and are only readable by the backend.

## What I need from you

From marketplace.zoom.us → Develop → Build App → Server-to-Server OAuth → your app → App Credentials:

- Account ID
- Client ID
- Client Secret

Scopes on that app: `meeting:write:admin`, `meeting:read:admin`, `user:read:admin`, then Activate.

I also need the Zoom host login email (the account that will host the sessions) — that one is not a secret, so you can type it in chat.

## What happens after the values are saved

1. Secure form opens for `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`.
2. I set the host email on the practitioner record in the consultations admin.
3. I run a live test: create a real Zoom meeting for a throwaway future time, confirm the join link comes back, then delete that test meeting.
4. Confirm the confirmation email and both reminders render the gold "Join your session on Zoom" button with the real link.

From then on: every paid online consultation gets a Zoom meeting created automatically at booking time, the link is stored on the booking, and it goes out in the confirmation plus the 24-hour and 1-hour reminders. Reschedules update the same meeting; cancellations remove it. Existing bookings with no link keep the admin "Create Zoom room" button, which will now succeed.

## Technical notes

No code changes needed — `_shared/zoom.ts` already reads those three env vars, and `consultation-pay` and `zoom-create-meeting` already call it. The only work is storing the secrets, setting `consultation_practitioners.zoom_user_email`, and verifying end to end.
