---
name: Mailchimp sync (WCE 2026)
description: Consent-gated Mailchimp list sync for WCE leads and ticket buyers, audience config, tags, merge fields
type: feature
---
- Audience ID and server prefix live in `wce_settings` (`mailchimp_audience_id`, `mailchimp_server_prefix`), never hardcoded. API key is the `MAILCHIMP_API_KEY` secret, server-side only.
- Consent is absolute: a lead with `consent_marketing = false` is never sent to Mailchimp (status `skipped_no_consent`). Consented leads are upserted as `subscribed` (single opt-in) via PUT to the MD5 hash of the lowercased email. Transactional mail (Resend) never routes through Mailchimp.
- Tags: `WCE2026` + pathway tag (`Symposium-InPerson`, `Symposium-Online`, `Retreat-Applicant`) + `Referral-{CODE}`.
- Merge fields intended: FNAME, LNAME, COUNTRY, WHATSAPP, PATHWAY, REFCODE, UTMSOURCE, UTMMEDIUM, UTMCAMP, UTMCONTENT. The audience currently only has FNAME, LNAME, COUNTRY, REFCODE — the other six must be created in Mailchimp before they populate. Mailchimp silently discards unknown merge tags, so the sync reads the audience merge-field list first and records anything missing as status `synced_partial` with the field names in `mailchimp_error`.
- Statuses stored on `wce_leads`: pending, synced, synced_partial, skipped_no_consent, failed. Admin leads table shows the pill with per-row retry and a "Retry all failed" bulk action.
