import type { AppSettings, GuestCredits, GuestPlayedTrack, QueueRequest, QueueSnapshot, RequestStatus, Track } from "@/lib/types";

async function readJson<T>(response: Response): Promise<T> {
  const json = await response.json();
  if (!response.ok) throw new Error(json.error ?? "Request failed");
  return json as T;
}

export async function joinBarn(displayName: string) {
  return readJson<{ guest: { id: string; display_name: string } }>(
    await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName })
    })
  );
}

export async function fetchQueue() {
  return readJson<QueueSnapshot>(await fetch("/api/requests", { cache: "no-store" }));
}

export async function searchTracks(query: string) {
  return readJson<{ tracks: Track[]; provider: string }>(await fetch(`/api/search?q=${encodeURIComponent(query)}`));
}

export async function fetchGuestCredits(guestId: string) {
  return readJson<{ credits: GuestCredits }>(await fetch(`/api/guests/${guestId}/credits`, { cache: "no-store" }));
}

export async function fetchGuestPlayedTracks(guestId: string) {
  return readJson<{ tracks: GuestPlayedTrack[] }>(await fetch(`/api/guests/${guestId}/plays`, { cache: "no-store" }));
}

export async function createSongRequest(input: {
  guestId: string;
  guestName: string;
  trackId: string;
  fastPass?: boolean;
}) {
  return readJson<{ request: QueueRequest }>(
    await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    })
  );
}

export async function updateRequestStatus(id: string, status: RequestStatus, guestId?: string) {
  return readJson<{ request: QueueRequest }>(
    await fetch(`/api/requests/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, guestId })
    })
  );
}

export async function advancePlayback() {
  return readJson<{ advanced: boolean; request?: QueueRequest | null; reason?: string }>(
    await fetch("/api/playback/advance", { method: "POST" })
  );
}

export async function reorderQueue(orderedIds: string[]) {
  return readJson<{ ok: true }>(
    await fetch("/api/admin/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds })
    })
  );
}

export async function updateSettings(input: Partial<Pick<AppSettings, "requests_locked">> & { clearQueue?: boolean }) {
  return readJson<{ settings: AppSettings }>(
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    })
  );
}
