"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Walk } from "@/lib/types";

export function useCalendarWalks(year: number, month: number) {
  const [walksByDate, setWalksByDate] = useState<Map<string, Walk[]>>(new Map());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    // Get first and last day of the month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const { data, error } = await supabase
      .from("walks")
      .select(
        `
        *,
        profiles(id, display_name, avatar_color)
      `
      )
      .gte("walked_at", startDate.toISOString())
      .lte("walked_at", endDate.toISOString())
      .order("walked_at", { ascending: true });

    if (error) {
      console.error("Error loading calendar walks:", error);
      setLoading(false);
      return;
    }

    // Group walks by local date (YYYY-MM-DD)
    const grouped = new Map<string, Walk[]>();
    for (const walk of data || []) {
      if (walk.walked_at) {
        const d = new Date(walk.walked_at);
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const existing = grouped.get(dateKey) || [];
        grouped.set(dateKey, [...existing, walk]);
      }
    }

    setWalksByDate(grouped);
    setLoading(false);
  }, [year, month]);

  useEffect(() => {
    load();

    const channel = supabase
      .channel(`calendar-walks-${year}-${month}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "walks",
        },
        async (payload) => {
          // Reload on any change to keep calendar in sync
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE" || payload.eventType === "DELETE") {
            load();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, year, month]);

  return { walksByDate, loading, reload: load };
}
