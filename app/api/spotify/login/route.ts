import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "Set SPOTIFY_CLIENT_ID and SPOTIFY_REDIRECT_URI first." }, { status: 400 });
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "user-read-playback-state user-modify-playback-state"
  });

  return NextResponse.redirect(`https://accounts.spotify.com/authorize?${params}`);
}
