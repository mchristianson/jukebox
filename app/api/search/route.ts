import { NextResponse } from "next/server";
import { getMusicProvider } from "@/lib/music";
import { getServiceSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") ?? "";
    const provider = getMusicProvider();
    const tracks = await provider.searchTracks(query);
    if (tracks.length) {
      const supabase = getServiceSupabase();
      const { error } = await supabase.from("tracks").upsert(tracks, { onConflict: "id" });
      if (error) {
        console.error("Could not cache searched tracks", error);
      }
    }
    return NextResponse.json({ tracks, provider: provider.name });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Search failed" }, { status: 500 });
  }
}
