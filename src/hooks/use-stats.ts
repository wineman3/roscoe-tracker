"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { UserStats } from "@/lib/types";

export function useStats() {
  const [stats, setStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("user_stats").select("*");

    if (error) {
      console.error("Error loading stats:", error);
      return;
    }

    setStats(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();

    const channel = supabase
      .channel("stats-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "walks",
        },
        async () => {
          const { data } = await supabase.from("user_stats").select("*");
          if (data) {
            setStats(data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const combinedMiles = useMemo(
    () => stats.reduce((sum, user) => sum + user.total_miles, 0),
    [stats]
  );

  return { stats, loading, combinedMiles, reload: load };
}
