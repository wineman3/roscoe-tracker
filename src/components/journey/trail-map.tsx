"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import type { DestinationMilestone } from "@/lib/types";
import { TrailMilestone } from "./trail-milestone";

interface TrailMapProps {
  milestones: DestinationMilestone[];
  combinedMiles: number;
}

export function TrailMap({ milestones, combinedMiles }: TrailMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const roscoeRef = useRef<HTMLDivElement>(null);

  const sortedMilestones = useMemo(
    () => [...milestones].sort((a, b) => a.order_index - b.order_index),
    [milestones]
  );

  // Reversed for display (top = destination, bottom = start)
  const displayMilestones = useMemo(
    () => [...sortedMilestones].reverse(),
    [sortedMilestones]
  );

  const lastReached = useMemo(
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

  // Find Roscoe's display index (in the reversed display array)
  // so we can position him between milestone DOM elements.
  // Display is reversed: top = destination, bottom = start.
  // Roscoe should appear AFTER the next milestone in display order
  // (visually between next milestone above and last reached below).
  const roscoeDisplayIndex = useMemo(() => {
    if (sortedMilestones.length === 0) return -1;
    if (nextMilestone) {
      const nextSortedIdx = sortedMilestones.indexOf(nextMilestone);
      // In reversed display: displayIdx = total - 1 - sortedIdx
      return sortedMilestones.length - 1 - nextSortedIdx;
    }
    // Past all milestones — place above the highest milestone (index -1 means don't render between)
    if (lastReached) return -1;
    // No milestones reached — place below all milestones
    return sortedMilestones.length;
  }, [sortedMilestones, nextMilestone, lastReached]);

  // Progress within current segment (0-1)
  const segmentProgress = useMemo(() => {
    const segmentStartMiles = lastReached?.cumulative_miles ?? 0;
    const segmentEndMiles = nextMilestone?.cumulative_miles ?? segmentStartMiles;
    if (segmentEndMiles <= segmentStartMiles) return 1;
    return (
      (combinedMiles - segmentStartMiles) /
      (segmentEndMiles - segmentStartMiles)
    );
  }, [lastReached, nextMilestone, combinedMiles]);

  // Auto-scroll to Roscoe on mount
  useEffect(() => {
    const container = containerRef.current;
    const roscoe = roscoeRef.current;
    if (!container || !roscoe) return;

    // Use requestAnimationFrame to ensure layout is complete
    const raf = requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();
      const roscoeRect = roscoe.getBoundingClientRect();
      const roscoeCenter =
        roscoeRect.top - containerRect.top + container.scrollTop + roscoeRect.height / 2;
      const scrollTarget = roscoeCenter - containerRect.height / 2;

      container.scrollTo({
        top: Math.max(0, scrollTarget),
        behavior: "smooth",
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [combinedMiles, roscoeDisplayIndex]);

  return (
    <div
      ref={containerRef}
      className="relative max-h-[60vh] overflow-y-auto overscroll-contain rounded-base border-2 border-border bg-blank p-4"
    >
      {/* Milestones (top = destination, bottom = start) */}
      <div className="relative space-y-5 py-2">
        {/* Vertical trail line */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-black/20 rounded-full"
          aria-hidden
        />
        {/* Roscoe above all milestones if past the final destination */}
        {roscoeDisplayIndex === -1 && (
          <div
            ref={roscoeRef}
            className="relative z-20 flex justify-center py-3"
          >
            <div className="flex flex-col items-center">
              <div className="rounded-full border-2 border-border bg-blank p-1 shadow-[2px_2px_0px_0px_#000] overflow-hidden">
                <Image src="/icons/cartoon_roscoe.png" alt="Roscoe" width={32} height={32} className="rounded-full" />
              </div>
              <div className="mt-1 rounded-base border-2 border-border bg-main px-2 py-0.5 text-xs font-heading text-white shadow-[2px_2px_0px_0px_#000] whitespace-nowrap">
                {combinedMiles.toFixed(1)} mi
              </div>
            </div>
          </div>
        )}

        {displayMilestones.map((milestone, displayIdx) => {
          const reached = milestone.cumulative_miles <= combinedMiles;
          const isNext = nextMilestone?.id === milestone.id;
          const side: "left" | "right" =
            displayIdx % 2 === 0 ? "right" : "left";

          return (
            <div key={milestone.id}>
              <TrailMilestone
                milestone={milestone}
                side={side}
                reached={reached}
                isNext={isNext}
              />

              {/* Roscoe appears after his display index (between last reached and next) */}
              {displayIdx === roscoeDisplayIndex && (
                <div
                  ref={roscoeRef}
                  className="relative z-20 flex justify-center py-3"
                >
                  <div className="flex flex-col items-center">
                    <div className="rounded-full border-2 border-border bg-blank p-1 shadow-[2px_2px_0px_0px_#000] overflow-hidden">
                      <Image src="/icons/cartoon_roscoe.png" alt="Roscoe" width={32} height={32} className="rounded-full" />
                    </div>
                    <div className="mt-1 rounded-base border-2 border-border bg-main px-2 py-0.5 text-xs font-heading text-white shadow-[2px_2px_0px_0px_#000] whitespace-nowrap">
                      {combinedMiles.toFixed(1)} mi
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Roscoe below all milestones if no milestones reached yet */}
        {roscoeDisplayIndex === sortedMilestones.length && (
          <div
            ref={roscoeRef}
            className="relative z-20 flex justify-center py-3"
          >
            <div className="flex flex-col items-center">
              <div className="rounded-full border-2 border-border bg-blank p-1 shadow-[2px_2px_0px_0px_#000] overflow-hidden">
                <Image src="/icons/cartoon_roscoe.png" alt="Roscoe" width={32} height={32} className="rounded-full" />
              </div>
              <div className="mt-1 rounded-base border-2 border-border bg-main px-2 py-0.5 text-xs font-heading text-white shadow-[2px_2px_0px_0px_#000] whitespace-nowrap">
                {combinedMiles.toFixed(1)} mi
              </div>
            </div>
          </div>
        )}

        {/* Start marker at bottom */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div />
          <div className="flex items-center justify-center">
            <div className="h-5 w-5 rounded-full border-2 border-green-600 bg-green-500" />
          </div>
          <div className="text-sm font-heading text-green-700">
            Home — Start!
          </div>
        </div>
      </div>
    </div>
  );
}
