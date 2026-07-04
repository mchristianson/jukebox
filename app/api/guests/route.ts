import { NextResponse } from "next/server";
import { z } from "zod";
import { getActiveSessionId } from "@/lib/session";
import { getServiceSupabase } from "@/lib/supabase/server";

const guestSchema = z.object({
  displayName: z.string().trim().min(1).max(32)
});

function isConfiguredSuperUser(displayName: string) {
  const configuredNames = process.env.SUPER_USER_NAMES?.split(",") ?? [];
  return configuredNames.some((name) => name.trim().toLowerCase() === displayName.trim().toLowerCase());
}

export async function POST(request: Request) {
  try {
    const input = guestSchema.parse(await request.json());
    const supabase = getServiceSupabase();
    const sessionId = await getActiveSessionId();
    const isSuperUser = isConfiguredSuperUser(input.displayName);

    const { data: existingGuest, error: existingError } = await supabase
      .from("guests")
      .select("*")
      .eq("session_id", sessionId)
      .ilike("display_name", input.displayName)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existingGuest) {
      if (isSuperUser && !existingGuest.is_super_user) {
        const { data, error } = await supabase
          .from("guests")
          .update({ is_super_user: true })
          .eq("id", existingGuest.id)
          .select("*")
          .single();

        if (error) throw error;
        return NextResponse.json({ guest: data });
      }

      return NextResponse.json({ guest: existingGuest });
    }

    const { data, error } = await supabase
      .from("guests")
      .insert({ session_id: sessionId, display_name: input.displayName, is_super_user: isSuperUser })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ guest: data });
  } catch (error) {
    console.error("Could not join barn", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not join" }, { status: 400 });
  }
}
