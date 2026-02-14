"use client";

import { useStravaConnection } from "@/hooks/use-strava-connection";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface StravaConnectProps {
  userId: string;
}

export function StravaConnect({ userId }: StravaConnectProps) {
  const { connected, loading, disconnect, recheckConnection } =
    useStravaConnection(userId);
  const searchParams = useSearchParams();

  // Re-check connection when redirected back from Strava
  useEffect(() => {
    if (searchParams.get("strava") === "connected") {
      recheckConnection();
    }
  }, [searchParams, recheckConnection]);

  if (loading) return null;

  if (connected) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-text/60">Strava connected</span>
        <Button variant="ghost" size="sm" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}&redirect_uri=${window.location.origin}/api/strava/callback&response_type=code&scope=activity:read&state=${userId}`;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        window.location.href = stravaAuthUrl;
      }}
    >
      Connect Strava
    </Button>
  );
}
