interface StageCard {
  num: string;
  timing: string;
  title: string;
  description: string;
  artifactLabel: string;
  lines: {
    key: string;
    value: string;
    tone?: "default" | "base" | "danger" | "warn" | "safe";
  }[];
}

const PIPELINE_STAGES: StageCard[] = [
  {
    num: "01",
    timing: "0 to 5 ms",
    title: "Collect",
    description:
      "A lightweight agent streams auth, web, and firewall logs. cyberLedger remembers each IP's behavior, so slow multi-step attacks never slip through.",
    artifactLabel: "Collection telemetry example",
    lines: [
      { key: "sources", value: "sshd, nginx, nftables" },
      { key: "ip memory", value: "sliding 24h window", tone: "base" },
      { key: "agent footprint", value: "18 MB RSS" },
    ],
  },
  {
    num: "02",
    timing: "5 to 50 ms",
    title: "Understand",
    description:
      "Local machine learning scores every event instantly. Real threats get a clear, MITRE-mapped explanation written by AI.",
    artifactLabel: "Scoring and AI triage example",
    lines: [
      { key: "local score", value: "0.94 critical", tone: "danger" },
      { key: "techniques", value: "T1046, T1110, T1190", tone: "warn" },
      { key: "briefing", value: "plain-language summary" },
    ],
  },
  {
    num: "03",
    timing: "Under 1 s",
    title: "Respond",
    description:
      "Critical attackers are blocked automatically or with one click. Trusted IPs are always protected, and every action is logged.",
    artifactLabel: "Automated containment example",
    lines: [
      { key: "allowlist check", value: "passed", tone: "safe" },
      { key: "action", value: "nft drop 185.220.101.42", tone: "safe" },
      { key: "auto-expiry", value: "4h signed audit entry" },
    ],
  },
];

const VALUE_TONE_CLASS = {
  default: "text-ink-soft",
  base: "text-baseline",
  danger: "text-danger",
  warn: "text-warn",
  safe: "text-safe",
};

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-heading" className="border-line border-t py-20 sm:py-24">
      <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-7">
        <div className="mb-10 max-w-[600px]">
          <h2
            id="how-heading"
            className="text-ink text-[clamp(1.65rem,3vw,2.2rem)] leading-[1.15] font-semibold tracking-[-0.03em]"
          >
            From noisy logs to contained threats in seconds.
          </h2>
          <p className="text-ink-secondary mt-3 text-[15px] leading-[1.6]">
            Three steps. No security team required.
          </p>
        </div>

        <div className="border-line bg-panel grid grid-cols-1 overflow-hidden rounded-lg border lg:grid-cols-3">
          {PIPELINE_STAGES.map((stage, idx) => (
            <article
              key={stage.num}
              className={`flex flex-col justify-between p-6 ${
                idx > 0 ? "border-line border-t lg:border-t-0 lg:border-l" : ""
              }`}
            >
              <div>
                <div className="flex items-center justify-between font-mono text-[12px]">
                  <span className="text-accent font-semibold">{stage.num}</span>
                  <span className="text-ink-muted">{stage.timing}</span>
                </div>
                <h3 className="text-ink mt-4 text-[18px] font-semibold tracking-[-0.02em]">
                  {stage.title}
                </h3>
                <p className="text-ink-secondary mt-2 text-[14px] leading-[1.6]">
                  {stage.description}
                </p>
              </div>

              <div
                aria-label={stage.artifactLabel}
                className="border-line bg-well mt-6 flex flex-col gap-2 rounded-md border p-3.5 font-mono text-[11.5px]"
              >
                {stage.lines.map((line) => (
                  <div key={line.key} className="flex items-center justify-between gap-3">
                    <span className="text-ink-muted">{line.key}</span>
                    <span className={`text-right ${VALUE_TONE_CLASS[line.tone ?? "default"]}`}>
                      {line.value}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
