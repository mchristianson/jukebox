import { NextResponse } from "next/server";
import { advancePlaybackIfFinished } from "@/lib/playback";

export async function POST() {
  try {
    return NextResponse.json(await advancePlaybackIfFinished());
  } catch (error) {
    console.error("Could not advance playback", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not advance playback" }, { status: 400 });
  }
}
