export type RequestStatus = "queued" | "playing" | "played" | "skipped" | "removed";

export type Track = {
  id: string;
  provider: string;
  title: string;
  artist_name: string;
  album_art_url: string | null;
  duration_ms: number;
  spotify_uri: string | null;
};

export type QueueRequest = {
  id: string;
  session_id: string;
  guest_id: string | null;
  guest_name: string;
  track_id: string;
  track_title: string;
  artist_name: string;
  album_art_url: string | null;
  duration_ms: number;
  spotify_uri: string | null;
  status: RequestStatus;
  position: number;
  is_fast_pass: boolean;
  credits_spent: number;
  queue_number?: number;
  created_at: string;
  updated_at: string;
};

export type PlaybackState = {
  id: number;
  session_id: string | null;
  current_request_id: string | null;
  is_playing: boolean;
  provider: string;
  device_name: string | null;
  updated_at: string;
};

export type AppSettings = {
  id: number;
  session_id: string | null;
  requests_locked: boolean;
  updated_at: string;
};

export type QueueSnapshot = {
  settings: AppSettings;
  playback: PlaybackState;
  nowPlaying: QueueRequest | null;
  queued: QueueRequest[];
  history: QueueRequest[];
};

export type GuestCredits = {
  guestId: string;
  dailyAllowance: number;
  spentToday: number;
  available: number | null;
  isSuperUser: boolean;
  creditDate: string;
};

export type GuestPlayedTrack = Track & {
  playCount: number;
  lastPlayedAt: string;
};

export type CreateRequestInput = {
  guestId: string;
  guestName: string;
  trackId: string;
  fastPass?: boolean;
};
