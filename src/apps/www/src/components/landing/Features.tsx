import { DASHBOARD_URL } from "@/lib/config";

const BURST_BARS: { height: number; tone: "base" | "spike" | "peak" }[] = [
  { height: 22, tone: "base" },
  { height: 26, tone: "base" },
  { height: 20, tone: "base" },
  { height: 30, tone: "base" },
  { height: 58, tone: "spike" },
  { height: 76, tone: "spike" },
  { height: 100, tone: "peak" },
  { height: 92, tone: "peak" },
  { height: 86, tone: "peak" },
  { height: 74, tone: "spike" },
  { height: 62, tone: "spike" },
  { height: 44, tone: "base" },
  { height: 36, tone: "base" },
  { height: 30, tone: "base" },
  { height: 28, tone: "base" },
  { height: 24, tone: "base" },
  { height: 22, tone: "base" },
  { height: 20, tone: "base" },
  { height: 24, tone: "base" },
  { height: 20, tone: "base" },
];

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="border-t border-line py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-7">
        <div className="mb-10 max-w-[620px]">
          <h2
            id="features-heading"
            className="text-[clamp(1.65rem,3vw,2.2rem)] leading-[1.15] font-semibold tracking-[-0.03em] text-ink"
          >
            Enterprise-grade defense, without the noise.
          </h2>
          <p className="mt-3 text-[15px] leading-[1.6] text-ink-secondary">
            Built for real attacks on production Linux hosts, from high-volume
            scanner bursts to slow credential stuffing.
          </p>
        </div>

        <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-line bg-panel md:grid-cols-2">
          <article className="flex flex-col justify-between gap-6 border-b border-line p-6 md:border-r">
            <div>
              <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
                Burst-proof by design
              </h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-ink-secondary">
                When scanners flood your servers, Secura queues everything
                instantly and processes it at a steady pace — nothing dropped,
                nothing slowed down.
              </p>
            </div>

            <div
              aria-label="Queue backpressure telemetry"
              className="rounded-md border border-line bg-well p-4"
            >
              <div className="flex items-center justify-between gap-2 font-mono text-[11.5px]">
                <span className="text-ink-muted">
                  Ingress buffer during SYN flood
                </span>
                <strong className="font-medium text-ink">
                  14,200 evt/s peak
                </strong>
              </div>
              <div
                aria-hidden="true"
                className="mt-4 flex h-16 items-end gap-1"
              >
                {BURST_BARS.map((bar, idx) => (
                  <div
                    key={idx}
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
              <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 font-mono text-[11.5px]">
                <span className="text-ink-muted">Queue depth 1.8 MB</span>
                <span className="text-safe">0 events dropped</span>
              </div>
            </div>
          </article>

          <article className="flex flex-col justify-between gap-6 border-b border-line p-6">
            <div>
              <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
                One incident, not a thousand alerts
              </h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-ink-secondary">
                Ongoing attacks from the same source update a single incident,
                so your dashboard stays readable and your AI bill stays small.
              </p>
            </div>

            <div
              aria-label="Incident deduplication comparison"
              className="rounded-md border border-line bg-well p-4"
            >
              <div className="flex flex-col gap-2 font-mono text-[12px]">
                <div className="flex items-center justify-between rounded border border-line bg-panel px-3 py-2">
                  <span className="text-ink-muted">
                    Raw auth &amp; web events
                  </span>
                  <b className="font-medium text-ink-soft">414 lines</b>
                </div>
                <div className="flex items-center justify-between rounded border border-line bg-panel px-3 py-2">
                  <span className="text-ink-muted">Merged source identity</span>
                  <b className="font-medium text-ink-soft">185.220.101.42</b>
                </div>
                <div className="flex items-center justify-between rounded border border-accent/35 bg-accent/10 px-3 py-2">
                  <span className="text-ink-soft">
                    Active incidents created
                  </span>
                  <b className="font-semibold text-accent">1 briefing</b>
                </div>
              </div>
            </div>
          </article>

          <article className="flex flex-col justify-between gap-6 border-b border-line p-6 md:border-r md:border-b-0">
            <div>
              <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
                Safe automatic blocking
              </h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-ink-secondary">
                Admin IPs and trusted networks are checked before any rule is
                applied. Every block is signed, audited, and automatically
                lifted later.
              </p>
            </div>

            <div
              aria-label="Safe blocking verification checks"
              className="rounded-md border border-line bg-well p-4"
            >
              <ul className="flex flex-col gap-2.5 font-mono text-[12px]">
                <li className="flex items-center justify-between gap-2">
                  <span className="text-ink-secondary">
                    Trusted CIDR 10.0.4.0/24
                  </span>
                  <span className="rounded border border-safe/30 bg-safe/12 px-2 py-0.5 text-[11px] text-safe">
                    Protected
                  </span>
                </li>
                <li className="flex items-center justify-between gap-2 border-t border-line pt-2.5">
                  <span className="text-ink-secondary">
                    Rule signature Ed25519
                  </span>
                  <span className="rounded border border-safe/30 bg-safe/12 px-2 py-0.5 text-[11px] text-safe">
                    Verified
                  </span>
                </li>
                <li className="flex items-center justify-between gap-2 border-t border-line pt-2.5">
                  <span className="text-ink-secondary">
                    Automatic release TTL
                  </span>
                  <span className="rounded border border-line bg-panel px-2 py-0.5 text-[11px] text-ink-soft">
                    4 hours
                  </span>
                </li>
              </ul>
            </div>
          </article>

          <article className="flex flex-col justify-between gap-6 p-6">
            <div>
              <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
                Live dashboard
              </h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-ink-secondary">
                Watch risk climb in real time, read clear AI briefings, and
                contain threats with a single click.
              </p>
            </div>

            <div>
              <div
                aria-label="Monitored fleet snapshot"
                className="rounded-md border border-line bg-well p-3.5"
              >
                <div className="flex flex-col gap-2.5 text-[12px]">
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-safe"
                        aria-hidden="true"
                      />
                      <span className="font-mono text-ink">web-prod-02</span>
                      <span className="truncate text-ink-muted">
                        185.220.101.42 contained via auto-block
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-safe">
                      Protected
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2.5 border-t border-line pt-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-warn"
                        aria-hidden="true"
                      />
                      <span className="font-mono text-ink">api-edge-01</span>
                      <span className="truncate text-ink-muted">
                        Credential stuffing pattern under review
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-warn">
                      Risk 71
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2.5 border-t border-line pt-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-safe"
                        aria-hidden="true"
                      />
                      <span className="font-mono text-ink">db-replica-03</span>
                      <span className="truncate text-ink-muted">
                        All auth and firewall baselines nominal
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-ink-secondary">
                      Healthy
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12px] text-ink-muted">
                  Same interface, live interactive telemetry
                </span>
                <a
                  href={DASHBOARD_URL}
                  className="inline-flex h-7 items-center rounded-md border border-line bg-surface px-2.5 text-[12px] font-medium text-ink transition-colors hover:border-line-hover hover:bg-surface-hover"
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
