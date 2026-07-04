import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const HOST_AUTH_COOKIE = "barn_host";
const HOST_AUTH_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getHostPassword() {
  return process.env.HOST_PASSWORD?.trim() ?? "";
}

function signSession(timestamp: string) {
  return crypto.createHmac("sha256", getHostPassword()).update(timestamp).digest("hex");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  return aBuffer.length === bBuffer.length && crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function isHostPasswordConfigured() {
  return Boolean(getHostPassword());
}

export function verifyHostPassword(password: string) {
  const expected = getHostPassword();
  return Boolean(expected) && safeEqual(password, expected);
}

export function createHostSessionToken() {
  const timestamp = Date.now().toString();
  return `${timestamp}.${signSession(timestamp)}`;
}

export function isValidHostSessionToken(token?: string) {
  if (!token || !isHostPasswordConfigured()) return false;

  const [timestamp, signature] = token.split(".");
  if (!timestamp || !signature) return false;

  const issuedAt = Number(timestamp);
  if (!Number.isFinite(issuedAt)) return false;

  const ageMs = Date.now() - issuedAt;
  if (ageMs < 0 || ageMs > HOST_AUTH_MAX_AGE_SECONDS * 1000) return false;

  return safeEqual(signature, signSession(timestamp));
}

export async function isHostAuthenticated() {
  const cookieStore = await cookies();
  return isValidHostSessionToken(cookieStore.get(HOST_AUTH_COOKIE)?.value);
}

export async function requireHostAuth() {
  if (await isHostAuthenticated()) return null;
  return NextResponse.json({ error: "Host password required" }, { status: 401 });
}

export function setHostAuthCookie(response: NextResponse) {
  response.cookies.set(HOST_AUTH_COOKIE, createHostSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: HOST_AUTH_MAX_AGE_SECONDS
  });
}

export function clearHostAuthCookie(response: NextResponse) {
  response.cookies.set(HOST_AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}
