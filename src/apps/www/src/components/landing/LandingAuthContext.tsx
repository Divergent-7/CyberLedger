"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

import type { AuthUser } from "@/lib/auth/types";

interface LandingAuthContextValue {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}

const LandingAuthContext = createContext<LandingAuthContextValue | null>(null);

export function LandingAuthProvider({
  initialUser,
  children,
}: {
  initialUser: AuthUser | null;
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    let active = true;

    const syncSession = async () => {
      try {
        const res = await fetch("/api/me", {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!active) return;

        if (res.status === 401 || res.status === 403) {
          setUser(null);
          return;
        }
        if (!res.ok) return;

        const data = (await res.json()) as {
          user?: {
            id: string;
            email: string;
            name?: string | null;
            emailVerified?: boolean;
            createdAt?: string | null;
          };
        };

        if (!active) return;
        if (!data?.user) {
          setUser(null);
          return;
        }

        const nextUser = data.user;
        setUser((prev) => ({
          id: nextUser.id,
          email: nextUser.email,
          name: nextUser.name ?? null,
          emailVerified: Boolean(nextUser.emailVerified),
          createdAt: nextUser.createdAt ?? (prev?.id === nextUser.id ? prev.createdAt : null),
        }));
      } catch {
        // Keep existing state on transient network failure.
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void syncSession();
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void syncSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  return (
    <LandingAuthContext.Provider value={{ user, setUser }}>{children}</LandingAuthContext.Provider>
  );
}

export function useLandingAuth(): LandingAuthContextValue {
  const ctx = useContext(LandingAuthContext);
  if (!ctx) {
    throw new Error("useLandingAuth must be used within a LandingAuthProvider");
  }
  return ctx;
}
