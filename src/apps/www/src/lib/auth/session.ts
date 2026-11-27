import { auth } from "@/lib/auth/server";
import type { AuthUser } from "@/lib/auth/types";

function normalizeDate(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  return null;
}

export async function getServerUser(): Promise<AuthUser | null> {
  try {
    const { data: session, error } = await auth.getSession();
    if (error || !session?.user) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name ?? null,
      emailVerified: Boolean(session.user.emailVerified),
      createdAt: normalizeDate(session.user.createdAt),
    };
  } catch {
    return null;
  }
}
