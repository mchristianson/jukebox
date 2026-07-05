import { getMusicProvider } from "@/lib/music";
import { getActiveSessionId } from "@/lib/session";
import { getServiceSupabase } from "@/lib/supabase/server";
import type { QueueRequest } from "@/lib/types";

const DEFAULT_PLAYBACK_OVERLAP_MS = 3000;

function getPlaybackOverlapMs() {
  const configured = Number(process.env.PLAYBACK_OVERLAP_MS);
  return Number.isFinite(configured) && configured >= 0 ? configured : DEFAULT_PLAYBACK_OVERLAP_MS;
}

function isPlayableSpotifyUri(uri: string | null) {
  return Boolean(uri && !uri.includes("mock-"));
}

async function getUpcomingSpotifyUris(request: QueueRequest) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("requests")
    .select("id, spotify_uri")
    .eq("session_id", request.session_id)
    .eq("status", "queued")
    .order("is_fast_pass", { ascending: false })
    .order("position", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(24);

  if (error) throw error;

  return (data ?? [])
    .filter((item) => item.id !== request.id && isPlayableSpotifyUri(item.spotify_uri))
    .map((item) => item.spotify_uri as string);
}

export async function startRequestPlayback(request: QueueRequest) {
  const supabase = getServiceSupabase();
  const provider = getMusicProvider();

  await supabase.from("requests").update({ status: "played" }).eq("status", "playing");

  if (request.spotify_uri) {
    await provider.playTrack(request.spotify_uri, { upcomingUris: await getUpcomingSpotifyUris(request) });
  }

  await supabase
    .from("playback_state")
    .update({ current_request_id: request.id, is_playing: true, provider: provider.name })
    .eq("id", 1);

  const { data, error } = await supabase
    .from("requests")
    .update({ status: "playing" })
    .eq("id", request.id)
    .select("*")
    .single();

  if (error) throw error;
  return data as QueueRequest;
}

async function getNextQueuedRequest(sessionId: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("session_id", sessionId)
    .eq("status", "queued")
    .order("is_fast_pass", { ascending: false })
    .order("position", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as QueueRequest | null;
}

async function startNextQueuedRequest(sessionId: string) {
  const supabase = getServiceSupabase();
  const next = await getNextQueuedRequest(sessionId);

  if (!next) {
    await supabase
      .from("playback_state")
      .update({ current_request_id: null, is_playing: false })
      .eq("id", 1);

    return null;
  }

  return startRequestPlayback(next);
}

export async function advancePlaybackIfFinished() {
  const supabase = getServiceSupabase();
  const { data: playback, error: playbackError } = await supabase
    .from("playback_state")
    .select("current_request_id, is_playing")
    .eq("id", 1)
    .single();

  if (playbackError) throw playbackError;
  if (!playback.current_request_id || !playback.is_playing) {
    const request = await startNextQueuedRequest(await getActiveSessionId());
    return request ? { advanced: true, request } : { advanced: false, reason: "idle" };
  }

  const { data: current, error: currentError } = await supabase
    .from("requests")
    .select("*")
    .eq("id", playback.current_request_id)
    .single();

  if (currentError) throw currentError;

  const currentRequest = current as QueueRequest;
  const elapsedMs = Date.now() - new Date(currentRequest.updated_at).getTime();
  const overlapMs = getPlaybackOverlapMs();

  if (elapsedMs < Math.max(0, currentRequest.duration_ms - overlapMs)) {
    return { advanced: false, reason: "playing" };
  }

  const { data: markedCurrent, error: markCurrentError } = await supabase
    .from("requests")
    .update({ status: "played" })
    .eq("id", currentRequest.id)
    .eq("status", "playing")
    .select("id")
    .maybeSingle();

  if (markCurrentError) throw markCurrentError;
  if (!markedCurrent) {
    return { advanced: false, reason: "already-advanced" };
  }

  let request: QueueRequest | null;
  try {
    request = await startNextQueuedRequest(currentRequest.session_id);
  } catch (error) {
    await supabase
      .from("playback_state")
      .update({ current_request_id: null, is_playing: false })
      .eq("id", 1);
    throw error;
  }

  return { advanced: true, request };
}
