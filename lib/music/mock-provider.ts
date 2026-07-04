import { getServiceSupabase } from "@/lib/supabase/server";
import type { Track } from "@/lib/types";
import type { MusicProvider } from "./types";

export const mockTracks: Track[] = [
  {
    id: "mock-001",
    provider: "mock",
    title: "Friends in Low Places",
    artist_name: "Garth Brooks",
    album_art_url: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=600&auto=format&fit=crop",
    duration_ms: 258000,
    spotify_uri: "spotify:track:mock-001"
  },
  {
    id: "mock-002",
    provider: "mock",
    title: "Man! I Feel Like A Woman!",
    artist_name: "Shania Twain",
    album_art_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop",
    duration_ms: 233000,
    spotify_uri: "spotify:track:mock-002"
  },
  {
    id: "mock-003",
    provider: "mock",
    title: "Mr. Brightside",
    artist_name: "The Killers",
    album_art_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600&auto=format&fit=crop",
    duration_ms: 222000,
    spotify_uri: "spotify:track:mock-003"
  },
  {
    id: "mock-004",
    provider: "mock",
    title: "Before He Cheats",
    artist_name: "Carrie Underwood",
    album_art_url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=600&auto=format&fit=crop",
    duration_ms: 199000,
    spotify_uri: "spotify:track:mock-004"
  },
  {
    id: "mock-005",
    provider: "mock",
    title: "Sweet Caroline",
    artist_name: "Neil Diamond",
    album_art_url: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=600&auto=format&fit=crop",
    duration_ms: 203000,
    spotify_uri: "spotify:track:mock-005"
  },
  {
    id: "mock-006",
    provider: "mock",
    title: "Tennessee Whiskey",
    artist_name: "Chris Stapleton",
    album_art_url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=600&auto=format&fit=crop",
    duration_ms: 293000,
    spotify_uri: "spotify:track:mock-006"
  },
  {
    id: "mock-007",
    provider: "mock",
    title: "Dancing Queen",
    artist_name: "ABBA",
    album_art_url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&auto=format&fit=crop",
    duration_ms: 230000,
    spotify_uri: "spotify:track:mock-007"
  },
  {
    id: "mock-008",
    provider: "mock",
    title: "I Wanna Dance with Somebody",
    artist_name: "Whitney Houston",
    album_art_url: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=600&auto=format&fit=crop",
    duration_ms: 291000,
    spotify_uri: "spotify:track:mock-008"
  }
];

export function filterMockTracks(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return mockTracks;
  return mockTracks.filter((track) =>
    `${track.title} ${track.artist_name}`.toLowerCase().includes(normalized)
  );
}

export const mockMusicProvider: MusicProvider = {
  name: "mock",
  async searchTracks(query: string) {
    const supabase = getServiceSupabase();
    const trimmed = query.trim();
    let request = supabase.from("tracks").select("*").eq("provider", "mock").limit(12);

    if (trimmed) {
      request = request.or(`title.ilike.%${trimmed}%,artist_name.ilike.%${trimmed}%`);
    }

    const { data, error } = await request;
    if (error) throw error;

    const tracks = data as Track[];
    if (tracks.length) return tracks;

    const fallback = filterMockTracks(trimmed);
    if (fallback.length) {
      await supabase.from("tracks").upsert(fallback, { onConflict: "id" });
    }

    return fallback;
  },
  async playTrack() {},
  async pause() {},
  async skip() {},
  async getPlaybackState() {
    return { isPlaying: false, deviceName: "Mock barn speakers" };
  }
};
