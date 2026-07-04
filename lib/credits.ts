import { getActiveSessionId } from "@/lib/session";
import { getServiceSupabase } from "@/lib/supabase/server";
import type { GuestCredits } from "@/lib/types";

export const DAILY_CREDIT_ALLOWANCE = 10;

export type CreditAction = "request" | "fast_pass" | "skip";

export const CREDIT_COSTS: Record<CreditAction, number> = {
  request: 1,
  fast_pass: 2,
  skip: 2
};

function todayKey() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: process.env.CREDIT_TIME_ZONE ?? "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const value = (type: string) => parts.find((part) => part.type === type)?.value;

  return `${value("year")}-${value("month")}-${value("day")}`;
}

export async function getGuestCredits(guestId: string): Promise<GuestCredits> {
  const supabase = getServiceSupabase();
  const sessionId = await getActiveSessionId();

  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .select("id, display_name, is_super_user")
    .eq("id", guestId)
    .eq("session_id", sessionId)
    .single();

  if (guestError) throw guestError;

  if (guest.is_super_user) {
    return {
      guestId,
      dailyAllowance: DAILY_CREDIT_ALLOWANCE,
      spentToday: 0,
      available: null,
      isSuperUser: true,
      creditDate: todayKey()
    };
  }

  const creditDate = todayKey();
  const { data, error } = await supabase
    .from("guest_credit_transactions")
    .select("credits")
    .eq("guest_id", guestId)
    .eq("credit_date", creditDate);

  if (error) throw error;

  const spentToday = (data ?? []).reduce((total, row) => total + Number(row.credits), 0);

  return {
    guestId,
    dailyAllowance: DAILY_CREDIT_ALLOWANCE,
    spentToday,
    available: Math.max(DAILY_CREDIT_ALLOWANCE - spentToday, 0),
    isSuperUser: false,
    creditDate
  };
}

export async function assertGuestCanSpend(guestId: string, action: CreditAction) {
  const credits = await getGuestCredits(guestId);
  const cost = CREDIT_COSTS[action];

  if (!credits.isSuperUser && credits.available !== null && credits.available < cost) {
    throw new Error(`You need ${cost} credits for that, but you only have ${credits.available} left today.`);
  }

  return credits;
}

export async function spendGuestCredits(input: {
  guestId: string;
  action: CreditAction;
  requestId?: string;
}) {
  const credits = await assertGuestCanSpend(input.guestId, input.action);
  const cost = CREDIT_COSTS[input.action];

  if (!credits.isSuperUser) {
    const supabase = getServiceSupabase();
    const sessionId = await getActiveSessionId();
    const { error } = await supabase.from("guest_credit_transactions").insert({
      session_id: sessionId,
      guest_id: input.guestId,
      request_id: input.requestId ?? null,
      action: input.action,
      credits: cost,
      credit_date: credits.creditDate
    });

    if (error) throw error;
  }

  return {
    ...credits,
    spentToday: credits.isSuperUser ? 0 : credits.spentToday + cost,
    available: credits.isSuperUser || credits.available === null ? null : Math.max(credits.available - cost, 0)
  };
}
