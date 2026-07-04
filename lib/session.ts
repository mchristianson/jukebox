import { getServiceSupabase } from "@/lib/supabase/server";

export async function getActiveSessionId() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("sessions")
    .select("id")
    .eq("join_slug", "barn")
    .maybeSingle();

  if (error) throw error;
  if (data?.id) return data.id as string;

  const { data: session, error: createError } = await supabase
    .from("sessions")
    .insert({ name: "Barn Party", join_slug: "barn" })
    .select("id")
    .single();

  if (createError) throw createError;

  await Promise.all([
    supabase.from("app_settings").upsert({ id: 1, session_id: session.id }, { onConflict: "id" }),
    supabase.from("playback_state").upsert({ id: 1, session_id: session.id }, { onConflict: "id" })
  ]);

  return session.id as string;
}
