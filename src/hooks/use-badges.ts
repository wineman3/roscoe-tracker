"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { UserBadge } from "@/lib/types";

export function useBadges() {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [newBadges, setNewBadges] = useState<UserBadge[]>([]);

  const loadUserBadges = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("user_badges")
      .select(
        `
        *,
        badge_definitions(*)
      `
      )
      .eq("user_id", userId)
      .order("earned_at", { ascending: false });

    if (error) {
      console.error("Error loading badges:", error);
      return;
    }

    setBadges(data || []);
  }, []);

  const checkNewBadges = useCallback(async (userId: string) => {
    try {
      await supabase.rpc("check_and_award_badges", {
        p_user_id: userId,
      });

      const { data: earned, error } = await supabase
        .from("user_badges")
        .select(
          `
          *,
          badge_definitions(*)
        `
        )
        .eq("user_id", userId)
        .eq("notified", false)
        .order("earned_at", { ascending: false });

      if (error) throw error;

      if (earned && earned.length > 0) {
        const badgeIds = earned.map((b) => b.id);
        await supabase
          .from("user_badges")
          .update({ notified: true })
          .in("id", badgeIds);

        setNewBadges(earned);
        return earned;
      }

      return [];
    } catch (error) {
      console.error("Error checking badges:", error);
      return [];
    }
  }, []);

  const clearNewBadges = useCallback(() => {
    setNewBadges([]);
  }, []);

  return { badges, newBadges, loadUserBadges, checkNewBadges, clearNewBadges };
}
