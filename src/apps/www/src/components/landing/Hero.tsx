"use client";

import Link from "next/link";

import { useLandingAuth } from "@/components/landing/LandingAuthContext";
import { DASHBOARD_URL } from "@/lib/config";

export function Hero() {
  const { user } = useLandingAuth();

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex min-h-[calc(100svh-60px)] flex-col items-center justify-center overflow-hidden px-5 pt-10 pb-8 sm:px-7"
    >
      {/* Subtle architectural grid masked toward the edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(237,236,236,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(237,236,236,0.03)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_65%_at_50%_45%,#000_35%,transparent_100%)] bg-[size:64px_64px]"
      />

      {/* Warm radial amber-orange glow behind the headline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[40%] left-1/2 h-[420px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,78,0,0.16)_0%,rgba(245,78,0,0.06)_42%,transparent_72%)] blur-2xl"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1120px] flex-1 flex-col items-center justify-center text-center">
        {/* Announcement pill */}
        <div className="border-line bg-panel/85 mb-8 inline-flex items-center gap-2.5 rounded-full border py-1 pr-3.5 pl-1.5 backdrop-blur-xs">
          <span className="bg-accent rounded-full px-2 py-0.5 text-[10.5px] leading-none font-semibold tracking-[0.04em] text-white uppercase">
            New
          </span>
          <span className="bg-accent h-1.5 w-1.5 rounded-full" aria-hidden="true" />
          <span className="text-ink-secondary text-[12.5px] font-medium">
            Hybrid-AI threat detection for Linux servers
          </span>
        </div>

        {/* Headline with warm-white to accent gradient on second line */}
        <h1
          id="hero-heading"
          className="text-ink max-w-[820px] text-[clamp(2.75rem,6.4vw,4.75rem)] leading-[1.06] font-semibold tracking-[-0.04em]"
        >
          <span className="block">Stop attacks</span>
          <span className="block bg-[linear-gradient(90deg,#EDECEC_0%,#EDECEC_28%,#F6B592_55%,#F54E00_100%)] bg-clip-text text-transparent">
            before they escalate.
          </span>
        </h1>

        <p className="text-ink-secondary mt-6 max-w-[540px] text-[16px] leading-[1.6] sm:text-[17.5px]">
          cyberLedger watches your servers in real time, explains every threat in plain language,
          and blocks attackers automatically.
        </p>

        {/* Primary & secondary CTAs */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {user ? (
            <>
              <a
                href={DASHBOARD_URL}
                className="bg-ink text-canvas inline-flex h-11 items-center gap-2 rounded-md px-6 text-[14px] font-medium transition-opacity hover:opacity-90"
              >
                <span>Open live dashboard</span>
                <span aria-hidden="true">&rarr;</span>
              </a>
              <a
                href="#start"
                className="border-line bg-panel/90 text-ink hover:border-line-hover hover:bg-surface inline-flex h-11 items-center rounded-md border px-6 text-[14px] font-medium transition-colors"
              >
                Deploy an agent
              </a>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="bg-ink text-canvas inline-flex h-11 items-center gap-2 rounded-md px-6 text-[14px] font-medium transition-opacity hover:opacity-90"
              >
                <span>Start protecting</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
              <a
                href={DASHBOARD_URL}
                className="border-line bg-panel/90 text-ink hover:border-line-hover hover:bg-surface inline-flex h-11 items-center rounded-md border px-6 text-[14px] font-medium transition-colors"
              >
                Open live dashboard
              </a>
            </>
          )}
        </div>

        {/* Divider + capability highlights */}
        <div className="border-line/80 mt-12 w-full max-w-[580px] border-t pt-5">
          <ul
            aria-label="Core capabilities"
            className="text-ink-muted flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-[12.5px]"
          >
            <li className="inline-flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="text-accent"
              >
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
              </svg>
              Triage in under 50 ms
            </li>
            <li className="inline-flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="text-accent"
              >
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="3.5" />
              </svg>
              MITRE ATT&amp;CK mapped
            </li>
            <li className="inline-flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="text-accent"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              </svg>
              Zero-touch auto-block
            </li>
          </ul>
        </div>
      </div>

      {/* Scroll-down mouse indicator */}
      <a
        href="#product"
        aria-label="Scroll to product overview"
        className="text-ink-muted hover:text-ink-soft relative z-10 mt-8 inline-flex flex-col items-center gap-1 transition-colors"
      >
        <svg
          width="24"
          height="36"
          viewBox="0 0 24 36"
          fill="none"
          aria-hidden="true"
          className="overflow-visible"
        >
          <rect
            x="1.5"
            y="1.5"
            width="21"
            height="33"
            rx="10.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="10.75"
            y="8"
            width="2.5"
            height="6"
            rx="1.25"
            fill="currentColor"
            className="animate-scroll-wheel motion-reduce:animate-none"
          />
        </svg>
      </a>
    </section>
  );
}
