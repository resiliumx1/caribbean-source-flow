## Create new admin user

Create a fully provisioned admin account:

- **Email:** `admin123@mountkailashslu.com`
- **Password:** `itopia1!`
- **Login URL:** `/admin/login`

### Steps

1. Run a database migration that:
   - Inserts the user into `auth.users` with email pre-confirmed and password `itopia1!` (bcrypt-hashed via `crypt()`).
   - Inserts the matching `profiles` row with `is_admin = true` (the `handle_new_user` trigger creates the profile; the migration then flips `is_admin`).
   - Uses `ON CONFLICT (email) DO NOTHING` on the auth insert so re-running is safe; if the user already exists, just updates the password and admin flag.

2. No frontend code changes — `AdminLogin.tsx` and `useAdmin` already handle email/password sign-in and `is_admin` checks.

### Notes

- Password `itopia1!` is weak by HIBP standards. If leaked-password protection is on, signup would block it, but direct inserts bypass that check — it will work, but consider changing it after first login.
- Existing admin `yannick23d@gmail.com` is untouched.
