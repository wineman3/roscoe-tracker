"use client";

import { useState, useMemo } from "react";
import { DateTime } from "luxon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Walk } from "@/lib/types";

interface RecentWalksProps {
  walks: Walk[];
  currentUserId?: string;
  onDelete?: (walkId: string) => Promise<void>;
}

function formatDate(dateString: string) {
  const dt = DateTime.fromISO(dateString, { zone: "local" });
  const now = DateTime.now();
  const diffInDays = now.startOf("day").diff(dt.startOf("day"), "days").days;

  if (diffInDays < 1) {
    // Today — show relative time (e.g. "3 hours ago")
    return dt.toRelative({ style: "long" }) ?? "just now";
  } else if (diffInDays < 7) {
    // This week — show calendar-day relative (e.g. "yesterday", "2 days ago")
    return dt.toRelativeCalendar() ?? dt.toLocaleString(DateTime.DATE_MED);
  } else {
    return dt.toLocaleString({ month: "short", day: "numeric" });
  }
}

interface DisplayWalk extends Walk {
  partnerName?: string;
}

export function RecentWalks({ walks, currentUserId, onDelete }: RecentWalksProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Merge linked walks: hide the secondary (linked) walk, show both names on the primary
  const displayWalks = useMemo<DisplayWalk[]>(() => {
    // Map: primary walk id -> secondary walk (the one with linked_walk_id set)
    const linkedTo = new Map<string, Walk>();
    for (const walk of walks) {
      if (walk.linked_walk_id) {
        linkedTo.set(walk.linked_walk_id, walk);
      }
    }

    return walks
      .filter((w) => !w.linked_walk_id) // hide secondary walks
      .map((walk) => {
        const partner = linkedTo.get(walk.id);
        if (partner) {
          return {
            ...walk,
            partnerName: partner.profiles?.display_name ?? undefined,
          };
        }
        return walk;
      });
  }, [walks]);

  const handleDelete = async (walkId: string) => {
    if (!onDelete) return;
    setDeletingId(walkId);
    try {
      await onDelete(walkId);
    } finally {
      setDeletingId(null);
    }
  };
  if (displayWalks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-text/60">
            No walks yet. Be the first to log one!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {displayWalks.map((walk) => (
            <div
              key={walk.id}
              className="flex items-center gap-4 p-3 bg-bg rounded-base border-2 border-border hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-heading flex-shrink-0 border-2 border-border"
                style={{
                  backgroundColor: walk.profiles?.avatar_color || "#3B82F6",
                }}
              >
                {walk.profiles?.display_name?.[0]?.toUpperCase() || "?"}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-heading text-text">
                  {walk.partnerName ? (
                    <>
                      {walk.profiles?.display_name || "Unknown"}
                      {" & "}
                      {walk.partnerName}
                    </>
                  ) : (
                    <>
                      {walk.profiles?.display_name || "Unknown"}
                      {walk.user_id === currentUserId && (
                        <span className="text-text/50 font-base ml-1">(You)</span>
                      )}
                    </>
                  )}
                  <span className="font-base text-text/70"> walked </span>
                  <span className="text-blue-600">
                    {walk.miles} mi
                  </span>
                </p>
                {walk.notes && (
                  <p className="text-sm text-text/70 mt-1">{walk.notes}</p>
                )}
                <p className="text-xs text-text/40 mt-1">
                  {walk.walked_at ? formatDate(walk.walked_at) : "Unknown date"}
                  {walk.source === "strava" && (
                    <span className="ml-2 text-orange-500">via Strava</span>
                  )}
                </p>
              </div>

              <Badge variant="secondary">{walk.miles} mi</Badge>

              {onDelete && walk.user_id === currentUserId && !walk.partnerName && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0 px-2"
                  onClick={() => handleDelete(walk.id)}
                  disabled={deletingId === walk.id}
                >
                  {deletingId === walk.id ? "..." : "✕"}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
