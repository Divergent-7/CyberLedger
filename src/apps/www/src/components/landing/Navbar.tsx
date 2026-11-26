"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SecuraLogo } from "@/components/brand/SecuraLogo";
import { DASHBOARD_URL } from "@/lib/config";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const syncScroll = () => setScrolled(window.scrollY > 10);
    syncScroll();
    window.addEventListener("scroll", syncScroll, { passive: true });
    return () => window.removeEventListener("scroll", syncScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 h-[60px] border-b transition-colors duration-150 ${
        scrolled
          ? "border-line bg-canvas/95 backdrop-blur-sm"
          : "border-transparent bg-canvas"
      }`}
    >
      <div className="mx-auto flex h-full w-full max-w-[1120px] items-center justify-between gap-4 px-5 sm:px-7">
        <SecuraLogo size={22} href="/" />

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          <a
            href="#product"
            className="text-[13.5px] font-medium text-ink-secondary transition-colors hover:text-ink"
          >
            Product
          </a>
          <a
            href="#how"
            className="text-[13.5px] font-medium text-ink-secondary transition-colors hover:text-ink"
          >
            How it works
          </a>
          <a
            href="#features"
            className="text-[13.5px] font-medium text-ink-secondary transition-colors hover:text-ink"
          >
            Features
          </a>
          <a
            href="#start"
            className="text-[13.5px] font-medium text-ink-secondary transition-colors hover:text-ink"
          >
            Deploy
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden h-8 items-center rounded-md px-3 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink sm:inline-flex"
          >
            Sign in
          </Link>
          <a
            href={DASHBOARD_URL}
            className="inline-flex h-8 items-center rounded-md px-3 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink"
          >
            Live console
          </a>
          <Link
            href="/signup"
            className="inline-flex h-8 items-center rounded-md bg-ink px-3.5 text-[13px] font-medium text-canvas transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
