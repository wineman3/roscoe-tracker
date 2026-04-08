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
  sessionId: string,
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
    .gte("miles", miles * 0.8)
    .lte("miles", miles * 1.2)
    .is("session_id", null)
    .order("walked_at", { ascending: true })
    .limit(1)
    .single();

  if (existingPartnerWalk) {
    // Partner already has a walk around the same time — link them into a session
    await supabase
      .from("walks")
      .update({ session_id: sessionId })
      .eq("id", existingPartnerWalk.id);
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

    const externalId = String(activity.id);
    const activityTime = new Date(activity.start_date);
    const windowStart = new Date(activityTime.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const windowEnd = new Date(activityTime.getTime() + 2 * 60 * 60 * 1000).toISOString();

    // Look for an existing walk — either by external_id (own Strava import) or by
    // time window (created by syncPartnerWalk without an external_id)
    const { data: existing } = await supabase
      .from("walks")
      .select("id, session_id, external_id")
      .eq("user_id", connection.user_id)
      .or(`external_id.eq.${externalId},and(external_id.is.null,walked_at.gte.${windowStart},walked_at.lte.${windowEnd})`)
      .order("walked_at", { ascending: true })
      .limit(1)
      .single();

    if (existing) {
      await supabase
        .from("walks")
        .update({
          notes: activity.name,
          miles,
          // Claim the external_id if this walk was created by syncPartnerWalk
          ...(existing.external_id ? {} : { external_id: externalId, source: "strava" }),
        })
        .eq("id", existing.id);

      if (!existing.session_id) {
        const sessionId = crypto.randomUUID();
        await supabase.from("walks").update({ session_id: sessionId }).eq("id", existing.id);
        await syncPartnerWalk(
          supabase,
          existing.id,
          connection.user_id,
          sessionId,
          miles,
          activity.name,
          activity.start_date,
        );
      }

      return NextResponse.json({ status: "updated" });
    }

    // No existing walk found — insert if allowed
    if (event.aspect_type === "create") {
      const connectedAt = new Date(connection.connected_at);
      if (activityTime < connectedAt) {
        return NextResponse.json({ status: "skipped_before_connection" });
      }
    }

    const sessionId = crypto.randomUUID();
    const { data: insertedWalk, error: insertError } = await supabase
      .from("walks")
      .insert({
        user_id: connection.user_id,
        miles,
        notes: activity.name,
        source: "strava",
        external_id: externalId,
        walked_at: activity.start_date,
        session_id: sessionId,
      })
      .select("id")
      .single();

    if (insertError) {
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
      sessionId,
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
