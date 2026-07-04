import { mockMusicProvider } from "./mock-provider";
import { spotifyProvider } from "./spotify-provider";
import type { MusicProvider } from "./types";

export function getMusicProvider(): MusicProvider {
  return process.env.MUSIC_PROVIDER === "spotify" ? spotifyProvider : mockMusicProvider;
}
