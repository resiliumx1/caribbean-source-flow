# Set a new admin password for yannick23d@gmail.com

The existing password cannot be recovered — auth stores only a one-way hash. So the fix is to set a fresh one directly on the account.

Confirmed about the account: it exists, email is confirmed, and it already has full admin rights (`is_admin` true). Last sign-in was 4 April 2026. Nothing about its rights or data needs to change.

## What happens

1. You tell me the password you want (reply with it), or say "generate one" and I'll create a strong random one and give it to you once.
2. A protected backend routine sets that password on the account. It requires the existing admin bootstrap secret, so a random caller cannot use it.
3. I verify sign-in works with the new password.
4. Admin rights, email, orders access and notifications stay exactly as they are.

## After it runs

- Store admin: sign in at https://mountkailashslu.com/admin/login with `yannick23d@gmail.com` and the new password.
- The same account also opens the WCE 2026 organiser console at `/admin/wce`.

## Technical notes

- Reuses the existing `bootstrap-admin` edge function: it looks the user up by email, calls the Auth admin API with the service role to update the password, keeps `email_confirm` true, and re-asserts the `is_admin` profile flag.
- Guard: the call must carry the `ADMIN_BOOTSTRAP_TOKEN` secret; no new privileged surface is added.
- Verification: one password sign-in against the auth token endpoint, expecting 200.
- The password is used once for this operation and is not written into any project file.

## Recommendation

Change it afterwards, since it passes through a chat window. Right now `/admin/login` has no "Forgot password" link at all — I can add a self-service reset flow (`/reset-password` page included) so this doesn't need a manual fix next time. Say the word and I'll fold it in.
