import Link from "next/link";
import { DASHBOARD_URL } from "@/lib/config";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="flex min-h-[calc(100svh-60px)] items-center py-20 sm:py-24"
    >
      <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center px-5 text-center sm:px-7">
        <h1
          id="hero-heading"
          className="max-w-[740px] text-[clamp(2.35rem,5.4vw,3.9rem)] leading-[1.06] font-semibold tracking-[-0.04em] text-ink"
        >
          Stop attacks before they escalate.
        </h1>

        <p className="mt-6 max-w-[560px] text-[16px] leading-[1.6] text-ink-secondary sm:text-[17px]">
          Secura watches your servers in real time, explains every threat in
          plain language, and blocks attackers automatically.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center rounded-md bg-ink px-5 text-[14px] font-medium text-canvas transition-opacity hover:opacity-90"
          >
            Start protecting
          </Link>
          <a
            href={DASHBOARD_URL}
            className="inline-flex h-11 items-center rounded-md border border-line bg-panel px-5 text-[14px] font-medium text-ink transition-colors hover:border-line-hover hover:bg-surface"
          >
            Open live dashboard
          </a>
        </div>

        <ul
          aria-label="Core capabilities"
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] text-ink-muted"
        >
          <li className="inline-flex items-center gap-2">
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
              className="text-ink-secondary"
            >
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
            </svg>
            Triage in under 50 ms
          </li>
          <li className="inline-flex items-center gap-2">
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
              className="text-ink-secondary"
            >
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="3.5" />
            </svg>
            MITRE ATT&amp;CK mapped
          </li>
          <li className="inline-flex items-center gap-2">
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
              className="text-ink-secondary"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
            </svg>
            Zero-touch auto-block
          </li>
        </ul>
      </div>
    </section>
  );
}
