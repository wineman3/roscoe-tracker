"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { UserBadge } from "@/lib/types";

interface BadgeNotificationProps {
  badges: UserBadge[];
  onClose: () => void;
}

export function BadgeNotification({ badges, onClose }: BadgeNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [currentBadge, setCurrentBadge] = useState<UserBadge | null>(null);
  const queueRef = useRef<UserBadge[]>([]);

  const showNext = useCallback(() => {
    if (queueRef.current.length > 0) {
      const next = queueRef.current.shift()!;
      setCurrentBadge(next);
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          showNext();
        }, 500);
      }, 4000);
    }
  }, []);

  useEffect(() => {
    if (badges.length > 0) {
      queueRef.current = [...queueRef.current, ...badges];
      if (!visible) {
        showNext();
      }
    }
  }, [badges, showNext, visible]);

  const handleClose = () => {
    setVisible(false);
    queueRef.current = [];
    onClose();
  };

  if (!visible || !currentBadge) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4 transition-all duration-300 ease-out ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="bg-main rounded-base border-2 border-border shadow-shadow p-6 relative overflow-hidden">
        <button
          onClick={handleClose}
          aria-label="Close notification"
          className="absolute top-2 right-2 text-text hover:text-text/70 transition"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="relative flex items-center gap-4">
          <div className="text-5xl animate-bounce">
            {currentBadge.badge_definitions?.icon || "🏆"}
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-heading mb-1">New Badge Earned!</h4>
            <p className="text-lg font-heading text-text/80">
              {currentBadge.badge_definitions?.name || "Unknown Badge"}
            </p>
            <p className="text-sm text-text/60 mt-1">
              {currentBadge.badge_definitions?.description || ""}
            </p>
          </div>
        </div>

        {queueRef.current.length > 0 && (
          <div className="mt-3 text-center text-sm text-text/60">
            +{queueRef.current.length} more badge
            {queueRef.current.length === 1 ? "" : "s"}
          </div>
        )}
      </div>
    </div>
  );
}
