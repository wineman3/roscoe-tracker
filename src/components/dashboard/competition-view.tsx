"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserStats } from "@/lib/types";

interface CompetitionViewProps {
  stats: UserStats[];
  currentUserId?: string;
}

export function CompetitionView({
  stats,
  currentUserId,
}: CompetitionViewProps) {
  const sortedStats = useMemo(
    () => [...stats].sort((a, b) => b.total_miles - a.total_miles),
    [stats],
  );

  const leader = sortedStats[0];
  const difference = useMemo(
    () =>
      sortedStats.length >= 2
        ? Math.abs(sortedStats[0].total_miles - sortedStats[1].total_miles)
        : 0,
    [sortedStats],
  );
  const combinedTotal = useMemo(
    () => stats.reduce((sum, user) => sum + user.total_miles, 0),
    [stats],
  );

  if (stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>The Competition</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-text/60">
            No data yet. Start logging walks!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>The Competition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedStats.map((user, index) => {
            const isLeader = user.id === leader?.id && difference > 0;
            return (
              <div
                key={user.id}
                className={`relative p-4 rounded-base border-2 border-border ${
                  isLeader ? "bg-yellow-100" : "bg-bg"
                }`}
              >
                {isLeader && (
                  <div className="absolute -top-3 -right-3 text-3xl animate-bounce">
                    👑
                  </div>
                )}

                <div className="flex items-center gap-4 mb-3">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-heading border-2 border-border"
                    style={{
                      backgroundColor: index === 0 ? "#3B82F6" : "#10B981",
                    }}
                  >
                    {user.display_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-heading text-text">
                      {user.display_name}
                      {user.id === currentUserId && (
                        <span className="text-sm text-text/60 ml-1">(You)</span>
                      )}
                    </h4>
                    {isLeader && (
                      <p className="text-sm text-yellow-800 font-heading">
                        +{difference.toFixed(1)} mi ahead!
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blank p-3 rounded-base border-2 border-border">
                    <p className="text-2xl font-heading text-blue-600">
                      {user.total_miles.toFixed(1)}
                    </p>
                    <p className="text-xs text-text/60">Total Miles</p>
                  </div>
                  <div className="bg-blank p-3 rounded-base border-2 border-border">
                    <p className="text-2xl font-heading text-green-600">
                      {user.total_walks}
                    </p>
                    <p className="text-xs text-text/60">Walks</p>
                  </div>
                  <div className="bg-blank p-3 rounded-base border-2 border-border">
                    <p className="text-lg font-heading text-purple-600">
                      {user.week_miles.toFixed(1)}
                    </p>
                    <p className="text-xs text-text/60">This Week</p>
                  </div>
                  <div className="bg-blank p-3 rounded-base border-2 border-border">
                    <p className="text-lg font-heading text-orange-600">
                      {user.month_miles.toFixed(1)}
                    </p>
                    <p className="text-xs text-text/60">This Month</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-main rounded-base border-2 border-border p-6 text-center shadow-shadow">
          <p className="text-sm font-heading mb-1 text-text/80">
            Roscoe&apos;s Total Journey
          </p>
          <p className="text-4xl font-heading text-text">
            {combinedTotal.toFixed(1)} miles
          </p>
          <p className="text-sm text-text/60 mt-1">Combined by both of you!</p>
        </div>
      </CardContent>
    </Card>
  );
}
