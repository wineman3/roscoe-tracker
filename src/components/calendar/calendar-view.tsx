"use client";

import { useState } from "react";
import { useCalendarWalks } from "@/hooks/use-calendar-walks";
import { CalendarGrid } from "./calendar-grid";
import { WalkDetailModal } from "./walk-detail-modal";
import { Button } from "@/components/ui/button";

interface CalendarViewProps {
  currentUserId?: string;
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CalendarView({ currentUserId }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const { walksByDate, loading } = useCalendarWalks(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDayClick = (date: Date) => {
    setSelectedDay(date);
  };

  const handleCloseModal = () => {
    setSelectedDay(null);
  };

  const selectedWalks = selectedDay
    ? walksByDate.get(formatDateKey(selectedDay)) || []
    : [];

  return (
    <div className="space-y-4">
      {/* Navigation header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToPreviousMonth}>
            &lt;
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" onClick={goToNextMonth}>
            &gt;
          </Button>
        </div>
        <h2 className="text-xl font-heading text-text">
          {formatMonthYear(currentMonth)}
        </h2>
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text"></div>
        </div>
      ) : (
        <CalendarGrid
          currentMonth={currentMonth}
          walksByDate={walksByDate}
          onDayClick={handleDayClick}
        />
      )}

      {/* Walk detail modal */}
      <WalkDetailModal
        isOpen={selectedDay !== null}
        onClose={handleCloseModal}
        date={selectedDay}
        walks={selectedWalks}
        currentUserId={currentUserId}
      />
    </div>
  );
}
