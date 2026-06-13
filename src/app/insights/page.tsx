"use client";

import { useState } from "react";
import { DateTime } from "luxon";
import { useAuth } from "@/hooks/use-auth";
import { useInsights } from "@/hooks/use-insights";
import type { InsightsStats, MonthStat, DowStat } from "@/hooks/use-insights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import type { Profile } from "@/lib/types";

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color = "text-blue-600",
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-blank rounded-base border-2 border-border p-4 shadow-shadow">
      <p className={`text-2xl font-heading ${color}`}>{value}</p>
      <p className="text-xs text-text/60 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-text/40 mt-0.5">{sub}</p>}
    </div>
  );
}

function HighlightCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-bg rounded-base border-2 border-border p-4">
      <p className="text-xl mb-1">{icon}</p>
      <p className="text-xs text-text/60 font-heading uppercase tracking-wide">{label}</p>
      <p className="text-lg font-heading text-text mt-0.5">{value}</p>
      {sub && <p className="text-xs text-text/50 mt-0.5">{sub}</p>}
    </div>
  );
}

function MonthlyChart({ data }: { data: MonthStat[] }) {
  const [mode, setMode] = useState<"total" | "avg">("total");
  const recent = data.slice(-12);
  const getValue = (m: MonthStat) => (mode === "total" ? m.miles : m.avgMiles);
  const maxVal = Math.max(...recent.map(getValue), 1);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => setMode("total")}
          className={`text-xs px-3 py-1 rounded-base border-2 border-border font-heading transition-all ${
            mode === "total" ? "bg-main shadow-shadow" : "bg-blank hover:bg-main/20"
          }`}
        >
          Total
        </button>
        <button
          onClick={() => setMode("avg")}
          className={`text-xs px-3 py-1 rounded-base border-2 border-border font-heading transition-all ${
            mode === "avg" ? "bg-main shadow-shadow" : "bg-blank hover:bg-main/20"
          }`}
        >
          Avg per Walk
        </button>
      </div>
      <div className="flex items-end gap-1 h-28">
        {recent.map((m) => {
          const val = getValue(m);
          const pct = Math.max((val / maxVal) * 100, 2);
          const tooltip =
            mode === "total"
              ? `${m.label}: ${m.miles.toFixed(1)} mi (${m.walkCount} walks)`
              : `${m.label}: ${m.avgMiles.toFixed(2)} mi avg`;
          return (
            <div
              key={m.key}
              className="flex-1 flex flex-col items-center justify-end group relative"
              style={{ height: "100%" }}
            >
              <div
                className="absolute bottom-0 w-full bg-blue-400 border-2 border-border rounded-t-base transition-all group-hover:bg-blue-500"
                style={{ height: `${pct}%` }}
                title={tooltip}
              />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-text text-blank text-xs px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                {mode === "total" ? `${m.miles.toFixed(1)} mi` : `${m.avgMiles.toFixed(2)} mi`}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-1">
        {recent.map((m) => (
          <div key={m.key} className="flex-1 text-center">
            <span
              className="text-text/40 block"
              style={{ fontSize: "9px", lineHeight: "1.2" }}
            >
              {m.label.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DowChart({ data }: { data: DowStat[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div>
      <div className="flex items-end gap-2 h-20">
        {data.map((d) => {
          const pct = Math.max((d.count / maxCount) * 100, d.count > 0 ? 4 : 0);
          return (
            <div
              key={d.day}
              className="flex-1 flex flex-col items-center justify-end group relative"
              style={{ height: "100%" }}
            >
              <div
                className="absolute bottom-0 w-full bg-green-400 border-2 border-border rounded-t-base transition-all group-hover:bg-green-500"
                style={{ height: `${pct}%` }}
                title={`${d.day}: ${d.count} walk${d.count !== 1 ? "s" : ""}`}
              />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-text text-blank text-xs px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                {d.count} walk{d.count !== 1 ? "s" : ""}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 mt-2">
        {data.map((d) => (
          <div key={d.day} className="flex-1 text-center">
            <span className="text-xs text-text/40">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserFilter({
  profiles,
  selectedUserId,
  onChange,
  currentUserId,
}: {
  profiles: Profile[];
  selectedUserId: string | null;
  onChange: (id: string | null) => void;
  currentUserId: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-4 py-2 rounded-base border-2 border-border text-sm font-heading transition-all ${
          selectedUserId === null
            ? "bg-main shadow-shadow"
            : "bg-blank hover:bg-main/20"
        }`}
      >
        Combined
      </button>
      {profiles.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-base border-2 border-border text-sm font-heading transition-all ${
            selectedUserId === p.id
              ? "bg-main shadow-shadow"
              : "bg-blank hover:bg-main/20"
          }`}
        >
          <span
            className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-white text-xs font-heading flex-shrink-0"
            style={{ backgroundColor: p.avatar_color ?? "#3B82F6" }}
          >
            {p.display_name?.[0]?.toUpperCase()}
          </span>
          {p.display_name}
          {p.id === currentUserId && (
            <span className="text-text/50 font-base">(You)</span>
          )}
        </button>
      ))}
    </div>
  );
}

function InsightsSummary({
  stats,
  selectedUserId,
}: {
  stats: InsightsStats;
  selectedUserId: string | null;
}) {
  const bestWalkDate = stats.bestWalk?.walked_at
    ? DateTime.fromISO(stats.bestWalk.walked_at, { zone: "local" }).toFormat(
        "MMM d, yyyy"
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Hero stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Miles"
          value={stats.totalMiles.toFixed(1)}
          color="text-blue-600"
        />
        <StatCard
          label="Avg Walk Distance"
          value={`${stats.avgDistance.toFixed(2)} mi`}
          color="text-green-600"
        />
        <StatCard
          label="Total Walks"
          value={String(stats.totalWalks)}
          color="text-purple-600"
        />
        <StatCard
          label="Current Streak"
          value={`${stats.currentStreak} day${stats.currentStreak !== 1 ? "s" : ""}`}
          color="text-orange-500"
        />
      </div>

      {/* Highlights */}
      <Card>
        <CardHeader>
          <CardTitle>Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stats.bestMonth && (
              <HighlightCard
                icon="📅"
                label="Best Month"
                value={stats.bestMonth.label}
                sub={`${stats.bestMonth.miles.toFixed(1)} mi`}
              />
            )}
            {stats.bestWalk && (
              <HighlightCard
                icon="🏆"
                label="Longest Walk"
                value={`${stats.bestWalk.miles} mi`}
                sub={bestWalkDate ?? undefined}
              />
            )}
            {stats.bestDow && (
              <HighlightCard
                icon="📆"
                label="Most Active Day"
                value={stats.bestDow.day}
                sub={`${stats.bestDow.count} walk${stats.bestDow.count !== 1 ? "s" : ""}`}
              />
            )}
            {stats.longestStreak > 0 && (
              <HighlightCard
                icon="🔥"
                label="Longest Streak"
                value={`${stats.longestStreak} day${stats.longestStreak !== 1 ? "s" : ""}`}
                sub="consecutive days"
              />
            )}
            {selectedUserId === null && stats.jointWalkPct !== null && (
              <HighlightCard
                icon="🐾"
                label="Walked Together"
                value={`${Math.round(stats.jointWalkPct)}%`}
                sub="of walks were joint"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly chart */}
      {stats.monthlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Miles by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyChart data={stats.monthlyData} />
          </CardContent>
        </Card>
      )}

      {/* Day of week chart */}
      <Card>
        <CardHeader>
          <CardTitle>Walks by Day of Week</CardTitle>
        </CardHeader>
        <CardContent>
          <DowChart data={stats.dowData} />
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { profiles, stats, loading } = useInsights(selectedUserId);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-text mx-auto" />
          <p className="mt-4 text-text/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b-2 border-border bg-blank">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/icons/cartoon_roscoe.png" alt="Roscoe" width={36} height={36} />
            <h1 className="text-2xl font-heading text-text">Roscoe Tracker</h1>
          </div>
          {user ? (
            <Button variant="ghost" onClick={signOut}>
              Sign Out
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-text/70 hover:text-text transition-colors"
        >
          &larr; Back to Dashboard
        </Link>

        <div className="bg-main rounded-base border-2 border-border p-6 shadow-shadow">
          <h2 className="text-2xl font-heading text-text">Insights</h2>
          <p className="text-text/70 mt-1">How&apos;s Roscoe doing overall?</p>
        </div>

        {profiles.length > 0 && (
          <UserFilter
            profiles={profiles}
            selectedUserId={selectedUserId}
            onChange={setSelectedUserId}
            currentUserId={user?.id ?? ""}
          />
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-text" />
          </div>
        ) : stats ? (
          <InsightsSummary stats={stats} selectedUserId={selectedUserId} />
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-text/60">
              No walks recorded yet. Start logging to see insights!
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
