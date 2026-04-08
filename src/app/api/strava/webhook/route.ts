import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getValidAccessToken, fetchActivity } from "@/lib/strava/client";
import type { StravaWebhookEvent } from "@/lib/strava/types";
import type { SupabaseClient } from "@supabase/supabase-js";

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

async function syncPartnerWalk(
  supabase: SupabaseClient,
  primaryWalkId: string,
  primaryUserId: string,
  miles: number,
  notes: string,
  walkedAt: string,
) {
  const { data: otherUsers } = await supabase
    .from("profiles")
    .select("id")
    .neq("id", primaryUserId);

  const otherUser = otherUsers?.[0];
  if (!otherUser) return;

  // Check if the partner already has a walk within 2 hours (e.g. their own Strava fired)
  const activityTime = new Date(walkedAt);
  const windowStart = new Date(activityTime.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(activityTime.getTime() + 2 * 60 * 60 * 1000).toISOString();

  const { data: existingPartnerWalk } = await supabase
    .from("walks")
    .select("id")
    .eq("user_id", otherUser.id)
    .gte("walked_at", windowStart)
    .lte("walked_at", windowEnd)
    .is("linked_walk_id", null)
    .order("walked_at", { ascending: true })
    .limit(1)
    .single();

  if (existingPartnerWalk) {
    await supabase
      .from("walks")
      .update({ linked_walk_id: primaryWalkId })
      .eq("id", existingPartnerWalk.id);
  } else {
    const { data: partnerWalk } = await supabase
      .from("walks")
      .insert({
        user_id: otherUser.id,
        miles,
        notes,
        source: "strava",
        walked_at: walkedAt,
        linked_walk_id: primaryWalkId,
      })
      .select("id")
      .single();

    if (partnerWalk) {
      await supabase.rpc("check_and_award_badges", { p_user_id: otherUser.id });
    }
  }
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

    const miles = Math.round((activity.distance / 1609.344) * 100) / 100;

    if (event.aspect_type === "update") {
      const { data: existing } = await supabase
        .from("walks")
        .select("id, linked_walk_id")
        .eq("user_id", connection.user_id)
        .eq("external_id", String(activity.id))
        .single();

      if (existing) {
        await supabase
          .from("walks")
          .update({ notes: activity.name, miles })
          .eq("id", existing.id);

        // If not already linked, try to link or create a partner walk
        if (!existing.linked_walk_id) {
          await syncPartnerWalk(
            supabase,
            existing.id,
            connection.user_id,
            miles,
            activity.name,
            activity.start_date,
          );
        }

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
    const { data: insertedWalk, error: insertError } = await supabase
      .from("walks")
      .insert({
        user_id: connection.user_id,
        miles,
        notes: activity.name,
        source: "strava",
        external_id: String(activity.id),
        walked_at: activity.start_date,
      })
      .select("id")
      .single();

    if (insertError) {
      // Unique constraint violation = duplicate, which is fine
      if (insertError.code === "23505") {
        return NextResponse.json({ status: "duplicate" });
      }
      console.error("Failed to insert walk:", insertError);
      return NextResponse.json({ status: "insert_error" });
    }

    await supabase.rpc("check_and_award_badges", { p_user_id: connection.user_id });

    await syncPartnerWalk(
      supabase,
      insertedWalk.id,
      connection.user_id,
      miles,
      activity.name,
      activity.start_date,
    );

    return NextResponse.json({ status: "created" });
  } catch (err) {
    console.error("Webhook error:", err);
    // Always return 200 to prevent Strava retry storms
    return NextResponse.json({ status: "error" });
  }
}
