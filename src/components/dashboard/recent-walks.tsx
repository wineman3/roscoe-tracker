"use client";

import { useState } from "react";
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
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInMs / (1000 * 60));
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (diffInDays < 7) {
    const days = Math.floor(diffInDays);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

export function RecentWalks({ walks, currentUserId, onDelete }: RecentWalksProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (walkId: string) => {
    if (!onDelete) return;
    setDeletingId(walkId);
    try {
      await onDelete(walkId);
    } finally {
      setDeletingId(null);
    }
  };
  if (walks.length === 0) {
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
          {walks.map((walk) => (
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
                  {walk.profiles?.display_name || "Unknown"}
                  {walk.user_id === currentUserId && (
                    <span className="text-text/50 font-base ml-1">(You)</span>
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
                </p>
              </div>

              <Badge variant="secondary">{walk.miles} mi</Badge>

              {onDelete && walk.user_id === currentUserId && (
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
