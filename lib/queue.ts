import { getServiceSupabase } from "@/lib/supabase/server";
import { getActiveSessionId } from "@/lib/session";
import type { AppSettings, PlaybackState, QueueRequest, QueueSnapshot } from "@/lib/types";

export async function getQueueSnapshot(): Promise<QueueSnapshot> {
  const supabase = getServiceSupabase();
  const sessionId = await getActiveSessionId();

  const [settingsResult, playbackResult, requestsResult] = await Promise.all([
    supabase.from("app_settings").select("*").eq("id", 1).single(),
    supabase.from("playback_state").select("*").eq("id", 1).single(),
    supabase
      .from("requests")
      .select("*")
      .eq("session_id", sessionId)
      .order("is_fast_pass", { ascending: false })
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })
  ]);

  if (settingsResult.error) throw settingsResult.error;
  if (playbackResult.error) throw playbackResult.error;
  if (requestsResult.error) throw requestsResult.error;

  const requests = requestsResult.data as QueueRequest[];
  const playback = playbackResult.data as PlaybackState;
  const nowPlaying =
    requests.find((request) => request.id === playback.current_request_id) ??
    requests.find((request) => request.status === "playing") ??
    null;
  const queued = requests
    .filter((request) => request.status === "queued")
    .map((request, index) => ({
      ...request,
      queue_number: index + 1
    }));

  return {
    settings: settingsResult.data as AppSettings,
    playback,
    nowPlaying,
    queued,
    history: requests.filter((request) => ["played", "skipped", "removed"].includes(request.status)).slice(-12)
  };
}

export async function nextQueuePosition(sessionId: string, fastPass = false) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("requests")
    .select("position")
    .eq("session_id", sessionId)
    .eq("status", "queued")
    .eq("is_fast_pass", fastPass)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.position ? Number(data.position) + 1 : 1;
}
