import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getActiveSessionId } from "@/lib/session";
import { getServiceSupabase } from "@/lib/supabase/server";

const guestSchema = z.object({
  displayName: z.string().trim().min(1).max(32)
});

const DEVICE_COOKIE = "barn_device";
const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

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

    const cookieStore = await cookies();
    const deviceId = cookieStore.get(DEVICE_COOKIE)?.value ?? crypto.randomUUID();

    // One guest row per device per session, regardless of display name typed,
    // so a guest can't dodge the daily credit cap by re-joining under a new name.
    const { data: existingGuest, error: existingError } = await supabase
      .from("guests")
      .select("*")
      .eq("session_id", sessionId)
      .eq("device_id", deviceId)
      .maybeSingle();

    if (existingError) throw existingError;

    const response = existingGuest
      ? await upsertExistingGuest(supabase, existingGuest, input.displayName, isSuperUser)
      : await insertGuest(supabase, sessionId, deviceId, input.displayName, isSuperUser);

    response.cookies.set(DEVICE_COOKIE, deviceId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: DEVICE_COOKIE_MAX_AGE
    });

    return response;
  } catch (error) {
    console.error("Could not join barn", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not join" }, { status: 400 });
  }
}

async function upsertExistingGuest(
  supabase: ReturnType<typeof getServiceSupabase>,
  existingGuest: Record<string, unknown>,
  displayName: string,
  isSuperUser: boolean
) {
  const updates: Record<string, unknown> = {};
  if (displayName !== existingGuest.display_name) updates.display_name = displayName;
  if (isSuperUser && !existingGuest.is_super_user) updates.is_super_user = true;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ guest: existingGuest });
  }

  const { data, error } = await supabase
    .from("guests")
    .update(updates)
    .eq("id", existingGuest.id as string)
    .select("*")
    .single();

  if (error) throw error;
  return NextResponse.json({ guest: data });
}

async function insertGuest(
  supabase: ReturnType<typeof getServiceSupabase>,
  sessionId: string,
  deviceId: string,
  displayName: string,
  isSuperUser: boolean
) {
  const { data, error } = await supabase
    .from("guests")
    .insert({ session_id: sessionId, device_id: deviceId, display_name: displayName, is_super_user: isSuperUser })
    .select("*")
    .single();

  if (error) throw error;
  return NextResponse.json({ guest: data });
}
