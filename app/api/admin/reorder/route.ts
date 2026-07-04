import { NextResponse } from "next/server";
import { z } from "zod";
import { requireHostAuth } from "@/lib/host-auth";
import { getServiceSupabase } from "@/lib/supabase/server";

const reorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1)
});

export async function PATCH(request: Request) {
  try {
    const unauthorized = await requireHostAuth();
    if (unauthorized) return unauthorized;

    const { orderedIds } = reorderSchema.parse(await request.json());
    const supabase = getServiceSupabase();

    await Promise.all(
      orderedIds.map((id, index) =>
        supabase
          .from("requests")
          .update({ position: index + 1 })
          .eq("id", id)
          .eq("status", "queued")
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not reorder queue" }, { status: 400 });
  }
}
