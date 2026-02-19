import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getValidAccessToken, fetchActivity } from "@/lib/strava/client";
import type { StravaWebhookEvent } from "@/lib/strava/types";

// Strava subscription validation
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.STRAVA_VERIFY_TOKEN) {
    return NextResponse.json({ "hub.challenge": challenge });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Strava webhook event handler
export async function POST(request: NextRequest) {
  try {
    const event: StravaWebhookEvent = await request.json();

    // Only process activity creates and updates
    if (
      event.object_type !== "activity" ||
      (event.aspect_type !== "create" && event.aspect_type !== "update")
    ) {
      return NextResponse.json({ status: "ignored" });
    }

    const supabase = createServiceClient();

    // Look up the user by Strava athlete ID
    const { data: connection, error: connError } = await supabase
      .from("strava_connections")
      .select("*")
      .eq("strava_athlete_id", event.owner_id)
      .single();

    if (connError || !connection) {
      console.error("No connection found for athlete:", event.owner_id);
      return NextResponse.json({ status: "no_connection" });
    }

    // Get a valid access token (refresh if needed)
    const accessToken = await getValidAccessToken(connection, supabase);

    // Fetch the full activity from Strava
    const activity = await fetchActivity(accessToken, event.object_id);

    // Only import walks and hikes
    if (activity.type !== "Walk" && activity.type !== "Hike") {
      return NextResponse.json({ status: "skipped_type" });
    }

    // Convert meters to miles
    const miles = Math.round((activity.distance / 1609.344) * 100) / 100;

    if (event.aspect_type === "update") {
      // Update existing walk if we have it
      const { data: existing } = await supabase
        .from("walks")
        .select("id")
        .eq("user_id", connection.user_id)
        .eq("external_id", String(activity.id))
        .single();

      if (existing) {
        await supabase
          .from("walks")
          .update({ notes: activity.name, miles })
          .eq("id", existing.id);
        return NextResponse.json({ status: "updated" });
      }

      // Activity wasn't imported yet (e.g. was private on create) — fall through to insert
    } else {
      // For create events, skip activities from before the user connected
      const activityDate = new Date(activity.start_date);
      const connectedAt = new Date(connection.connected_at);
      if (activityDate < connectedAt) {
        return NextResponse.json({ status: "skipped_before_connection" });
      }
    }

    // Insert the walk (dedup via unique constraint on external_id + user_id)
    const { error: insertError } = await supabase.from("walks").insert({
      user_id: connection.user_id,
      miles,
      notes: activity.name,
      source: "strava",
      external_id: String(activity.id),
      walked_at: activity.start_date,
    });

    if (insertError) {
      // Unique constraint violation = duplicate, which is fine
      if (insertError.code === "23505") {
        return NextResponse.json({ status: "duplicate" });
      }
      console.error("Failed to insert walk:", insertError);
      return NextResponse.json({ status: "insert_error" });
    }

    // Check and award badges
    await supabase.rpc("check_and_award_badges", {
      p_user_id: connection.user_id,
    });

    return NextResponse.json({ status: "created" });
  } catch (err) {
    console.error("Webhook error:", err);
    // Always return 200 to prevent Strava retry storms
    return NextResponse.json({ status: "error" });
  }
}
