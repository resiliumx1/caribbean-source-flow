import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface WceAccessState {
  user: User | null;
  /** Full store admin (profiles.is_admin) — unrestricted. */
  isFullAdmin: boolean;
  /** Holds wce_admin, or is a full admin. Mirrors public.has_wce_access(). */
  hasWceAccess: boolean;
  isLoading: boolean;
}

const EMPTY: WceAccessState = {
  user: null,
  isFullAdmin: false,
  hasWceAccess: false,
  isLoading: false,
};

async function resolve(user: User): Promise<WceAccessState> {
  const [profileRes, wceRes] = await Promise.all([
    supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle(),
    (supabase.rpc as any)("has_wce_access", { _user_id: user.id }),
  ]);
  const isFullAdmin = profileRes.data?.is_admin ?? false;
  return {
    user,
    isFullAdmin,
    hasWceAccess: Boolean(wceRes.data) || isFullAdmin,
    isLoading: false,
  };
}

/**
 * Client-side convenience only. The real boundary is the RLS policies that call
 * public.has_wce_access(auth.uid()) — this hook exists purely so the UI does not
 * render areas the user cannot use.
 */
export function useWceAccess() {
  const [state, setState] = useState<WceAccessState>({ ...EMPTY, isLoading: true });

  useEffect(() => {
    let active = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        if (active) setState(EMPTY);
        return;
      }
      // Defer so we never call other supabase APIs inside the callback.
      setTimeout(async () => {
        const next = await resolve(session.user);
        if (active) setState(next);
      }, 0);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        if (active) setState(EMPTY);
        return;
      }
      const next = await resolve(session.user);
      if (active) setState(next);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}