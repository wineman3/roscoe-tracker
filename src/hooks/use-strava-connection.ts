"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export function useStravaConnection(userId: string | undefined) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkConnection = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("strava_connections")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    setConnected(!!data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const disconnect = async () => {
    if (!userId) return;

    await supabase
      .from("strava_connections")
      .delete()
      .eq("user_id", userId);

    setConnected(false);
  };

  return { connected, loading, disconnect, recheckConnection: checkConnection };
}
