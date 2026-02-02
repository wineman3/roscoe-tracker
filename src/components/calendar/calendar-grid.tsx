"use client";

import { cn } from "@/lib/utils";
import type { Walk } from "@/lib/types";

interface CalendarGridProps {
  currentMonth: Date;
  walksByDate: Map<string, Walk[]>;
  onDayClick: (date: Date) => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];

  // Add empty slots for days before the first of the month
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  // Pad to complete the last week
  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

interface DayDotsProps {
  walks: Walk[];
}

function DayDots({ walks }: DayDotsProps) {
  // Get unique walkers with their colors
  const walkerColors = new Map<string, string>();
  for (const walk of walks) {
    if (!walkerColors.has(walk.user_id)) {
      walkerColors.set(walk.user_id, walk.profiles?.avatar_color || "#3B82F6");
    }
  }

  const colors = Array.from(walkerColors.values());
  const visibleDots = colors.slice(0, 3);
  const overflow = colors.length - 3;

  return (
    <div className="flex items-center justify-center gap-1 mt-1">
      {visibleDots.map((color, i) => (
        <div
          key={i}
          className="w-3 h-3 rounded-full border border-border"
          style={{ backgroundColor: color }}
        />
      ))}
      {overflow > 0 && (
        <span className="text-xs text-text/60">+{overflow}</span>
      )}
    </div>
  );
}

export function CalendarGrid({
  currentMonth,
  walksByDate,
  onDayClick,
}: CalendarGridProps) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = getCalendarDays(year, month);

  return (
    <div className="border-2 border-border rounded-base overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 bg-main border-b-2 border-border">
        {DAY_NAMES.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-heading text-text border-r-2 border-border last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7">
        {days.map((date, i) => {
          if (!date) {
            return (
              <div
                key={`empty-${i}`}
                className="min-h-[60px] md:min-h-[80px] bg-bg/50 border-r-2 border-b-2 border-border last:border-r-0"
              />
            );
          }

          const dateKey = formatDateKey(date);
          const dayWalks = walksByDate.get(dateKey) || [];
          const hasWalks = dayWalks.length > 0;
          const today = isToday(date);

          return (
            <div
              key={dateKey}
              onClick={() => hasWalks && onDayClick(date)}
              className={cn(
                "min-h-[60px] md:min-h-[80px] p-1 md:p-2 border-r-2 border-b-2 border-border last:border-r-0 bg-blank",
                today && "ring-2 ring-main ring-inset",
                hasWalks && "cursor-pointer hover:bg-main/20 transition-colors"
              )}
            >
              <div
                className={cn(
                  "text-sm font-heading",
                  today && "text-main font-bold",
                  !today && "text-text"
                )}
              >
                {date.getDate()}
              </div>
              {hasWalks && <DayDots walks={dayWalks} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
