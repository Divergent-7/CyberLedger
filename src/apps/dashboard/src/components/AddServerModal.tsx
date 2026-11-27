import { useEffect, useRef, useState } from "react";
import { INSTALL_CMD } from "@/data/telemetry";

interface AddServerModalProps {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}

export function AddServerModal({ open, onClose, onDone }: AddServerModalProps) {
  const copyBtnRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      copyBtnRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
    } catch {
      // Ignore clipboard permission errors in restricted contexts.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-[2px]"
    >
      <div className="border-line-strong bg-panel w-full max-w-[520px] rounded-lg border p-6 shadow-2xl">
        <h2 id="modalTitle" className="text-ink text-[16px] font-semibold tracking-[-0.02em]">
          Connect a Linux server
        </h2>
        <p className="text-ink-secondary mt-1.5 text-[13px] leading-[1.55]">
          Run this command on any Ubuntu or Debian host to stream auth, Nginx, and firewall logs
          into cyberLedger over TLS.
        </p>

        <div className="border-line bg-well mt-4 flex items-center justify-between gap-3 rounded-md border px-3 py-2.5">
          <code className="text-ink-soft overflow-x-auto font-mono text-[12px] whitespace-nowrap">
            <span className="text-accent mr-1.5 select-none">$</span>
            {INSTALL_CMD}
          </code>
          <button
            ref={copyBtnRef}
            type="button"
            onClick={handleCopy}
            className="border-line bg-surface text-ink hover:border-line-hover hover:bg-surface-hover shrink-0 cursor-pointer rounded border px-2.5 py-1 text-[12px] font-medium transition-colors"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="border-line bg-surface text-ink hover:border-line-hover hover:bg-surface-hover h-8 cursor-pointer rounded-md border px-3 text-[12.5px] font-medium transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onDone}
            className="bg-ink text-canvas h-8 cursor-pointer rounded-md px-3.5 text-[12.5px] font-medium transition-opacity hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
