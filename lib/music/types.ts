import type { Track } from "@/lib/types";

export type MusicProvider = {
  name: string;
  searchTracks(query: string): Promise<Track[]>;
  playTrack(uri: string): Promise<void>;
  pause(): Promise<void>;
  skip(): Promise<void>;
  getPlaybackState(): Promise<{ isPlaying: boolean; deviceName: string | null }>;
};
