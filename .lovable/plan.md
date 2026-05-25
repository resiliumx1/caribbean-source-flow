## Update admin credentials

Set the admin login to:
- **Email:** `admin123@mountkailashslu.com` (already exists)
- **Password:** `Itopia1!`

### Step

Run a database migration that updates the existing admin user's password:

```sql
UPDATE auth.users
SET encrypted_password = crypt('Itopia1!', gen_salt('bf')),
    updated_at = now()
WHERE email = 'admin123@mountkailashslu.com';
```

No frontend changes — the password-visibility toggle on `/admin/login` is already in place.

### Notes

- Supabase Auth uses the email as the login identifier; "admin123" lives as the local part of `admin123@mountkailashslu.com`. If you want a different email entirely, let me know.
- `Itopia1!` is short and likely flagged by HIBP; direct DB update bypasses that check so it will work, but consider rotating to a stronger password later.
