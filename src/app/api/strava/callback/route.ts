import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { exchangeCodeForTokens } from "@/lib/strava/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // contains user_id
  const error = searchParams.get("error");

  const baseUrl = request.nextUrl.origin;

  if (error || !code || !state) {
    return NextResponse.redirect(`${baseUrl}/?strava=error`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const supabase = createServiceClient();

    // Upsert the connection (update tokens if reconnecting)
    const { error: upsertError } = await supabase
      .from("strava_connections")
      .upsert(
        {
          user_id: state,
          strava_athlete_id: tokens.athlete.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: new Date(
            tokens.expires_at * 1000
          ).toISOString(),
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("Failed to save Strava connection:", upsertError);
      return NextResponse.redirect(`${baseUrl}/?strava=error`);
    }

    return NextResponse.redirect(`${baseUrl}/?strava=connected`);
  } catch (err) {
    console.error("Strava callback error:", err);
    return NextResponse.redirect(`${baseUrl}/?strava=error`);
  }
}
