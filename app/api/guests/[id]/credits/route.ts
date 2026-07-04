import { NextResponse } from "next/server";
import { getGuestCredits } from "@/lib/credits";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return NextResponse.json({ credits: await getGuestCredits(id) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load credits" }, { status: 400 });
  }
}
