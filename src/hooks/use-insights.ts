"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { DateTime } from "luxon";
import type { Walk, Profile } from "@/lib/types";

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface MonthStat {
  key: string;
  label: string;
  miles: number;
  walkCount: number;
  avgMiles: number;
}

export interface DowStat {
  day: string;
  count: number;
  miles: number;
}

export interface InsightsStats {
  totalMiles: number;
  totalWalks: number;
  avgDistance: number;
  currentStreak: number;
  bestWalk: Walk | null;
  bestMonth: MonthStat | null;
  bestDow: DowStat | null;
  longestStreak: number;
  jointWalkPct: number | null;
  monthlyData: MonthStat[];
  dowData: DowStat[];
}

export function useInsights(selectedUserId: string | null) {
  const [allWalks, setAllWalks] = useState<Walk[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [walksRes, profilesRes] = await Promise.all([
      supabase
        .from("walks")
        .select("*, profiles(id, display_name, avatar_color)")
        .order("walked_at", { ascending: true }),
      supabase.from("profiles").select("*"),
    ]);
    setAllWalks(walksRes.data || []);
    setProfiles(profilesRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo<InsightsStats | null>(() => {
    const userWalks = selectedUserId
      ? allWalks.filter((w) => w.user_id === selectedUserId)
      : allWalks;

    // Deduplicate joint walks by session_id in combined mode
    const walks = selectedUserId
      ? userWalks
      : (() => {
          const seen = new Set<string>();
          return userWalks.filter((w) => {
            if (!w.session_id) return true;
            if (seen.has(w.session_id)) return false;
            seen.add(w.session_id);
            return true;
          });
        })();

    if (walks.length === 0) return null;

    const totalMiles = walks.reduce((s, w) => s + w.miles, 0);
    const totalWalks = walks.length;
    const avgDistance = totalMiles / totalWalks;

    const bestWalk = walks.reduce(
      (best, w) => (w.miles > best.miles ? w : best),
      walks[0]
    );

    // Group miles by calendar date for streak + gap calculations
    const byDate = new Map<string, number>();
    for (const w of walks) {
      if (!w.walked_at) continue;
      const date = DateTime.fromISO(w.walked_at, { zone: "local" }).toISODate()!;
      byDate.set(date, (byDate.get(date) ?? 0) + w.miles);
    }
    const sortedDates = [...byDate.keys()].sort();

    // Current streak: consecutive days ending today or yesterday
    let currentStreak = 0;
    const today = DateTime.now().toISODate()!;
    const yesterday = DateTime.now().minus({ days: 1 }).toISODate()!;
    if (byDate.has(today) || byDate.has(yesterday)) {
      let cursor = DateTime.fromISO(byDate.has(today) ? today : yesterday);
      while (byDate.has(cursor.toISODate()!)) {
        currentStreak++;
        cursor = cursor.minus({ days: 1 });
      }
    }

    // Monthly totals
    const byMonth = new Map<string, { miles: number; count: number }>();
    for (const w of walks) {
      if (!w.walked_at) continue;
      const key = DateTime.fromISO(w.walked_at, { zone: "local" }).toFormat("yyyy-MM");
      const prev = byMonth.get(key) ?? { miles: 0, count: 0 };
      byMonth.set(key, { miles: prev.miles + w.miles, count: prev.count + 1 });
    }
    const monthlyData: MonthStat[] = [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, { miles, count }]) => ({
        key,
        label: DateTime.fromISO(key + "-01").toFormat("MMM ''yy"),
        miles,
        walkCount: count,
        avgMiles: count > 0 ? miles / count : 0,
      }));
    const bestMonth =
      monthlyData.length > 0
        ? monthlyData.reduce(
            (best, m) => (m.miles > best.miles ? m : best),
            monthlyData[0]
          )
        : null;

    // Day-of-week breakdown (0=Sun via luxon weekday % 7)
    const dowMiles = Array<number>(7).fill(0);
    const dowCount = Array<number>(7).fill(0);
    for (const w of walks) {
      if (!w.walked_at) continue;
      const dow = DateTime.fromISO(w.walked_at, { zone: "local" }).weekday % 7;
      dowMiles[dow] += w.miles;
      dowCount[dow]++;
    }
    const dowData: DowStat[] = DOW_LABELS.map((day, i) => ({
      day,
      count: dowCount[i],
      miles: dowMiles[i],
    }));
    const bestDow =
      dowData.find((d) => d.count > 0)
        ? dowData.reduce((best, d) => (d.count > best.count ? d : best), dowData[0])
        : null;

    // Longest streak ever
    let longestStreak = 0;
    let run = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        run = 1;
      } else {
        const gap = Math.round(
          DateTime.fromISO(sortedDates[i])
            .diff(DateTime.fromISO(sortedDates[i - 1]), "days")
            .days
        );
        run = gap === 1 ? run + 1 : 1;
      }
      if (run > longestStreak) longestStreak = run;
    }

    // Joint walk % (combined mode only — fraction of deduped walks that were joint sessions)
    let jointWalkPct: number | null = null;
    if (!selectedUserId) {
      const jointCount = walks.filter((w) => w.session_id).length;
      jointWalkPct = totalWalks > 0 ? (jointCount / totalWalks) * 100 : 0;
    }

    return {
      totalMiles,
      totalWalks,
      avgDistance,
      currentStreak,
      bestWalk,
      bestMonth,
      bestDow,
      longestStreak,
      jointWalkPct,
      monthlyData,
      dowData,
    };
  }, [allWalks, selectedUserId]);

  return { profiles, stats, loading };
}
