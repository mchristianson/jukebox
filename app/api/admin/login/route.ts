import { NextResponse } from "next/server";
import { z } from "zod";
import { isHostPasswordConfigured, setHostAuthCookie, verifyHostPassword } from "@/lib/host-auth";

const loginSchema = z.object({
  password: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    if (!isHostPasswordConfigured()) {
      return NextResponse.json({ error: "HOST_PASSWORD is not configured" }, { status: 500 });
    }

    const { password } = loginSchema.parse(await request.json());
    if (!verifyHostPassword(password)) {
      return NextResponse.json({ error: "Incorrect host password" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    setHostAuthCookie(response);
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not sign in" }, { status: 400 });
  }
}
