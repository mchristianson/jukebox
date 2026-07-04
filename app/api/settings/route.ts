import { NextResponse } from "next/server";
import { z } from "zod";
import { getServiceSupabase } from "@/lib/supabase/server";

const settingsSchema = z.object({
  requests_locked: z.boolean().optional(),
  clearQueue: z.boolean().optional()
});

export async function PATCH(request: Request) {
  try {
    const input = settingsSchema.parse(await request.json());
    const supabase = getServiceSupabase();

    if (input.clearQueue) {
      await supabase.from("requests").update({ status: "removed" }).eq("status", "queued");
    }

    const updates: Record<string, boolean> = {};
    if (typeof input.requests_locked === "boolean") updates.requests_locked = input.requests_locked;

    const { data, error } = Object.keys(updates).length
      ? await supabase.from("app_settings").update(updates).eq("id", 1).select("*").single()
      : await supabase.from("app_settings").select("*").eq("id", 1).single();

    if (error) throw error;
    return NextResponse.json({ settings: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update settings" }, { status: 400 });
  }
}
