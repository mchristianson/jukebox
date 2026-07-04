import { NextResponse } from "next/server";
import { clearHostAuthCookie } from "@/lib/host-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearHostAuthCookie(response);
  return response;
}
