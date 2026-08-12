/** Internal edge-function invocation with service-role authorization.
 *
 *  The default `supabase.functions.invoke(...)` inside an edge function inherits
 *  the incoming request's auth context (anon/user token), which causes the
 *  called function to reject internal callers that require the service role key.
 *  This helper explicitly signs the request with the service role key so
 *  internal functions can authenticate each other.
 */
export async function invokeFunction<T = unknown>(
  name: string,
  body: unknown,
): Promise<{ data: T | null; error: Error | null }> {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !serviceRoleKey) {
    return { data: null, error: new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set") };
  }

  const url = `${SUPABASE_URL}/functions/v1/${name}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null) as T | null;
    if (!res.ok) {
      const message = (data as any)?.error || `Function ${name} returned ${res.status}`;
      return { data, error: new Error(message) };
    }
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
  }
}
