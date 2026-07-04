import { getMusicProvider } from "@/lib/music";
import { getActiveSessionId } from "@/lib/session";
import { getServiceSupabase } from "@/lib/supabase/server";
import type { QueueRequest } from "@/lib/types";

export async function startRequestPlayback(request: QueueRequest) {
  const supabase = getServiceSupabase();
  const provider = getMusicProvider();

  await supabase.from("requests").update({ status: "played" }).eq("status", "playing");

  if (request.spotify_uri) {
    await provider.playTrack(request.spotify_uri);
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

export async function autoStartIfIdle(request: QueueRequest) {
  const supabase = getServiceSupabase();
  const { data: playback, error } = await supabase
    .from("playback_state")
    .select("current_request_id, is_playing")
    .eq("id", 1)
    .single();

  if (error) throw error;
  if (playback.is_playing || playback.current_request_id) return request;

  try {
    return await startRequestPlayback(request);
  } catch (error) {
    console.error("Could not auto-start request playback", error);
    return request;
  }
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
  const completionBufferMs = 2500;

  if (elapsedMs < currentRequest.duration_ms + completionBufferMs) {
    return { advanced: false, reason: "playing" };
  }

  await supabase.from("requests").update({ status: "played" }).eq("id", currentRequest.id);

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
