import Link from "next/link";
import { SecuraLogo } from "@/components/brand/SecuraLogo";
import { DASHBOARD_URL } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t border-line py-8">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col items-start justify-between gap-4 px-5 sm:flex-row sm:items-center sm:px-7">
        <SecuraLogo size={20} href="/" />
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-5 text-[13px] text-ink-secondary"
        >
          <a href="#product" className="transition-colors hover:text-ink">
            Product
          </a>
          <a href="#how" className="transition-colors hover:text-ink">
            How it works
          </a>
          <a href="#features" className="transition-colors hover:text-ink">
            Features
          </a>
          <a href={DASHBOARD_URL} className="transition-colors hover:text-ink">
            Live console
          </a>
          <Link href="/login" className="transition-colors hover:text-ink">
            Sign in
          </Link>
        </nav>
        <span className="text-[12.5px] text-ink-muted">&copy; 2026 Secura</span>
      </div>
    </footer>
  );
}
