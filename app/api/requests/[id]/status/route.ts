import { NextResponse } from "next/server";
import { z } from "zod";
import { spendGuestCredits } from "@/lib/credits";
import { requireHostAuth } from "@/lib/host-auth";
import { getMusicProvider } from "@/lib/music";
import { startRequestPlayback } from "@/lib/playback";
import { getServiceSupabase } from "@/lib/supabase/server";
import type { QueueRequest } from "@/lib/types";

const statusSchema = z.object({
  status: z.enum(["queued", "playing", "played", "skipped", "removed"]),
  guestId: z.string().uuid().optional()
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const input = statusSchema.parse(await request.json());
    const supabase = getServiceSupabase();

    const { data: current, error: currentError } = await supabase
      .from("requests")
      .select("*")
      .eq("id", id)
      .single();
    if (currentError) throw currentError;

    const currentRequest = current as QueueRequest;
    const isHostAction = input.status !== "skipped" || !input.guestId;
    if (isHostAction) {
      const unauthorized = await requireHostAuth();
      if (unauthorized) return unauthorized;
    }

    if (input.status === "playing") {
      const request = await startRequestPlayback(currentRequest);
      return NextResponse.json({ request });
    }

    if (input.status === "skipped") {
      if (input.guestId) {
        await spendGuestCredits({ guestId: input.guestId, action: "skip", requestId: id });
      }
      await getMusicProvider().skip();
      await supabase.from("playback_state").update({ current_request_id: null, is_playing: false }).eq("id", 1);
    }

    if (input.status === "played" || (input.status === "removed" && currentRequest.status === "playing")) {
      await supabase.from("playback_state").update({ current_request_id: null, is_playing: false }).eq("id", 1);
    }

    const { data, error } = await supabase
      .from("requests")
      .update({ status: input.status })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ request: data });
  } catch (error) {
    console.error("Could not update request status", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update request" }, { status: 400 });
  }
}
