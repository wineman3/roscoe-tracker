"use client";

import Link from "next/link";
import { useCalendarWalks } from "@/hooks/use-calendar-walks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Walk } from "@/lib/types";

const DAY_NAMES = ["S", "M", "T", "W", "T", "F", "S"];

function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];

  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null);
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

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

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

interface MiniDotsProps {
  walks: Walk[];
}

function MiniDots({ walks }: MiniDotsProps) {
  const walkerColors = new Map<string, string>();
  for (const walk of walks) {
    if (!walkerColors.has(walk.user_id)) {
      walkerColors.set(walk.user_id, walk.profiles?.avatar_color || "#3B82F6");
    }
  }

  const colors = Array.from(walkerColors.values()).slice(0, 2);

  return (
    <div className="flex items-center justify-center gap-0.5 mt-0.5">
      {colors.map((color, i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

export function MiniCalendar() {
  const now = new Date();
  const { walksByDate, loading } = useCalendarWalks(
    now.getFullYear(),
    now.getMonth()
  );

  const days = getCalendarDays(now.getFullYear(), now.getMonth());

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{formatMonthYear(now)}</CardTitle>
        <Link
          href="/calendar"
          className="text-sm text-text/70 hover:text-text transition-colors"
        >
          View Full Calendar &rarr;
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-text"></div>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1">
              {DAY_NAMES.map((day, i) => (
                <div
                  key={i}
                  className="text-center text-xs text-text/50 font-heading py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, i) => {
                if (!date) {
                  return <div key={`empty-${i}`} className="h-8" />;
                }

                const dateKey = formatDateKey(date);
                const dayWalks = walksByDate.get(dateKey) || [];
                const hasWalks = dayWalks.length > 0;
                const today = isToday(date);

                return (
                  <Link
                    key={dateKey}
                    href="/calendar"
                    className={cn(
                      "h-8 flex flex-col items-center justify-center rounded-base text-xs",
                      today && "ring-1 ring-main bg-main/10",
                      hasWalks && "hover:bg-main/20 transition-colors"
                    )}
                  >
                    <span
                      className={cn(
                        today && "font-bold text-main",
                        !today && "text-text"
                      )}
                    >
                      {date.getDate()}
                    </span>
                    {hasWalks && <MiniDots walks={dayWalks} />}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
