import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";
import type { StravaTokenResponse, StravaActivity } from "./types";

type StravaConnectionRow =
  Database["public"]["Tables"]["strava_connections"]["Row"];

const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_API_BASE = "https://www.strava.com/api/v3";

export async function exchangeCodeForTokens(
  code: string
): Promise<StravaTokenResponse> {
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    throw new Error(`Strava token exchange failed: ${res.status}`);
  }

  return res.json();
}

async function refreshAccessToken(
  refreshToken: string
): Promise<StravaTokenResponse> {
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error(`Strava token refresh failed: ${res.status}`);
  }

  return res.json();
}

export async function getValidAccessToken(
  connection: StravaConnectionRow,
  supabase: SupabaseClient<Database>
): Promise<string> {
  const expiresAt = new Date(connection.token_expires_at);
  const now = new Date();

  // Token still valid (with 60s buffer)
  if (expiresAt.getTime() - now.getTime() > 60_000) {
    return connection.access_token;
  }

  // Refresh the token
  const tokens = await refreshAccessToken(connection.refresh_token);

  await supabase
    .from("strava_connections")
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(tokens.expires_at * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", connection.id);

  return tokens.access_token;
}

export async function fetchActivity(
  accessToken: string,
  activityId: number
): Promise<StravaActivity> {
  const res = await fetch(`${STRAVA_API_BASE}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Strava fetch activity failed: ${res.status}`);
  }

  return res.json();
}
