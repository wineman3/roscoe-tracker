"use client";

import { useAuth } from "@/hooks/use-auth";
import { CalendarView } from "@/components/calendar/calendar-view";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function CalendarPage() {
  const { user, loading: authLoading, signOut } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-text mx-auto"></div>
          <p className="mt-4 text-text/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b-2 border-border bg-blank">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/icons/cartoon_roscoe.png" alt="Roscoe" width={36} height={36} />
            <h1 className="text-2xl font-heading text-text">Roscoe Tracker</h1>
          </div>
          {user ? (
            <Button variant="ghost" onClick={signOut}>
              Sign Out
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Back to dashboard link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-text/70 hover:text-text transition-colors"
        >
          &larr; Back to Dashboard
        </Link>

        {/* Page title */}
        <div className="bg-main rounded-base border-2 border-border p-6 shadow-shadow">
          <h2 className="text-2xl font-heading text-text">Walk Calendar</h2>
          <p className="text-text/70 mt-1">
            View all walks by day
          </p>
        </div>

        {/* Calendar */}
        <CalendarView currentUserId={user?.id} />
      </main>
    </div>
  );
}
