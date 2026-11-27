"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CyberLedgerLogo } from "@/components/brand/CyberLedgerLogo";
import { AccountMenu } from "@/components/landing/AccountMenu";
import { useLandingAuth } from "@/components/landing/LandingAuthContext";
import { DASHBOARD_URL } from "@/lib/config";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useLandingAuth();

  useEffect(() => {
    const syncScroll = () => setScrolled(window.scrollY > 10);
    syncScroll();
    window.addEventListener("scroll", syncScroll, { passive: true });
    return () => window.removeEventListener("scroll", syncScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 h-[60px] border-b transition-colors duration-150 ${
        scrolled ? "border-line bg-canvas/95 backdrop-blur-sm" : "bg-canvas border-transparent"
      }`}
    >
      <div className="mx-auto flex h-full w-full max-w-[1120px] items-center justify-between gap-4 px-5 sm:px-7">
        <CyberLedgerLogo size={22} href="/" />

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          <a
            href="#product"
            className="text-ink-secondary hover:text-ink text-[13.5px] font-medium transition-colors"
          >
            Product
          </a>
          <a
            href="#how"
            className="text-ink-secondary hover:text-ink text-[13.5px] font-medium transition-colors"
          >
            How it works
          </a>
          <a
            href="#features"
            className="text-ink-secondary hover:text-ink text-[13.5px] font-medium transition-colors"
          >
            Features
          </a>
          <a
            href="#start"
            className="text-ink-secondary hover:text-ink text-[13.5px] font-medium transition-colors"
          >
            Deploy
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <a
                href={DASHBOARD_URL}
                className="text-ink-secondary hover:bg-surface hover:text-ink inline-flex h-8 items-center rounded-md px-3 text-[13px] font-medium transition-colors"
              >
                Live console
              </a>
              <AccountMenu user={user} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-ink-secondary hover:bg-surface hover:text-ink hidden h-8 items-center rounded-md px-3 text-[13px] font-medium transition-colors sm:inline-flex"
              >
                Sign in
              </Link>
              <a
                href={DASHBOARD_URL}
                className="text-ink-secondary hover:bg-surface hover:text-ink inline-flex h-8 items-center rounded-md px-3 text-[13px] font-medium transition-colors"
              >
                Live console
              </a>
              <Link
                href="/signup"
                className="bg-ink text-canvas inline-flex h-8 items-center rounded-md px-3.5 text-[13px] font-medium transition-opacity hover:opacity-90"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
