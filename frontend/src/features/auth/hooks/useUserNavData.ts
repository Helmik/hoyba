"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function useUserNavData() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profileRole, setProfileRole] = useState<string | null>(null);

  const fetchUserData = useCallback(async (activeUser: SupabaseUser | null) => {
    if (!activeUser) {
      setProfileRole(null);
      return;
    }
    const supabase = createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", activeUser.id)
      .single();

    if (profile?.role) setProfileRole(profile.role);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
      fetchUserData(currentUser);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      fetchUserData(nextUser);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  return { user, setUser, profileRole };
}
