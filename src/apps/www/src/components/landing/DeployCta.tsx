"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { DASHBOARD_URL } from "@/lib/config";

const INSTALL_CMD = "curl -sSL get.secura.dev | sudo sh";

export function DeployCta() {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
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
      className="border-t border-line py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-7">
        <div className="grid grid-cols-1 items-center gap-8 rounded-lg border border-line bg-panel p-6 sm:p-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <h2
              id="deploy-heading"
              className="text-[clamp(1.65rem,3vw,2.15rem)] leading-[1.15] font-semibold tracking-[-0.03em] text-ink"
            >
              Protect your first server today.
            </h2>
            <p className="mt-3 max-w-[440px] text-[15px] leading-[1.6] text-ink-secondary">
              Install the Secura agent on any Ubuntu or Debian host and see your
              first insights in minutes.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center rounded-md bg-ink px-5 text-[14px] font-medium text-canvas transition-opacity hover:opacity-90"
              >
                Get started free
              </Link>
              <a
                href={DASHBOARD_URL}
                className="inline-flex h-11 items-center rounded-md border border-line bg-surface px-5 text-[14px] font-medium text-ink transition-colors hover:border-line-hover hover:bg-surface-hover"
              >
                Open live dashboard
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-line bg-well">
            <div className="flex items-center justify-between border-b border-line bg-surface/50 px-4 py-2.5 font-mono text-[11.5px] text-ink-muted">
              <span>Ubuntu / Debian quick install</span>
              <span>systemd agent</span>
            </div>
            <div className="p-4 font-mono text-[12.5px]">
              <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-panel px-3 py-2.5">
                <code className="overflow-x-auto text-ink">
                  <span className="mr-2 text-accent">$</span>
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
                className="mt-3.5 flex flex-col gap-1 text-[11.5px] text-ink-muted"
              >
                <div>Detected Debian/Ubuntu (systemd 255)</div>
                <div>Attached log collectors: sshd, nginx, nftables</div>
                <div className="text-safe">
                  Agent online. Streaming to Secura console.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
