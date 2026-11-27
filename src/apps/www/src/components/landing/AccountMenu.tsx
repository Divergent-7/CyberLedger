"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useLandingAuth } from "@/components/landing/LandingAuthContext";
import { authClient } from "@/lib/auth/client";
import { type AuthUser, getUserDisplayName, getUserInitials } from "@/lib/auth/types";

function formatMemberSince(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function AccountMenu({ user }: { user: AuthUser }) {
  const router = useRouter();
  const { setUser } = useLandingAuth();

  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busyAction, setBusyAction] = useState<"signout" | "delete" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user.name, user.email);
  const memberSince = formatMemberSince(user.createdAt);
  const isBusy = busyAction !== null;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (isBusy) return;
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setConfirmingDelete(false);
        setErrorMessage(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isBusy) {
        setOpen(false);
        setConfirmingDelete(false);
        setErrorMessage(null);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isBusy]);

  const handleToggle = () => {
    if (isBusy) return;
    setOpen((prev) => {
      const next = !prev;
      if (!next) {
        setConfirmingDelete(false);
        setErrorMessage(null);
      }
      return next;
    });
  };

  const handleSignOut = async () => {
    if (isBusy) return;
    setBusyAction("signout");
    setErrorMessage(null);

    try {
      const { error } = await authClient.signOut();
      if (error) {
        setErrorMessage(error.message || "Unable to sign out right now.");
        return;
      }

      setOpen(false);
      setConfirmingDelete(false);
      setUser(null);
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to sign out right now.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (isBusy) return;
    setBusyAction("delete");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        credentials: "same-origin",
      });

      if (!res.ok) {
        let message = "Unable to delete your account right now.";
        try {
          const data = (await res.json()) as { error?: string };
          if (data?.error) message = data.error;
        } catch {
          // Ignore non-JSON error bodies.
        }
        setErrorMessage(message);
        return;
      }

      await authClient.signOut().catch(() => {});
      setOpen(false);
      setConfirmingDelete(false);
      setUser(null);
      router.refresh();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Unable to delete your account right now.",
      );
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="account-menu-panel"
        aria-label={`Account menu for ${displayName}`}
        className={`border-line inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border pr-2.5 pl-1.5 text-[13px] font-medium transition-colors ${
          open
            ? "border-line-hover bg-surface text-ink"
            : "bg-panel text-ink hover:border-line-hover hover:bg-surface"
        }`}
      >
        <span
          aria-hidden="true"
          className="border-line bg-surface text-ink-soft flex h-5 w-5 shrink-0 items-center justify-center rounded border font-mono text-[10px] font-medium"
        >
          {initials}
        </span>
        <span className="hidden max-w-[140px] truncate sm:inline">{displayName}</span>
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`text-ink-muted shrink-0 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          id="account-menu-panel"
          role="dialog"
          aria-label="Account details"
          className="border-line bg-panel absolute top-[calc(100%+8px)] right-0 z-50 w-[296px] overflow-hidden rounded-lg border shadow-[0_18px_48px_rgba(0,0,0,0.55)] sm:w-[316px]"
        >
          {/* Account info header */}
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="border-line bg-surface text-ink-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-md border font-mono text-[12.5px] font-medium"
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-ink truncate text-[14px] font-semibold tracking-[-0.01em]">
                  {displayName}
                </div>
                <div className="text-ink-secondary truncate font-mono text-[11.5px]">
                  {user.email}
                </div>
              </div>
            </div>

            <div className="border-line bg-well mt-3.5 flex flex-col gap-1.5 rounded-md border px-3 py-2.5 font-mono text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-muted">Status</span>
                <span className="text-safe inline-flex items-center gap-1.5">
                  <span className="bg-safe h-1.5 w-1.5 rounded-full" aria-hidden="true" />
                  Signed in
                </span>
              </div>
              {memberSince && (
                <div className="border-line flex items-center justify-between gap-2 border-t pt-1.5">
                  <span className="text-ink-muted">Member since</span>
                  <span className="text-ink-soft">{memberSince}</span>
                </div>
              )}
              <div className="border-line flex items-center justify-between gap-2 border-t pt-1.5">
                <span className="text-ink-muted">Email</span>
                <span className={user.emailVerified ? "text-safe" : "text-ink-secondary"}>
                  {user.emailVerified ? "Verified" : "Unverified"}
                </span>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="border-danger/35 bg-danger/10 text-danger mx-4 mb-3 rounded-md border px-3 py-2 text-[12px] leading-[1.45]"
            >
              {errorMessage}
            </div>
          )}

          {!confirmingDelete ? (
            <div className="border-line flex flex-col gap-1 border-t p-2">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isBusy}
                className="text-ink-soft hover:bg-surface hover:text-ink flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-left text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="text-ink-muted shrink-0"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                <span>{busyAction === "signout" ? "Signing out..." : "Sign out"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setConfirmingDelete(true);
                }}
                disabled={isBusy}
                className="text-danger hover:bg-danger/10 flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-left text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                <span>Delete account</span>
              </button>
            </div>
          ) : (
            <div className="border-line bg-well/60 border-t p-3.5">
              <div className="text-ink text-[13px] font-semibold">Delete your account?</div>
              <p className="text-ink-secondary mt-1 text-[12px] leading-[1.5]">
                This permanently deletes{" "}
                <span className="text-ink-soft font-mono">{user.email}</span> and signs you out of
                all sessions. This action cannot be undone.
              </p>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmingDelete(false);
                    setErrorMessage(null);
                  }}
                  disabled={isBusy}
                  className="border-line bg-surface text-ink-soft hover:border-line-hover hover:text-ink inline-flex h-8 cursor-pointer items-center rounded-md border px-3 text-[12.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isBusy}
                  className="bg-danger text-canvas inline-flex h-8 cursor-pointer items-center rounded-md px-3 text-[12.5px] font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyAction === "delete" ? "Deleting..." : "Delete account"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
