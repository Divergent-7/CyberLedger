import { DASHBOARD_URL } from "@/lib/config";

const BURST_BARS: { id: string; height: number; tone: "base" | "spike" | "peak" }[] = [
  { id: "t01", height: 22, tone: "base" },
  { id: "t02", height: 26, tone: "base" },
  { id: "t03", height: 20, tone: "base" },
  { id: "t04", height: 30, tone: "base" },
  { id: "t05", height: 58, tone: "spike" },
  { id: "t06", height: 76, tone: "spike" },
  { id: "t07", height: 100, tone: "peak" },
  { id: "t08", height: 92, tone: "peak" },
  { id: "t09", height: 86, tone: "peak" },
  { id: "t10", height: 74, tone: "spike" },
  { id: "t11", height: 62, tone: "spike" },
  { id: "t12", height: 44, tone: "base" },
  { id: "t13", height: 36, tone: "base" },
  { id: "t14", height: 30, tone: "base" },
  { id: "t15", height: 28, tone: "base" },
  { id: "t16", height: 24, tone: "base" },
  { id: "t17", height: 22, tone: "base" },
  { id: "t18", height: 20, tone: "base" },
  { id: "t19", height: 24, tone: "base" },
  { id: "t20", height: 20, tone: "base" },
];

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="border-line border-t py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-7">
        <div className="mb-10 max-w-[620px]">
          <h2
            id="features-heading"
            className="text-ink text-[clamp(1.65rem,3vw,2.2rem)] leading-[1.15] font-semibold tracking-[-0.03em]"
          >
            Enterprise-grade defense, without the noise.
          </h2>
          <p className="text-ink-secondary mt-3 text-[15px] leading-[1.6]">
            Built for real attacks on production Linux hosts, from high-volume scanner bursts to
            slow credential stuffing.
          </p>
        </div>

        <div className="border-line bg-panel grid grid-cols-1 overflow-hidden rounded-lg border md:grid-cols-2">
          <article className="border-line flex flex-col justify-between gap-6 border-b p-6 md:border-r">
            <div>
              <h3 className="text-ink text-[17px] font-semibold tracking-[-0.02em]">
                Burst-proof by design
              </h3>
              <p className="text-ink-secondary mt-2 text-[14px] leading-[1.6]">
                When scanners flood your servers, cyberLedger queues everything instantly and processes
                it at a steady pace — nothing dropped, nothing slowed down.
              </p>
            </div>

            <div
              aria-label="Queue backpressure telemetry"
              className="border-line bg-well rounded-md border p-4"
            >
              <div className="flex items-center justify-between gap-2 font-mono text-[11.5px]">
                <span className="text-ink-muted">Ingress buffer during SYN flood</span>
                <strong className="text-ink font-medium">14,200 evt/s peak</strong>
              </div>
              <div aria-hidden="true" className="mt-4 flex h-16 items-end gap-1">
                {BURST_BARS.map((bar) => (
                  <div
                    key={bar.id}
                    style={{ height: `${bar.height}%` }}
                    className={`flex-1 rounded-[2px] ${
                      bar.tone === "peak"
                        ? "bg-accent"
                        : bar.tone === "spike"
                          ? "bg-warn/75"
                          : "bg-line-strong"
                    }`}
                  />
                ))}
              </div>
              <div className="border-line mt-3 flex items-center justify-between border-t pt-2.5 font-mono text-[11.5px]">
                <span className="text-ink-muted">Queue depth 1.8 MB</span>
                <span className="text-safe">0 events dropped</span>
              </div>
            </div>
          </article>

          <article className="border-line flex flex-col justify-between gap-6 border-b p-6">
            <div>
              <h3 className="text-ink text-[17px] font-semibold tracking-[-0.02em]">
                One incident, not a thousand alerts
              </h3>
              <p className="text-ink-secondary mt-2 text-[14px] leading-[1.6]">
                Ongoing attacks from the same source update a single incident, so your dashboard
                stays readable and your AI bill stays small.
              </p>
            </div>

            <div
              aria-label="Incident deduplication comparison"
              className="border-line bg-well rounded-md border p-4"
            >
              <div className="flex flex-col gap-2 font-mono text-[12px]">
                <div className="border-line bg-panel flex items-center justify-between rounded border px-3 py-2">
                  <span className="text-ink-muted">Raw auth &amp; web events</span>
                  <b className="text-ink-soft font-medium">414 lines</b>
                </div>
                <div className="border-line bg-panel flex items-center justify-between rounded border px-3 py-2">
                  <span className="text-ink-muted">Merged source identity</span>
                  <b className="text-ink-soft font-medium">185.220.101.42</b>
                </div>
                <div className="border-accent/35 bg-accent/10 flex items-center justify-between rounded border px-3 py-2">
                  <span className="text-ink-soft">Active incidents created</span>
                  <b className="text-accent font-semibold">1 briefing</b>
                </div>
              </div>
            </div>
          </article>

          <article className="border-line flex flex-col justify-between gap-6 border-b p-6 md:border-r md:border-b-0">
            <div>
              <h3 className="text-ink text-[17px] font-semibold tracking-[-0.02em]">
                Safe automatic blocking
              </h3>
              <p className="text-ink-secondary mt-2 text-[14px] leading-[1.6]">
                Admin IPs and trusted networks are checked before any rule is applied. Every block
                is signed, audited, and automatically lifted later.
              </p>
            </div>

            <div
              aria-label="Safe blocking verification checks"
              className="border-line bg-well rounded-md border p-4"
            >
              <ul className="flex flex-col gap-2.5 font-mono text-[12px]">
                <li className="flex items-center justify-between gap-2">
                  <span className="text-ink-secondary">Trusted CIDR 10.0.4.0/24</span>
                  <span className="border-safe/30 bg-safe/12 text-safe rounded border px-2 py-0.5 text-[11px]">
                    Protected
                  </span>
                </li>
                <li className="border-line flex items-center justify-between gap-2 border-t pt-2.5">
                  <span className="text-ink-secondary">Rule signature Ed25519</span>
                  <span className="border-safe/30 bg-safe/12 text-safe rounded border px-2 py-0.5 text-[11px]">
                    Verified
                  </span>
                </li>
                <li className="border-line flex items-center justify-between gap-2 border-t pt-2.5">
                  <span className="text-ink-secondary">Automatic release TTL</span>
                  <span className="border-line bg-panel text-ink-soft rounded border px-2 py-0.5 text-[11px]">
                    4 hours
                  </span>
                </li>
              </ul>
            </div>
          </article>

          <article className="flex flex-col justify-between gap-6 p-6">
            <div>
              <h3 className="text-ink text-[17px] font-semibold tracking-[-0.02em]">
                Live dashboard
              </h3>
              <p className="text-ink-secondary mt-2 text-[14px] leading-[1.6]">
                Watch risk climb in real time, read clear AI briefings, and contain threats with a
                single click.
              </p>
            </div>

            <div>
              <div
                aria-label="Monitored fleet snapshot"
                className="border-line bg-well rounded-md border p-3.5"
              >
                <div className="flex flex-col gap-2.5 text-[12px]">
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="bg-safe h-2 w-2 shrink-0 rounded-full" aria-hidden="true" />
                      <span className="text-ink font-mono">web-prod-02</span>
                      <span className="text-ink-muted truncate">
                        185.220.101.42 contained via auto-block
                      </span>
                    </div>
                    <span className="text-safe shrink-0 font-mono text-[11px]">Protected</span>
                  </div>
                  <div className="border-line flex items-center justify-between gap-2.5 border-t pt-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="bg-warn h-2 w-2 shrink-0 rounded-full" aria-hidden="true" />
                      <span className="text-ink font-mono">api-edge-01</span>
                      <span className="text-ink-muted truncate">
                        Credential stuffing pattern under review
                      </span>
                    </div>
                    <span className="text-warn shrink-0 font-mono text-[11px]">Risk 71</span>
                  </div>
                  <div className="border-line flex items-center justify-between gap-2.5 border-t pt-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="bg-safe h-2 w-2 shrink-0 rounded-full" aria-hidden="true" />
                      <span className="text-ink font-mono">db-replica-03</span>
                      <span className="text-ink-muted truncate">
                        All auth and firewall baselines nominal
                      </span>
                    </div>
                    <span className="text-ink-secondary shrink-0 font-mono text-[11px]">
                      Healthy
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-ink-muted text-[12px]">
                  Same interface, live interactive telemetry
                </span>
                <a
                  href={DASHBOARD_URL}
                  className="border-line bg-surface text-ink hover:border-line-hover hover:bg-surface-hover inline-flex h-7 items-center rounded-md border px-2.5 text-[12px] font-medium transition-colors"
                >
                  Open live dashboard
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
