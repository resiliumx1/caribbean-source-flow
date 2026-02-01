

# Create Admin Account

## Overview

Set up an admin user account for `yannick23d@gmail.com` so you can access the admin dashboard and upload product images.

## What Will Be Done

### 1. Create User Account
- Add your email to Supabase Auth with a secure password
- This creates the authentication record

### 2. Set Admin Privileges
- The `handle_new_user()` trigger will automatically create a profile record
- Update the profile to set `is_admin = true`

## Technical Details

### Step 1: Create Auth User via Edge Function

Since we cannot create users directly from SQL, we will create a simple edge function that uses the Supabase Admin API to create your account.

**New File: `supabase/functions/create-admin-user/index.ts`**
- Uses the service role key to create a user via `supabase.auth.admin.createUser()`
- Sets a temporary password that you can change later
- Only runs once to bootstrap the first admin

### Step 2: Set Admin Flag

After the user is created, run a migration to set the admin flag:

```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'yannick23d@gmail.com';
```

### Step 3: Login Credentials

After setup, you will log in with:
- **Email**: `yannick23d@gmail.com`
- **Password**: A temporary password (I will provide it after creation)

You should change your password after first login via Supabase Auth's password reset flow.

---

## Implementation Steps

1. Create edge function `create-admin-user` that creates the user with your email
2. Deploy and call the edge function once to create your account
3. Run SQL migration to set `is_admin = true` on your profile
4. Test login at `/admin/login`

---

## Security Notes

- The edge function will be a one-time bootstrap tool
- After your account is created, the function can be removed
- Your password will be set securely and you'll be prompted to change it

