import { SecuraMark } from "@secura/ui";
import Link from "next/link";

interface SecuraLogoProps {
  size?: number;
  href?: string;
}

export function SecuraLogo({ size = 22, href = "/" }: SecuraLogoProps) {
  return (
    <Link href={href} aria-label="Secura home" className="inline-flex rounded">
      <SecuraMark size={size} />
    </Link>
  );
}
