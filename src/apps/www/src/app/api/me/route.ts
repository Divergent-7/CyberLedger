import { auth } from "@/lib/auth/server";
import { DASHBOARD_URL } from "@/lib/config";

function getAllowedOrigins(request: Request): Set<string> {
  const allowed = new Set<string>([
    "https://app.cyberledger.dev",
    "https://cyber-ledger-dashboard-mohamedsayed0573s-projects.vercel.app",
  ]);

  try {
    allowed.add(new URL(request.url).origin);
  } catch {
    // Ignore malformed request URL.
  }

  try {
    allowed.add(new URL(DASHBOARD_URL).origin);
  } catch {
    // Ignore malformed DASHBOARD_URL.
  }

  if (process.env.NODE_ENV !== "production") {
    allowed.add("http://localhost:5173");
    allowed.add("http://127.0.0.1:5173");
  }

  return allowed;
}

function getAllowedOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  return getAllowedOrigins(request).has(origin) ? origin : null;
}

function buildHeaders(request: Request): Headers {
  const headers = new Headers({
    "Cache-Control": "no-store",
    Vary: "Origin",
  });
  const allowedOrigin = getAllowedOrigin(request);
  if (allowedOrigin) {
    headers.set("Access-Control-Allow-Origin", allowedOrigin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
  }
  return headers;
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  const allowedOrigin = getAllowedOrigin(request);
  if (origin && !allowedOrigin) {
    return new Response(null, { status: 403, headers: buildHeaders(request) });
  }
  return new Response(null, {
    status: 204,
    headers: buildHeaders(request),
  });
}

export async function GET(request: Request) {
  const headers = buildHeaders(request);
  const { data: session, error } = await auth.getSession();

  if (error || !session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  return Response.json(
    {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        emailVerified: session.user.emailVerified,
        createdAt: session.user.createdAt ?? null,
      },
    },
    { headers },
  );
}

export async function DELETE(request: Request) {
  const headers = buildHeaders(request);
  const origin = request.headers.get("origin");
  if (origin && !getAllowedOrigin(request)) {
    return Response.json({ error: "Forbidden origin" }, { status: 403, headers });
  }

  await auth.signOut();
  return Response.json({ success: true }, { headers });
}
