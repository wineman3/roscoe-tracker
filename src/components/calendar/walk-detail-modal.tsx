"use client";

import { useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import type { Walk } from "@/lib/types";

interface WalkDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  walks: Walk[];
  currentUserId?: string;
}

interface DisplayWalk extends Walk {
  partnerName?: string;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function mergeLinkedWalks(walks: Walk[]): DisplayWalk[] {
  const linkedTo = new Map<string, Walk>();
  for (const walk of walks) {
    if (walk.linked_walk_id) {
      linkedTo.set(walk.linked_walk_id, walk);
    }
  }

  return walks
    .filter((w) => !w.linked_walk_id)
    .map((walk) => {
      const partner = linkedTo.get(walk.id);
      if (partner) {
        return { ...walk, partnerName: partner.profiles?.display_name ?? undefined };
      }
      return walk;
    });
}

export function WalkDetailModal({
  isOpen,
  onClose,
  date,
  walks,
  currentUserId,
}: WalkDetailModalProps) {
  if (!date) return null;

  const displayWalks = mergeLinkedWalks(walks);
  const totalMiles = displayWalks.reduce((sum, walk) => sum + walk.miles, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 pt-8">
        {/* Date header */}
        <h2 className="text-xl font-heading text-text mb-2">
          {formatFullDate(date)}
        </h2>

        {/* Summary */}
        <p className="text-text/70 mb-6">
          {displayWalks.length} {displayWalks.length === 1 ? "walk" : "walks"}, {totalMiles.toFixed(1)} total miles
        </p>

        {/* Walk list */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {displayWalks.map((walk) => (
            <div
              key={walk.id}
              className="p-4 bg-bg rounded-base border-2 border-border"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-heading flex-shrink-0 border-2 border-border"
                  style={{
                    backgroundColor: walk.profiles?.avatar_color || "#3B82F6",
                  }}
                >
                  {walk.profiles?.display_name?.[0]?.toUpperCase() || "?"}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Name and miles */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading text-text">
                      {walk.partnerName
                        ? `${walk.profiles?.display_name || "Unknown"} & ${walk.partnerName}`
                        : walk.profiles?.display_name || "Unknown"}
                    </span>
                    {!walk.partnerName && walk.user_id === currentUserId && (
                      <span className="text-text/50 text-sm">(You)</span>
                    )}
                    <span className="text-blue-600 font-heading">
                      {walk.miles} mi
                    </span>
                  </div>

                  {/* Time */}
                  <p className="text-sm text-text/60 mt-1">
                    {walk.walked_at ? formatTime(walk.walked_at) : "Unknown time"}
                  </p>

                  {/* Full notes */}
                  {walk.notes && (
                    <p className="text-text/80 mt-2 whitespace-pre-wrap">
                      {walk.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
