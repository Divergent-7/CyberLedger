export interface SecuraMarkProps {
  size?: number;
  showWordmark?: boolean;
}

export function SecuraMark({
  size = 22,
  showWordmark = true,
}: SecuraMarkProps) {
  return (
    <span className="inline-flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.02em] text-ink">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 2.2 4 5.4v6.1c0 5.1 3.4 9.3 8 10.5 4.6-1.2 8-5.4 8-10.5V5.4L12 2.2Z"
          fill="#EDECEC"
        />
        <path
          d="m8.8 12.1 2.2 2.2 4.3-4.6"
          stroke="#14120B"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="17.8" cy="6.2" r="2.1" fill="#F54E00" />
      </svg>
      {showWordmark && <span>Secura</span>}
    </span>
  );
}
