"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DestinationMilestone } from "@/lib/types";

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

  const currentMilestone = useMemo(
    () =>
      sortedMilestones.filter((m) => m.cumulative_miles <= combinedMiles).pop() ??
      null,
    [sortedMilestones, combinedMiles]
  );

  const nextMilestone = useMemo(
    () =>
      sortedMilestones.find((m) => m.cumulative_miles > combinedMiles) ?? null,
    [sortedMilestones, combinedMiles]
  );

  const progress = useMemo(() => {
    if (!nextMilestone) return 100;
    const startMiles = currentMilestone?.cumulative_miles || 0;
    const endMiles = nextMilestone.cumulative_miles;
    const currentProgress = combinedMiles - startMiles;
    const totalSegment = endMiles - startMiles;
    return Math.min((currentProgress / totalSegment) * 100, 100);
  }, [nextMilestone, currentMilestone, combinedMiles]);

  const completedMilestones = useMemo(
    () => sortedMilestones.filter((m) => m.cumulative_miles <= combinedMiles),
    [sortedMilestones, combinedMiles]
  );

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
      <CardContent className="space-y-6">
        {currentMilestone && (
          <div className="bg-green-100 border-2 border-border rounded-base p-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentMilestone.icon}</span>
              <div className="flex-1">
                <p className="text-sm text-green-800 font-heading">
                  Latest Achievement
                </p>
                <p className="text-text font-base">
                  {currentMilestone.fun_message}
                </p>
                <p className="text-xs text-text/60 mt-1">
                  {currentMilestone.from_city} → {currentMilestone.to_city},{" "}
                  {currentMilestone.state} (
                  {currentMilestone.cumulative_miles.toFixed(0)} mi)
                </p>
              </div>
            </div>
          </div>
        )}

        {nextMilestone ? (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-heading text-text">
                Next Stop: {nextMilestone.to_city}, {nextMilestone.state}
              </h4>
              <span className="text-2xl">{nextMilestone.icon}</span>
            </div>

            <Progress value={progress} />

            <div className="flex justify-between text-sm text-text/60 mt-2">
              <span>{combinedMiles.toFixed(1)} miles</span>
              <span>
                {(nextMilestone.cumulative_miles - combinedMiles).toFixed(1)}{" "}
                miles to go!
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-100 border-2 border-border rounded-base p-6 text-center">
            <p className="text-4xl mb-2">🎉</p>
            <h4 className="text-xl font-heading text-text mb-2">
              Journey Complete!
            </h4>
            <p className="text-text/70">
              Roscoe has reached all destinations! You&apos;ve walked{" "}
              {combinedMiles.toFixed(1)} miles together!
            </p>
          </div>
        )}

        {completedMilestones.length > 0 && (
          <div>
            <h4 className="text-sm font-heading text-text/70 mb-3">
              Completed Destinations ({completedMilestones.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {[...completedMilestones].reverse().map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center gap-3 p-2 bg-bg rounded-base border-2 border-border"
                >
                  <span className="text-xl">{milestone.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-heading text-text truncate">
                      {milestone.to_city}, {milestone.state}
                    </p>
                    <p className="text-xs text-text/50">
                      {milestone.cumulative_miles.toFixed(0)} miles
                    </p>
                  </div>
                  <span className="text-green-600 font-heading">✓</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
