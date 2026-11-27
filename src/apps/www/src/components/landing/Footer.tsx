import Link from "next/link";

import { SecuraLogo } from "@/components/brand/SecuraLogo";
import { DASHBOARD_URL } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-line border-t py-8">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col items-start justify-between gap-4 px-5 sm:flex-row sm:items-center sm:px-7">
        <SecuraLogo size={20} href="/" />
        <nav
          aria-label="Footer"
          className="text-ink-secondary flex flex-wrap items-center gap-5 text-[13px]"
        >
          <a href="#product" className="hover:text-ink transition-colors">
            Product
          </a>
          <a href="#how" className="hover:text-ink transition-colors">
            How it works
          </a>
          <a href="#features" className="hover:text-ink transition-colors">
            Features
          </a>
          <a href={DASHBOARD_URL} className="hover:text-ink transition-colors">
            Live console
          </a>
          <Link href="/login" className="hover:text-ink transition-colors">
            Sign in
          </Link>
        </nav>
        <span className="text-ink-muted text-[12.5px]">&copy; 2026 Secura</span>
      </div>
    </footer>
  );
}
