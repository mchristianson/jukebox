import type { Track } from "@/lib/types";
import type { MusicProvider } from "./types";

type SpotifyTokenResponse = {
  access_token: string;
  expires_in: number;
};

type SpotifyDevice = {
  id: string | null;
  is_active: boolean;
  is_restricted: boolean;
  name: string;
};

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getSpotifyAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Spotify is not configured. Set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REFRESH_TOKEN.");
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    throw new Error(`Spotify token refresh failed: ${response.status}`);
  }

  const json = (await response.json()) as SpotifyTokenResponse;
  cachedToken = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

async function spotifyFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getSpotifyAccessToken();
  const response = await fetch(`https://api.spotify.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (response.status === 204) return undefined as T;
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Spotify API failed: ${response.status}${body ? ` ${body}` : ""}`);
  }
  return response.json() as Promise<T>;
}

function spotifySearchPath(query: string) {
  const params = new URLSearchParams();
  params.set("q", query.trim());
  params.set("type", "track");
  return `/search?${params.toString()}`;
}

async function getPlaybackDeviceId() {
  const data = await spotifyFetch<{ devices: SpotifyDevice[] }>("/me/player/devices");
  const devices = data.devices.filter((device) => device.id && !device.is_restricted);
  const device = devices.find((item) => item.is_active) ?? devices[0];

  if (!device?.id) {
    throw new Error("Spotify has no available playback device. Open Spotify on the target speaker/browser, start any song once, then try Play again.");
  }

  return device.id;
}

export const spotifyProvider: MusicProvider = {
  name: "spotify",
  async searchTracks(query: string) {
    if (!query.trim()) return [];
    const data = await spotifyFetch<{
      tracks: {
        items: Array<{
          id: string;
          name: string;
          uri: string;
          duration_ms: number;
          artists: Array<{ name: string }>;
          album: { images: Array<{ url: string }> };
        }>;
      };
    }>(spotifySearchPath(query));

    return data.tracks.items.slice(0, 12).map<Track>((track) => ({
      id: `spotify-${track.id}`,
      provider: "spotify",
      title: track.name,
      artist_name: track.artists.map((artist) => artist.name).join(", "),
      album_art_url: track.album.images[0]?.url ?? null,
      duration_ms: track.duration_ms,
      spotify_uri: track.uri
    }));
  },
  async playTrack(uri: string) {
    if (uri.includes("mock-")) {
      throw new Error("This queued song came from the mock catalog and cannot be played by Spotify. Search for the song again while Spotify mode is enabled.");
    }

    const params = new URLSearchParams({ device_id: await getPlaybackDeviceId() });
    await spotifyFetch<void>(`/me/player/play?${params.toString()}`, {
      method: "PUT",
      body: JSON.stringify({ uris: [uri] })
    });
  },
  async pause() {
    await spotifyFetch<void>("/me/player/pause", { method: "PUT" });
  },
  async skip() {
    await spotifyFetch<void>("/me/player/next", { method: "POST" });
  },
  async getPlaybackState() {
    const data = await spotifyFetch<{ is_playing: boolean; device: { name: string } | null }>("/me/player");
    return { isPlaying: data?.is_playing ?? false, deviceName: data?.device?.name ?? null };
  }
};
