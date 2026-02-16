import type { DestinationMilestone } from "@/lib/types";

interface TrailMilestoneProps {
  milestone: DestinationMilestone;
  side: "left" | "right";
  reached: boolean;
  isNext: boolean;
}

export function TrailMilestone({
  milestone,
  side,
  reached,
  isNext,
}: TrailMilestoneProps) {
  const card = (
    <div
      className={`flex items-center gap-2 rounded-base border-2 border-border px-3 py-2 text-sm ${
        reached
          ? "bg-green-100 shadow-[2px_2px_0px_0px_#000]"
          : isNext
            ? "bg-main/20 shadow-[2px_2px_0px_0px_#000]"
            : "bg-bg/50"
      }`}
    >
      <span className="text-lg">{milestone.icon}</span>
      <div className="min-w-0">
        <p className="font-heading text-text truncate">
          {milestone.to_city}, {milestone.state}
        </p>
        <p className="text-xs text-text/50">
          {milestone.cumulative_miles.toFixed(0)} mi
        </p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      {/* Left column */}
      <div className={`flex ${side === "left" ? "justify-end" : ""}`}>
        {side === "left" ? card : null}
      </div>

      {/* Center dot */}
      <div className="relative z-10 flex items-center justify-center">
        <div
          className={`rounded-full border-2 border-border ${
            reached
              ? "h-4 w-4 bg-green-500"
              : isNext
                ? "h-5 w-5 border-main bg-main/30 ring-2 ring-main/40 ring-offset-1"
                : "h-3.5 w-3.5 bg-white border-black/30"
          }`}
        />
      </div>

      {/* Right column */}
      <div className={`flex ${side === "right" ? "" : "justify-end"}`}>
        {side === "right" ? card : null}
      </div>
    </div>
  );
}
