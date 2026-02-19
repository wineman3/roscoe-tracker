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

    const now = new Date().toISOString();
    const tokenFields = {
      strava_athlete_id: tokens.athlete.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(tokens.expires_at * 1000).toISOString(),
      updated_at: now,
    };

    // Try updating existing connection first (preserves original connected_at)
    const { data: updated } = await supabase
      .from("strava_connections")
      .update(tokenFields)
      .eq("user_id", state)
      .select("id")
      .single();

    if (!updated) {
      // No existing row — first time connecting
      const { error: insertError } = await supabase
        .from("strava_connections")
        .insert({ user_id: state, connected_at: now, ...tokenFields });

      if (insertError) {
        console.error("Failed to save Strava connection:", insertError);
        return NextResponse.redirect(`${baseUrl}/?strava=error`);
      }
    }

    return NextResponse.redirect(`${baseUrl}/?strava=connected`);
  } catch (err) {
    console.error("Strava callback error:", err);
    return NextResponse.redirect(`${baseUrl}/?strava=error`);
  }
}
