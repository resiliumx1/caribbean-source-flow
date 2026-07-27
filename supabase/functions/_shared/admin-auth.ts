import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export function serviceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

export interface AdminUser {
  id: string;
  email: string;
}

/**
 * Verify the caller's bearer token and confirm they are an admin.
 * Throws when the token is missing/invalid or the profile is not an admin.
 */
export async function requireAdmin(req: Request): Promise<AdminUser> {
  const header = req.headers.get("Authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) throw new Error("Not authenticated.");

  const svc = serviceClient();
  const { data: userRes, error } = await svc.auth.getUser(token);
  const user = userRes?.user;
  if (error || !user) throw new Error("Not authenticated.");

  const { data: profile } = await svc
    .from("profiles").select("is_admin,email").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) throw new Error("Admin access required.");

  return { id: user.id, email: profile.email ?? user.email ?? "" };
}
