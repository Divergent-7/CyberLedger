import { CyberLedgerMark } from "@cyberledger/ui";
import Link from "next/link";

interface CyberLedgerLogoProps {
  size?: number;
  href?: string;
}

export function CyberLedgerLogo({ size = 22, href = "/" }: CyberLedgerLogoProps) {
  return (
    <Link href={href} aria-label="cyberLedger home" className="inline-flex rounded">
      <CyberLedgerMark size={size} />
    </Link>
  );
}
