export interface CyberLedgerMarkProps {
  size?: number;
  showWordmark?: boolean;
}

export function CyberLedgerMark({ size = 22, showWordmark = true }: CyberLedgerMarkProps) {
  return (
    <span className="text-ink inline-flex items-center gap-2.5 text-[15px] tracking-[-0.028em]">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M5 5.5C5 5.22 5.22 5 5.5 5H9.2C9.48 5 9.7 5.22 9.7 5.5V22.3H26.5C26.78 22.3 27 22.52 27 22.8V25.5C27 26.33 26.33 27 25.5 27H7C5.9 27 5 26.1 5 25V5.5Z"
          fill="#EDECEC"
        />
        <rect x="13.2" y="5" width="13.8" height="4.6" rx="1.4" fill="#F54E00" />
        <rect x="13.2" y="13.6" width="9.8" height="4.6" rx="1.4" fill="#EDECEC" />
      </svg>
      {showWordmark && (
        <span>
          <span className="text-ink-soft font-normal">cyber</span>
          <span className="text-ink font-semibold">Ledger</span>
        </span>
      )}
    </span>
  );
}
