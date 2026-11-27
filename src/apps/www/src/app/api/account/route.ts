import { cookies } from "next/headers";

import { auth } from "@/lib/auth/server";
import { getDbPool } from "@/lib/db";

function isAllowedSameOriginRequest(request: Request): boolean {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "cross-site") {
    return false;
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  const allowed = new Set<string>();
  try {
    allowed.add(new URL(request.url).origin);
  } catch {
    // Ignore malformed request URL.
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (request.url.startsWith("https://") ? "https" : "http");
  if (host) {
    allowed.add(`${proto}://${host}`);
  }

  return allowed.has(origin);
}

export async function DELETE(request: Request) {
  const headers = new Headers({ "Cache-Control": "no-store" });

  if (!isAllowedSameOriginRequest(request)) {
    return Response.json({ error: "Forbidden origin" }, { status: 403, headers });
  }

  const { data: session, error } = await auth.getSession();
  if (error || !session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const pool = getDbPool();
    await pool.query('DELETE FROM neon_auth."user" WHERE id = $1', [session.user.id]);
  } catch (err) {
    console.error("[DELETE /api/account] Failed to delete user:", err);
    return Response.json(
      { error: "Unable to delete your account right now. Please try again." },
      { status: 500, headers },
    );
  }

  try {
    await auth.signOut();
  } catch {
    // Session row was already removed by ON DELETE CASCADE; clear cookies directly below.
  }

  const cookieStore = await cookies();
  const isHttps =
    request.url.startsWith("https://") || request.headers.get("x-forwarded-proto") === "https";
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.includes("neon-auth") || cookie.name.includes("better-auth")) {
      cookieStore.set(cookie.name, "", {
        path: "/",
        maxAge: 0,
        httpOnly: true,
        sameSite: "lax",
        secure: cookie.name.startsWith("__Secure-") || isHttps,
      });
    }
  }

  return Response.json({ success: true }, { headers });
}
