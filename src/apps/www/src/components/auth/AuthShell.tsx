"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

import { CyberLedgerLogo } from "@/components/brand/CyberLedgerLogo";
import { authClient } from "@/lib/auth/client";
import { DASHBOARD_URL } from "@/lib/config";

export type AuthMode = "login" | "signup";

interface NoticeState {
  tone: "info" | "error" | "success";
  message: string;
  link?: { href: string; label: string };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordStrength(value: string): { score: number; label: string } {
  if (!value) return { score: 0, label: "Min. 8 chars" };
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value) || value.length >= 12) score += 1;
  const clamped = Math.max(1, Math.min(4, score));
  const labels = ["Min. 8 chars", "Weak", "Fair", "Good", "Strong"];
  return { score: clamped, label: labels[clamped] };
}

export function AuthShell({ mode }: { mode: AuthMode }) {
  const isSignup = mode === "signup";
  const alternateHref = isSignup ? "/login" : "/signup";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [invalidFields, setInvalidFields] = useState<{
    name?: boolean;
    email?: boolean;
    password?: boolean;
  }>({});
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();

    if (!isSignup) {
      const nextInvalid: { email?: boolean; password?: boolean } = {};
      if (!trimmedEmail || !EMAIL_RE.test(trimmedEmail)) nextInvalid.email = true;
      if (!password) nextInvalid.password = true;

      setInvalidFields(nextInvalid);
      if (nextInvalid.email || nextInvalid.password) {
        setNotice({
          tone: "error",
          message: nextInvalid.email
            ? "Enter a valid email address and your password to sign in."
            : "Enter your password to sign in.",
        });
        return;
      }

      setSubmitting(true);
      setNotice(null);
      try {
        const { error } = await authClient.signIn.email({
          email: trimmedEmail,
          password,
          rememberMe: remember,
        });
        if (error) {
          setNotice({
            tone: "error",
            message: error.message || "Invalid email or password.",
          });
          return;
        }
        window.location.assign(DASHBOARD_URL);
      } catch (err) {
        setNotice({
          tone: "error",
          message: err instanceof Error ? err.message : "Unable to sign in right now.",
        });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const nextInvalid: { name?: boolean; email?: boolean; password?: boolean } = {};
    if (!trimmedName) nextInvalid.name = true;
    if (!trimmedEmail || !EMAIL_RE.test(trimmedEmail)) nextInvalid.email = true;
    if (password.length < 8) nextInvalid.password = true;

    setInvalidFields(nextInvalid);
    if (nextInvalid.name || nextInvalid.email || nextInvalid.password) {
      setNotice({
        tone: "error",
        message:
          "Enter your full name, a valid work email, and a password of at least 8 characters.",
      });
      return;
    }

    setSubmitting(true);
    setNotice(null);
    try {
      const { error } = await authClient.signUp.email({
        email: trimmedEmail,
        password,
        name: trimmedName,
      });
      if (error) {
        setNotice({
          tone: "error",
          message: error.message || "Could not create account.",
        });
        return;
      }
      window.location.assign(DASHBOARD_URL);
    } catch (err) {
      setNotice({
        tone: "error",
        message: err instanceof Error ? err.message : "Unable to create account right now.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const strengthBarColor = (barIdx: number) => {
    if (barIdx >= strength.score) return "bg-line";
    if (strength.score === 1) return "bg-danger";
    if (strength.score === 2) return "bg-warn";
    return "bg-safe";
  };

  const strengthLabelColor =
    strength.score === 0
      ? "text-ink-muted"
      : strength.score === 1
        ? "text-danger"
        : strength.score === 2
          ? "text-warn"
          : "text-safe";

  const noticeClass =
    notice?.tone === "error"
      ? "border-danger/35 bg-danger/10 text-danger"
      : notice?.tone === "success"
        ? "border-safe/35 bg-safe/10 text-safe"
        : "border-line bg-well text-ink-soft";

  return (
    <div className="bg-canvas text-ink flex min-h-svh flex-col text-[14px]">
      <header className="border-line bg-canvas h-14 shrink-0 border-b">
        <div className="mx-auto flex h-full w-full max-w-[1040px] items-center justify-between gap-4 px-4 sm:px-6">
          <CyberLedgerLogo size={22} href="/" />

          <nav aria-label="Authentication navigation" className="flex items-center gap-2">
            <Link
              href="/"
              className="text-ink-secondary hover:bg-surface hover:text-ink hidden h-8 items-center rounded-md px-3 text-[13px] font-medium transition-colors sm:inline-flex"
            >
              Back to home
            </Link>
            <a
              href={DASHBOARD_URL}
              className="text-ink-secondary hover:bg-surface hover:text-ink inline-flex h-8 items-center rounded-md px-3 text-[13px] font-medium transition-colors"
            >
              Live console
            </a>
            <Link
              href={alternateHref}
              className="border-line bg-panel text-ink hover:border-line-hover hover:bg-surface inline-flex h-8 items-center rounded-md border px-3 text-[13px] font-medium transition-colors"
            >
              {isSignup ? "Sign in" : "Create account"}
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-start px-4 py-6 sm:justify-center sm:px-6 sm:py-10">
        <div className="w-full max-w-[420px]">
          <section
            aria-labelledby="authHeading"
            className="border-line bg-panel rounded-lg border p-5 sm:p-7"
          >
            <div
              role="tablist"
              aria-label="Authentication mode"
              className="border-line bg-well grid grid-cols-2 gap-1 rounded-md border p-1"
            >
              <Link
                href="/login"
                role="tab"
                aria-selected={!isSignup}
                className={`flex h-8 items-center justify-center rounded text-[13px] font-medium transition-colors ${
                  !isSignup ? "bg-surface text-ink shadow-xs" : "text-ink-secondary hover:text-ink"
                }`}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                role="tab"
                aria-selected={isSignup}
                className={`flex h-8 items-center justify-center rounded text-[13px] font-medium transition-colors ${
                  isSignup ? "bg-surface text-ink shadow-xs" : "text-ink-secondary hover:text-ink"
                }`}
              >
                Create account
              </Link>
            </div>

            <div className="mt-6">
              <h1
                id="authHeading"
                className="text-ink text-[20px] leading-tight font-semibold tracking-[-0.025em]"
              >
                {isSignup ? "Create your cyberLedger account" : "Sign in to cyberLedger"}
              </h1>
              <p className="text-ink-secondary mt-1.5 text-[13.5px] leading-[1.5]">
                {isSignup
                  ? "Start protecting Linux servers with real-time detection and blocks."
                  : "Monitor Linux servers, inspect live incidents, and manage blocks."}
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() =>
                  setNotice({
                    tone: "info",
                    message: `Connect your Google OAuth client to enable one-click ${
                      isSignup ? "sign up" : "sign in"
                    }.`,
                  })
                }
                className="border-line bg-surface text-ink hover:border-line-hover hover:bg-surface-hover flex h-10 w-full cursor-pointer items-center justify-center gap-2.5 rounded-md border px-3.5 text-[13.5px] font-medium transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.9 1.5l2.7-2.6C16.9 3.2 14.7 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12Z"
                  />
                  <path
                    fill="#34A853"
                    d="M3.3 7.4l3.2 2.3C7.4 7.7 9.5 6 12 6c1.9 0 3.1.8 3.9 1.5l2.7-2.6C16.9 3.2 14.7 2.2 12 2.2 8.2 2.2 4.9 4.3 3.3 7.4Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M12 21.8c2.6 0 4.8-.9 6.4-2.4l-3-2.5c-.8.6-1.9 1-3.4 1-3.2 0-5.4-2.1-5.8-4.9l-3.2 2.5c1.6 3.7 5 6.3 9 6.3Z"
                  />
                  <path
                    fill="#4285F4"
                    d="M21.4 12.2c0-.6-.1-1.1-.2-1.6H12v3.9h5.5c-.3 1.4-1.1 2.5-2.1 3.2l3 2.5c1.8-1.6 3-4.1 3-8Z"
                  />
                </svg>
                <span>{isSignup ? "Sign up with Google" : "Sign in with Google"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setNotice({
                    tone: "info",
                    message: `Connect your GitHub OAuth client to enable one-click ${
                      isSignup ? "sign up" : "sign in"
                    }.`,
                  })
                }
                className="border-line bg-surface text-ink hover:border-line-hover hover:bg-surface-hover flex h-10 w-full cursor-pointer items-center justify-center gap-2.5 rounded-md border px-3.5 text-[13.5px] font-medium transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
                  />
                </svg>
                <span>{isSignup ? "Sign up with GitHub" : "Sign in with GitHub"}</span>
              </button>
            </div>

            <div className="text-ink-muted my-5 flex items-center gap-3 text-[12px]">
              <span className="bg-line h-px flex-1" aria-hidden="true" />
              <span>{isSignup ? "or sign up with email" : "or continue with email"}</span>
              <span className="bg-line h-px flex-1" aria-hidden="true" />
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {isSignup && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fullName" className="text-ink-soft text-[12.5px] font-medium">
                    Full name
                  </label>
                  <input
                    id="fullName"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Alex Rivera"
                    value={fullName}
                    aria-invalid={invalidFields.name || undefined}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (invalidFields.name)
                        setInvalidFields((prev) => ({ ...prev, name: false }));
                    }}
                    className={`bg-well text-ink placeholder:text-ink-muted focus:border-line-strong h-10 w-full rounded-md border px-3 text-[13.5px] focus:outline-none ${
                      invalidFields.name ? "border-danger" : "border-line"
                    }`}
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-ink-soft text-[12.5px] font-medium">
                  {isSignup ? "Work email" : "Email"}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  required
                  value={email}
                  aria-invalid={invalidFields.email || undefined}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (invalidFields.email) {
                      setInvalidFields((prev) => ({ ...prev, email: false }));
                    }
                  }}
                  className={`bg-well text-ink placeholder:text-ink-muted focus:border-line-strong h-10 w-full rounded-md border px-3 text-[13.5px] focus:outline-none ${
                    invalidFields.email ? "border-danger" : "border-line"
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="password" className="text-ink-soft text-[12.5px] font-medium">
                    Password
                  </label>
                  {!isSignup && (
                    <button
                      type="button"
                      onClick={() =>
                        setNotice({
                          tone: "info",
                          message:
                            "Connect your authentication backend to send password reset links.",
                        })
                      }
                      className="text-ink-secondary hover:text-ink cursor-pointer text-[12px] transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
                    required
                    value={password}
                    aria-invalid={invalidFields.password || undefined}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (invalidFields.password) {
                        setInvalidFields((prev) => ({
                          ...prev,
                          password: false,
                        }));
                      }
                    }}
                    className={`bg-well text-ink placeholder:text-ink-muted focus:border-line-strong h-10 w-full rounded-md border pr-10 pl-3 text-[13.5px] focus:outline-none ${
                      invalidFields.password ? "border-danger" : "border-line"
                    }`}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-ink-muted hover:text-ink absolute inset-y-0 right-0 flex w-10 cursor-pointer items-center justify-center transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {isSignup && (
                  <div aria-live="polite" className="mt-1 flex items-center justify-between gap-3">
                    <div aria-hidden="true" className="grid flex-1 grid-cols-4 gap-1.5">
                      {[0, 1, 2, 3].map((idx) => (
                        <span
                          key={idx}
                          className={`h-1 rounded-full transition-colors ${strengthBarColor(idx)}`}
                        />
                      ))}
                    </div>
                    <span className={`font-mono text-[11px] ${strengthLabelColor}`}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {!isSignup && (
                <label className="text-ink-secondary flex cursor-pointer items-center gap-2 text-[13px]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="border-line bg-well accent-accent h-3.5 w-3.5 rounded"
                  />
                  <span>Keep me signed in for 30 days</span>
                </label>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="bg-ink text-canvas mt-1 flex h-10 w-full cursor-pointer items-center justify-center rounded-md px-4 text-[13.5px] font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? isSignup
                    ? "Creating account..."
                    : "Signing in..."
                  : isSignup
                    ? "Create account"
                    : "Sign in"}
              </button>
            </form>

            {isSignup && (
              <p className="text-ink-muted mt-3.5 text-center text-[12px] leading-[1.5]">
                By creating an account, you agree to cyberLedger&apos;s{" "}
                <button
                  type="button"
                  onClick={() =>
                    setNotice({
                      tone: "info",
                      message: "Link your hosted Terms of Service document before publishing.",
                    })
                  }
                  className="text-ink-secondary hover:text-ink cursor-pointer underline underline-offset-2"
                >
                  Terms
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  onClick={() =>
                    setNotice({
                      tone: "info",
                      message: "Link your hosted Privacy Policy document before publishing.",
                    })
                  }
                  className="text-ink-secondary hover:text-ink cursor-pointer underline underline-offset-2"
                >
                  Privacy Policy
                </button>
                .
              </p>
            )}

            {notice && (
              <div
                role="status"
                aria-live="polite"
                className={`mt-4 flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-[12.5px] leading-[1.45] ${noticeClass}`}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="mt-0.5 shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span>
                  {notice.message}
                  {notice.link && (
                    <>
                      {" "}
                      <a
                        href={notice.link.href}
                        className="font-medium underline underline-offset-2 hover:opacity-80"
                      >
                        {notice.link.label}
                      </a>
                    </>
                  )}
                </span>
              </div>
            )}

            <div className="border-line text-ink-secondary mt-5 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-[13px]">
              <span>{isSignup ? "Already have an account?" : "New to cyberLedger?"}</span>
              <Link
                href={alternateHref}
                className="text-ink hover:text-accent font-medium transition-colors"
              >
                {isSignup ? "Sign in" : "Create account"}
              </Link>
            </div>
          </section>

          <footer className="text-ink-muted mt-4 flex flex-wrap items-center justify-between gap-3 px-1 text-[12px]">
            {isSignup ? (
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
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
                  >
                    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
                  </svg>
                  2-min agent install
                </span>
                <span className="inline-flex items-center gap-1.5">
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
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                  </svg>
                  No credit card required
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
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
                  >
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                  TLS 1.3 encrypted
                </span>
                <span className="inline-flex items-center gap-1.5">
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
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                  </svg>
                  Audited sessions
                </span>
              </div>
            )}

            <a href={DASHBOARD_URL} className="text-ink-secondary hover:text-ink transition-colors">
              Inspect console
            </a>
          </footer>
        </div>
      </main>
    </div>
  );
}
