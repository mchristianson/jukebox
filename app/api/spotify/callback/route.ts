import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!code || !clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: "Missing Spotify callback configuration." }, { status: 400 });
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const json = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: json }, { status: response.status });
  }

  return NextResponse.json({
    message: "Copy SPOTIFY_REFRESH_TOKEN into .env.local and Vercel env. Keep it private.",
    env: {
      MUSIC_PROVIDER: "spotify",
      SPOTIFY_REFRESH_TOKEN: json.refresh_token
    },
    refresh_token: json.refresh_token,
    expires_in: json.expires_in
  });
}
