"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Walk } from "@/lib/types";

export function useWalks() {
  const [walks, setWalks] = useState<Walk[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("walks")
      .select(
        `
        *,
        profiles(id, display_name, avatar_color)
      `
      )
      .order("walked_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error loading walks:", error);
      return;
    }

    setWalks(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();

    const channel = supabase
      .channel("walks-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "walks",
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const { data } = await supabase
              .from("walks")
              .select(
                `
                *,
                profiles(id, display_name, avatar_color)
              `
              )
              .eq("id", payload.new.id)
              .single();

            if (data) {
              setWalks((prev) => [data, ...prev].slice(0, 50));
            }
          } else if (payload.eventType === "UPDATE") {
            setWalks((prev) =>
              prev.map((w) =>
                w.id === payload.new.id ? { ...w, ...payload.new } : w
              )
            );
          } else if (payload.eventType === "DELETE") {
            setWalks((prev) =>
              prev.filter((w) => w.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const addWalk = async (miles: number, notes: string, userId: string, date?: string) => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    // If selected date is today, use current time; otherwise use noon for that date
    const walked_at = !date || date === today
      ? now.toISOString()
      : new Date(`${date}T12:00:00`).toISOString();
    const { data, error } = await supabase
      .from("walks")
      .insert({
        user_id: userId,
        miles,
        notes,
        walked_at,
      })
      .select(
        `
        *,
        profiles(id, display_name, avatar_color)
      `
      )
      .single();

    if (error) throw error;

    setWalks((prev) => [data, ...prev]);
    return data;
  };

  const deleteWalk = async (walkId: string) => {
    const { error } = await supabase.from("walks").delete().eq("id", walkId);
    if (error) throw error;
    setWalks((prev) => prev.filter((w) => w.id !== walkId));
  };

  return { walks, loading, addWalk, deleteWalk, reload: load };
}
