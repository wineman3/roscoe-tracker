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

    // Provide defaults for nullable fields
    const normalized = (data || []).map((row) => ({
      id: row.id ?? "",
      display_name: row.display_name ?? "Unknown",
      total_miles: row.total_miles ?? 0,
      total_walks: row.total_walks ?? 0,
      last_walk_date: row.last_walk_date,
      week_miles: row.week_miles ?? 0,
      month_miles: row.month_miles ?? 0,
    }));
    setStats(normalized);
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
            const normalized = data.map((row) => ({
              id: row.id ?? "",
              display_name: row.display_name ?? "Unknown",
              total_miles: row.total_miles ?? 0,
              total_walks: row.total_walks ?? 0,
              last_walk_date: row.last_walk_date,
              week_miles: row.week_miles ?? 0,
              month_miles: row.month_miles ?? 0,
            }));
            setStats(normalized);
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
