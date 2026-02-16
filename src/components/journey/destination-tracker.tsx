"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DestinationMilestone } from "@/lib/types";
import { TrailMap } from "./trail-map";

interface DestinationTrackerProps {
  milestones: DestinationMilestone[];
  combinedMiles: number;
}

export function DestinationTracker({
  milestones,
  combinedMiles,
}: DestinationTrackerProps) {
  const sortedMilestones = useMemo(
    () => [...milestones].sort((a, b) => a.order_index - b.order_index),
    [milestones]
  );

  const nextMilestone = useMemo(
    () =>
      sortedMilestones.find((m) => m.cumulative_miles > combinedMiles) ?? null,
    [sortedMilestones, combinedMiles]
  );

  const milesToNext = nextMilestone
    ? nextMilestone.cumulative_miles - combinedMiles
    : 0;

  if (combinedMiles === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Roscoe&apos;s Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-text/60">
            <p className="text-lg mb-2">The journey begins!</p>
            <p className="text-sm">
              Start logging walks to see Roscoe&apos;s progress
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roscoe&apos;s Journey</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Next milestone callout */}
        {nextMilestone ? (
          <div className="flex items-center gap-3 rounded-base border-2 border-border bg-main/10 px-4 py-3">
            <span className="text-3xl">{nextMilestone.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-heading text-text">
                Next: {nextMilestone.to_city}, {nextMilestone.state}
              </p>
              <p className="text-sm text-text/60">
                {milesToNext.toFixed(1)} miles to go!
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text/50">Total</p>
              <p className="font-heading text-text">
                {combinedMiles.toFixed(1)} mi
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-base border-2 border-border bg-yellow-100 p-4 text-center">
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-heading text-text">Journey Complete!</p>
            <p className="text-sm text-text/70">
              {combinedMiles.toFixed(1)} miles walked!
            </p>
          </div>
        )}

        {/* Trail map */}
        <TrailMap milestones={milestones} combinedMiles={combinedMiles} />
      </CardContent>
    </Card>
  );
}
