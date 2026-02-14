"use client";

import { useAuth } from "@/hooks/use-auth";
import { useWalks } from "@/hooks/use-walks";
import { useStats } from "@/hooks/use-stats";
import { useMilestones } from "@/hooks/use-milestones";
import { useBadges } from "@/hooks/use-badges";
import { CompetitionView } from "@/components/dashboard/competition-view";
import { QuickAddWalk } from "@/components/dashboard/quick-add-walk";
import { RecentWalks } from "@/components/dashboard/recent-walks";
import { DestinationTracker } from "@/components/journey/destination-tracker";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { BadgeNotification } from "@/components/badges/badge-notification";
import { StravaConnect } from "@/components/dashboard/strava-connect";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { walks, addWalk, deleteWalk } = useWalks();
  const { stats, combinedMiles, reload: reloadStats } = useStats();
  const { milestones } = useMilestones();
  const { newBadges, loadUserBadges, checkNewBadges, clearNewBadges } =
    useBadges();

  useEffect(() => {
    if (user) {
      loadUserBadges(user.id);
    }
  }, [user, loadUserBadges]);

  const handleWalkDelete = async (walkId: string) => {
    await deleteWalk(walkId);
    await reloadStats();
  };

  const handleWalkSubmit = async (miles: number, notes: string, date: string) => {
    if (!user) return;
    await addWalk(miles, notes, user.id, date);
    await reloadStats();
    await checkNewBadges(user.id);
  };

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
          <div className="flex items-center gap-2">
            {user && <StravaConnect userId={user.id} />}
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
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-main rounded-base border-2 border-border p-8 shadow-shadow">
          <h2 className="text-3xl font-heading text-text mb-2">
            {user ? "Welcome back!" : "Roscoe's Walks"}
          </h2>
          <p className="text-text/70">
            {user ? "Ready to walk Roscoe?" : "See how far Roscoe has gone!"}
          </p>
        </div>

        <CompetitionView stats={stats} currentUserId={user?.id ?? ""} />

        {user && <QuickAddWalk userId={user.id} onSubmit={handleWalkSubmit} />}

        <DestinationTracker
          milestones={milestones}
          combinedMiles={combinedMiles}
        />

        <MiniCalendar />

        <RecentWalks walks={walks} currentUserId={user?.id ?? ""} onDelete={user ? handleWalkDelete : undefined} />
      </main>

      {user && <BadgeNotification badges={newBadges} onClose={clearNewBadges} />}
    </div>
  );
}
