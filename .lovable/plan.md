

# Product Image Upload System

## Overview

Build a complete admin system for uploading and managing product images. This includes backend storage infrastructure and a protected admin interface.

## What Will Be Built

### 1. Storage Infrastructure
- Create a `product-images` storage bucket for hosting product photos
- Set up proper RLS policies so only admins can upload/delete images
- Anyone can view images (public read access for the storefront)

### 2. Admin Dashboard
- New protected route at `/admin/products`
- Authentication gate - only users with admin privileges can access
- Product list with image upload capability for each product
- Image preview, upload progress, and delete functionality

### 3. Login/Authentication Flow
- Login page for admin access (since no auth pages exist currently)
- Session management to maintain admin access
- Redirect non-admin users away from admin routes

---

## Technical Details

### Database Migration

```text
+---------------------------+
|   product-images bucket   |
+---------------------------+
| - Public read access      |
| - Admin-only write access |
+---------------------------+
```

Create storage bucket with the following SQL:
- Insert bucket into `storage.buckets` with public access enabled
- RLS policy for SELECT: allow all (public images)
- RLS policy for INSERT/UPDATE/DELETE: only users where `is_admin()` returns true

### New Files to Create

| File | Purpose |
|------|---------|
| `src/pages/AdminLogin.tsx` | Admin login form |
| `src/pages/AdminProducts.tsx` | Product management dashboard |
| `src/components/admin/ProductImageUpload.tsx` | Image upload component with drag-drop |
| `src/components/admin/AdminLayout.tsx` | Protected layout wrapper |
| `src/hooks/use-admin.ts` | Admin auth state and permission checks |

### Route Updates

Add to `App.tsx`:
- `/admin/login` - Admin login page
- `/admin/products` - Product management (protected)

### Image Upload Flow

```text
User selects image
       |
       v
Validate file (type, size)
       |
       v
Upload to storage bucket
       |
       v
Get public URL
       |
       v
Update product.image_url in database
       |
       v
Invalidate product queries (refresh UI)
```

### Security Measures

1. **Authentication Required**: Admin pages require login
2. **Role Verification**: Check `is_admin()` function on server side via RLS
3. **Storage Protection**: Only admins can upload/modify images via RLS policies
4. **File Validation**: Client-side checks for file type (images only) and size limits

---

## Implementation Steps

### Phase 1: Backend Setup
1. Create `product-images` storage bucket via SQL migration
2. Add RLS policies for public read, admin-only write

### Phase 2: Authentication
3. Create `use-admin.ts` hook for auth state management
4. Create `AdminLogin.tsx` page with email/password form
5. Create `AdminLayout.tsx` wrapper that checks admin status

### Phase 3: Product Management UI
6. Create `ProductImageUpload.tsx` component
7. Create `AdminProducts.tsx` page with product list and upload UI
8. Update `App.tsx` with new admin routes

### Phase 4: Integration
9. Wire up image upload to update product records
10. Ensure product cards and detail pages display uploaded images

---

## Expected Result

After implementation, you will be able to:
- Navigate to `/admin/login` and sign in with an admin account
- See a list of all products with their current images (or placeholders)
- Click "Upload Image" on any product to add/replace its photo
- Images automatically appear on the shop page and product detail pages

