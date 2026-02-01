import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AdminState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
}

export function useAdmin() {
  const [state, setState] = useState<AdminState>({
    user: null,
    isAdmin: false,
    isLoading: true,
  });

  useEffect(() => {
    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Use setTimeout to prevent potential race conditions
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("is_admin")
              .eq("id", session.user.id)
              .single();

            setState({
              user: session.user,
              isAdmin: profile?.is_admin ?? false,
              isLoading: false,
            });
          }, 0);
        } else {
          setState({
            user: null,
            isAdmin: false,
            isLoading: false,
          });
        }
      }
    );

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();

        setState({
          user: session.user,
          isAdmin: profile?.is_admin ?? false,
          isLoading: false,
        });
      } else {
        setState({
          user: null,
          isAdmin: false,
          isLoading: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    ...state,
    signIn,
    signOut,
  };
}
