"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { DASHBOARD_URL } from "@/lib/config";

const INSTALL_CMD = "curl -sSL get.cyberledger.dev | sudo sh";

export function DeployCta() {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const resetTimerRef = useRef<number | null>(null);

  const handleCopy = async () => {
    let copied = false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(INSTALL_CMD);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied) {
      const ta = document.createElement("textarea");
      ta.value = INSTALL_CMD;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        copied = document.execCommand("copy");
      } catch {
        copied = false;
      }
      document.body.removeChild(ta);
    }

    setCopyState(copied ? "copied" : "failed");
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = window.setTimeout(() => setCopyState("idle"), 1800);
  };

  return (
    <section
      id="start"
      aria-labelledby="deploy-heading"
      className="border-line border-t py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-7">
        <div className="border-line bg-panel grid grid-cols-1 items-center gap-8 rounded-lg border p-6 sm:p-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <h2
              id="deploy-heading"
              className="text-ink text-[clamp(1.65rem,3vw,2.15rem)] leading-[1.15] font-semibold tracking-[-0.03em]"
            >
              Protect your first server today.
            </h2>
            <p className="text-ink-secondary mt-3 max-w-[440px] text-[15px] leading-[1.6]">
              Install the cyberLedger agent on any Ubuntu or Debian host and see your first insights in
              minutes.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="bg-ink text-canvas inline-flex h-11 items-center rounded-md px-5 text-[14px] font-medium transition-opacity hover:opacity-90"
              >
                Get started free
              </Link>
              <a
                href={DASHBOARD_URL}
                className="border-line bg-surface text-ink hover:border-line-hover hover:bg-surface-hover inline-flex h-11 items-center rounded-md border px-5 text-[14px] font-medium transition-colors"
              >
                Open live dashboard
              </a>
            </div>
          </div>

          <div className="border-line bg-well overflow-hidden rounded-lg border">
            <div className="border-line bg-surface/50 text-ink-muted flex items-center justify-between border-b px-4 py-2.5 font-mono text-[11.5px]">
              <span>Ubuntu / Debian quick install</span>
              <span>systemd agent</span>
            </div>
            <div className="p-4 font-mono text-[12.5px]">
              <div className="border-line bg-panel flex items-center justify-between gap-3 rounded-md border px-3 py-2.5">
                <code className="text-ink overflow-x-auto">
                  <span className="text-accent mr-2">$</span>
                  {INSTALL_CMD}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Copy install command"
                  className={`shrink-0 cursor-pointer rounded border px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                    copyState === "copied"
                      ? "border-safe/30 bg-safe/12 text-safe"
                      : "border-line bg-surface text-ink-soft hover:border-line-hover hover:text-ink"
                  }`}
                >
                  {copyState === "copied"
                    ? "Copied"
                    : copyState === "failed"
                      ? "Copy failed"
                      : "Copy"}
                </button>
              </div>
              <div
                aria-hidden="true"
                className="text-ink-muted mt-3.5 flex flex-col gap-1 text-[11.5px]"
              >
                <div>Detected Debian/Ubuntu (systemd 255)</div>
                <div>Attached log collectors: sshd, nginx, nftables</div>
                <div className="text-safe">Agent online. Streaming to cyberLedger console.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
