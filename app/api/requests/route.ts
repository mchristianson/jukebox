import { NextResponse } from "next/server";
import { z } from "zod";
import { getQueueSnapshot, nextQueuePosition } from "@/lib/queue";
import { assertGuestCanSpend, CREDIT_COSTS, spendGuestCredits } from "@/lib/credits";
import { mockTracks } from "@/lib/music/mock-provider";
import { getActiveSessionId } from "@/lib/session";
import { getServiceSupabase } from "@/lib/supabase/server";

const requestSchema = z.object({
  guestId: z.string().uuid(),
  guestName: z.string().trim().min(1).max(32),
  trackId: z.string().min(1),
  fastPass: z.boolean().optional().default(false)
});

export async function GET() {
  try {
    return NextResponse.json(await getQueueSnapshot());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load queue" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json());
    const supabase = getServiceSupabase();
    const sessionId = await getActiveSessionId();

    const { data: settings, error: settingsError } = await supabase
      .from("app_settings")
      .select("requests_locked")
      .eq("id", 1)
      .single();
    if (settingsError) throw settingsError;
    if (settings.requests_locked) {
      return NextResponse.json({ error: "Requests are locked right now." }, { status: 423 });
    }

    const { data: storedTrack, error: trackError } = await supabase
      .from("tracks")
      .select("*")
      .eq("id", input.trackId)
      .maybeSingle();
    if (trackError) throw trackError;

    const fallbackTrack = mockTracks.find((track) => track.id === input.trackId);
    const track = storedTrack ?? fallbackTrack;
    if (!track) {
      throw new Error("That track is no longer available. Search and try again.");
    }

    if (!storedTrack) {
      await supabase.from("tracks").upsert(track, { onConflict: "id" });
    }

    const action = input.fastPass ? "fast_pass" : "request";
    await assertGuestCanSpend(input.guestId, action);

    const position = await nextQueuePosition(sessionId, input.fastPass);
    const { data, error } = await supabase
      .from("requests")
      .insert({
        session_id: sessionId,
        guest_id: input.guestId,
        guest_name: input.guestName,
        track_id: track.id,
        track_title: track.title,
        artist_name: track.artist_name,
        album_art_url: track.album_art_url,
        duration_ms: track.duration_ms,
        spotify_uri: track.spotify_uri,
        position,
        is_fast_pass: input.fastPass,
        credits_spent: CREDIT_COSTS[action]
      })
      .select("*")
      .single();

    if (error) throw error;
    try {
      await spendGuestCredits({ guestId: input.guestId, action, requestId: data.id });
    } catch (creditError) {
      await supabase.from("requests").delete().eq("id", data.id);
      throw creditError;
    }

    return NextResponse.json({ request: data });
  } catch (error) {
    console.error("Could not request song", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not request song" }, { status: 400 });
  }
}
