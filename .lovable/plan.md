

# Fix Admin Login - Password Reset

The account `yannick23d@gmail.com` exists in the database with admin privileges, but the password appears to be incorrect. The previous account creation may not have set the password properly.

## What needs to happen

1. Create a temporary edge function to reset the password for the existing user using the Supabase Admin API (`updateUserById`)
2. Set the password to `123456` as requested
3. Delete the temporary edge function immediately after use (security best practice)

## Steps

1. **Create** `supabase/functions/reset-admin-pw/index.ts` - a one-time edge function that calls `supabase.auth.admin.updateUserById()` to set the password
2. **Deploy and invoke** the function to reset the password
3. **Delete** the edge function and its files
4. **Verify** login works at `/admin/login`

No frontend changes needed -- this is purely a backend credential fix.

