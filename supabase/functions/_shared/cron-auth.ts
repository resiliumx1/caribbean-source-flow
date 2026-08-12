/** Authorization for scheduled (cron) edge functions.
 *
 *  These functions send bulk customer email, so they must never be callable by
 *  the public. A caller is accepted only when it presents the service role key
 *  (how pg_cron / internal invocations sign requests) or the CRON_SECRET shared
 *  secret in the `x-cron-secret` header.
 */
export function isAuthorizedCronCaller(req: Request): boolean {
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const cronSecret = Deno.env.get("CRON_SECRET") ?? "";

  const header = req.headers.get("Authorization") ?? "";
  const bearer = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (serviceRoleKey && bearer === serviceRoleKey) return true;
  if (serviceRoleKey && (req.headers.get("apikey") ?? "") === serviceRoleKey) return true;

  const provided = (req.headers.get("x-cron-secret") ?? "").trim();
  if (cronSecret && provided === cronSecret) return true;

  return false;
}

export function cronUnauthorized(extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { ...extraHeaders, "Content-Type": "application/json" },
  });
}