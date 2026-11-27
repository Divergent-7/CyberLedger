export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  createdAt: string | null;
}

export function getUserInitials(name?: string | null, email?: string): string {
  const source = (name?.trim() || email?.split("@")[0] || "CL").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function getUserDisplayName(user: Pick<AuthUser, "name" | "email">): string {
  const trimmed = user.name?.trim();
  if (trimmed) return trimmed;
  return user.email.split("@")[0] || user.email;
}
