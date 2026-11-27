const METRICS = [
  {
    value: "<5",
    unit: "ms",
    label: "Log ingestion",
    note: "Buffered agent streaming with zero impact on host workloads.",
  },
  {
    value: "<50",
    unit: "ms",
    label: "AI risk scoring",
    note: "Local inference scores every line before escalation occurs.",
  },
  {
    value: "~92",
    unit: "%",
    label: "Fewer LLM calls",
    note: "Deduplication and local triage keep inference costs predictable.",
  },
  {
    value: "2",
    unit: "min",
    label: "To deploy",
    note: "Single shell install on Ubuntu or Debian with automatic discovery.",
  },
];

export function Benchmarks() {
  return (
    <section aria-label="Performance benchmarks" className="border-line border-t py-14 sm:py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-7">
        <div className="border-line bg-panel grid grid-cols-1 overflow-hidden rounded-lg border sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((metric, idx) => (
            <div
              key={metric.label}
              className={`p-6 ${idx > 0 ? "border-line border-t sm:border-t-0" : ""} ${
                idx % 2 === 1 ? "sm:border-line sm:border-l" : ""
              } ${idx >= 2 ? "sm:border-line sm:border-t lg:border-t-0" : ""} ${
                idx > 0 ? "lg:border-line lg:border-l" : ""
              }`}
            >
              <div className="text-ink text-[32px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
                {metric.value}
                <span className="text-ink-muted ml-0.5 font-mono text-[16px] font-medium">
                  {metric.unit}
                </span>
              </div>
              <div className="text-ink-soft mt-2.5 text-[14px] font-medium">{metric.label}</div>
              <p className="text-ink-muted mt-1.5 text-[13px] leading-[1.55]">{metric.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
