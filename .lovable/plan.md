# Reset the admin password for yannick2d@live.com

Set the password you provided on the existing full-admin account `yannick2d@live.com` so you can sign in at `/admin/login`.

## What happens

1. A short-lived, protected backend routine sets the new password directly on the account (no email round-trip, no waiting on a reset link).
2. It is guarded so only a call carrying the existing admin bootstrap secret can use it, and it only accepts this one email address.
3. The password is applied, sign-in is verified once, and then the routine is removed from the project so it cannot be reused.
4. Admin rights on the account are left exactly as they are (`is_admin` stays true).

## After it runs

- Store admin: sign in at https://mountkailashslu.com/admin/login with `yannick2d@live.com` and the new password.
- The same account also opens the WCE 2026 console at `/admin/wce`.
- Nothing else about the account changes — email, orders access, and notifications stay the same.

## Technical notes

- New temporary edge function `admin-set-password`: requires the `ADMIN_BOOTSTRAP_TOKEN` secret in an `x-bootstrap-token` header, hardcodes the allowed email, and calls the Auth admin API with the service role to update the password.
- Verification: one password sign-in against the auth token endpoint, expecting 200.
- Cleanup: the function is deleted immediately after verification, so no lasting privileged surface is added.
- The password you pasted in chat is used once for this operation and not written into any file in the project.

## Recommendation

Change this password from the admin account afterwards, since it was typed into a chat window. I can also add a "change password" screen inside the admin area if you want one.
