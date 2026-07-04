import { NextResponse } from "next/server";
import type { GuestPlayedTrack, QueueRequest } from "@/lib/types";
import { getActiveSessionId } from "@/lib/session";
import { getServiceSupabase } from "@/lib/supabase/server";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = getServiceSupabase();
    const sessionId = await getActiveSessionId();
    const { data: guest, error: guestError } = await supabase
      .from("guests")
      .select("display_name")
      .eq("id", id)
      .eq("session_id", sessionId)
      .single();

    if (guestError) throw guestError;

    const { data, error } = await supabase
      .from("requests")
      .select("guest_id, guest_name, track_id, track_title, artist_name, album_art_url, duration_ms, spotify_uri, updated_at")
      .eq("session_id", sessionId)
      .eq("status", "played")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    const plays = new Map<string, GuestPlayedTrack>();
    const guestName = guest.display_name.trim().toLowerCase();

    for (const request of data as Pick<
      QueueRequest,
      "guest_id" | "guest_name" | "track_id" | "track_title" | "artist_name" | "album_art_url" | "duration_ms" | "spotify_uri" | "updated_at"
    >[]) {
      const requestGuestName = request.guest_name.trim().toLowerCase();
      if (request.guest_id !== id && requestGuestName !== guestName) continue;

      const existing = plays.get(request.track_id);
      if (existing) {
        existing.playCount += 1;
        if (request.updated_at > existing.lastPlayedAt) existing.lastPlayedAt = request.updated_at;
        continue;
      }

      plays.set(request.track_id, {
        id: request.track_id,
        provider: request.track_id.startsWith("spotify-") ? "spotify" : "mock",
        title: request.track_title,
        artist_name: request.artist_name,
        album_art_url: request.album_art_url,
        duration_ms: request.duration_ms,
        spotify_uri: request.spotify_uri,
        playCount: 1,
        lastPlayedAt: request.updated_at
      });
    }

    return NextResponse.json({
      tracks: [...plays.values()].sort((a, b) => b.playCount - a.playCount || a.title.localeCompare(b.title))
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load played songs" }, { status: 400 });
  }
}
