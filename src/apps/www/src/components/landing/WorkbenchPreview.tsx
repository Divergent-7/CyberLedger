"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { DASHBOARD_URL } from "@/lib/config";

interface StageInfo {
  risk: number;
  riskTone: "warn" | "crit";
  status: string;
  statusTone: "active" | "blocked";
  dotTone: "safe" | "warn" | "danger";
  mitre: string[];
  prose: string;
  rule: string;
  blocked: boolean;
}

interface ScriptEvent {
  cls: "ok" | "warn" | "bad" | "block";
  ip: string;
  msg: string;
  tag: string;
  stage: number;
  ms: string;
}

interface StreamRow extends ScriptEvent {
  id: number;
  ts: string;
}

const STAGES: StageInfo[] = [
  {
    risk: 42,
    riskTone: "warn",
    status: "Tracking",
    statusTone: "active",
    dotTone: "warn",
    mitre: ["T1046"],
    prose:
      "External IP 185.220.101.42 swept 1,024 TCP ports on web-prod-02 in 1.4 seconds. Local scoring raised risk to 42 and opened behavioral memory for this source.",
    rule: "Allowlist verified; monitoring for follow-on attempts",
    blocked: false,
  },
  {
    risk: 74,
    riskTone: "warn",
    status: "Escalating",
    statusTone: "active",
    dotTone: "warn",
    mitre: ["T1046", "T1110"],
    prose:
      "The same source pivoted directly to sshd with 412 failed password attempts for root. All 412 lines merged into INC-4092 without triggering alert spam.",
    rule: "Auto-block threshold armed at risk >= 85",
    blocked: false,
  },
  {
    risk: 94,
    riskTone: "crit",
    status: "Critical",
    statusTone: "active",
    dotTone: "danger",
    mitre: ["T1046", "T1110", "T1190"],
    prose:
      "After SSH failures, 185.220.101.42 sent a UNION SELECT SQL injection payload to POST /login. Local risk reached 94; AI briefing confirmed active multi-stage intrusion.",
    rule: "Dispatching signed nftables drop rule to web-prod-02",
    blocked: false,
  },
  {
    risk: 94,
    riskTone: "crit",
    status: "Blocked",
    statusTone: "blocked",
    dotTone: "safe",
    mitre: ["T1046", "T1110", "T1190"],
    prose:
      "Verified 185.220.101.42 is outside trusted subnets and applied a signed firewall drop rule in 38 ms. Subsequent traffic is dropped cleanly and expires automatically in 4 hours.",
    rule: "nft add element inet secura blocked { 185.220.101.42 timeout 4h }",
    blocked: true,
  },
];

const TRACE_ITEMS = [
  {
    num: "01",
    label: "SYN port sweep across 1,024 ports",
    score: "Risk 42",
    tone: "warn" as const,
  },
  {
    num: "02",
    label: "SSH brute force (412 failed root logins)",
    score: "Risk 74",
    tone: "warn" as const,
  },
  {
    num: "03",
    label: "SQL injection payload on POST /login",
    score: "Risk 94",
    tone: "bad" as const,
  },
  {
    num: "04",
    label: "Signed firewall drop applied automatically",
    score: "Blocked",
    tone: "safe" as const,
  },
];

const MITRE_CHIPS = [
  { id: "T1046", label: "T1046 Network Service Discovery" },
  { id: "T1110", label: "T1110 Brute Force" },
  { id: "T1190", label: "T1190 Exploit Public-Facing App" },
];

const EVENT_SCRIPT: ScriptEvent[] = [
  {
    cls: "ok",
    ip: "10.0.4.12",
    msg: "GET /health 200",
    tag: "ok",
    stage: -1,
    ms: "3.4 ms",
  },
  {
    cls: "ok",
    ip: "10.0.4.18",
    msg: "sshd: accepted key for deploy",
    tag: "ok",
    stage: -1,
    ms: "3.8 ms",
  },
  {
    cls: "ok",
    ip: "172.16.0.9",
    msg: "GET /api/products 200",
    tag: "ok",
    stage: -1,
    ms: "3.1 ms",
  },
  {
    cls: "warn",
    ip: "185.220.101.42",
    msg: "SYN scan across 1,024 ports",
    tag: "scan",
    stage: 0,
    ms: "4.6 ms",
  },
  {
    cls: "ok",
    ip: "10.0.4.12",
    msg: "GET /health 200",
    tag: "ok",
    stage: 0,
    ms: "3.2 ms",
  },
  {
    cls: "warn",
    ip: "185.220.101.42",
    msg: "sshd: failed password for root",
    tag: "brute",
    stage: 1,
    ms: "4.4 ms",
  },
  {
    cls: "ok",
    ip: "172.16.0.21",
    msg: "POST /api/cart 201",
    tag: "ok",
    stage: 1,
    ms: "3.5 ms",
  },
  {
    cls: "warn",
    ip: "185.220.101.42",
    msg: "sshd: 412 failed logins merged",
    tag: "brute",
    stage: 1,
    ms: "4.9 ms",
  },
  {
    cls: "ok",
    ip: "10.0.4.18",
    msg: "cron: nightly backup completed",
    tag: "ok",
    stage: 1,
    ms: "3.0 ms",
  },
  {
    cls: "bad",
    ip: "185.220.101.42",
    msg: "POST /login ' UNION SELECT --",
    tag: "risk 94",
    stage: 2,
    ms: "4.8 ms",
  },
  {
    cls: "block",
    ip: "185.220.101.42",
    msg: "firewall rule applied (4h TTL)",
    tag: "blocked",
    stage: 3,
    ms: "3.9 ms",
  },
  {
    cls: "ok",
    ip: "172.16.0.9",
    msg: "GET /api/products 200",
    tag: "ok",
    stage: 3,
    ms: "3.2 ms",
  },
  {
    cls: "ok",
    ip: "10.0.4.12",
    msg: "GET /health 200",
    tag: "ok",
    stage: 3,
    ms: "3.1 ms",
  },
];

function formatNow() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function WorkbenchPreview() {
  const [rows, setRows] = useState<StreamRow[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [ingestionRate, setIngestionRate] = useState("4.1 ms avg ingest");
  const [highestStage, setHighestStage] = useState(-1);
  const [selectedStage, setSelectedStage] = useState(-1);
  const [manualBlockOverride, setManualBlockOverride] = useState<boolean | null>(null);
  const [paused, setPaused] = useState(false);

  const eventIdxRef = useRef(0);
  const rowIdRef = useRef(0);
  const highestStageRef = useRef(-1);
  const manualInspectRef = useRef(false);

  const stepStream = useCallback(() => {
    const idx = eventIdxRef.current;
    const item = EVENT_SCRIPT[idx % EVENT_SCRIPT.length];
    eventIdxRef.current = idx + 1;
    rowIdRef.current += 1;

    if (eventIdxRef.current % EVENT_SCRIPT.length === 1 && eventIdxRef.current > 1) {
      highestStageRef.current = -1;
      setHighestStage(-1);
      setManualBlockOverride(null);
    }

    const nextRow: StreamRow = {
      ...item,
      id: rowIdRef.current,
      ts: formatNow(),
    };
    setRows((prev) => [...prev.slice(-10), nextRow]);
    setTotalEvents((prev) => prev + 1);
    setIngestionRate(`${item.ms} ingest`);

    if (item.stage > highestStageRef.current) {
      highestStageRef.current = item.stage;
      setHighestStage(item.stage);
    }

    if (!manualInspectRef.current) {
      setSelectedStage(highestStageRef.current);
    }
  }, []);

  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const initialCount = reducedMotion ? 11 : 6;
    for (let i = 0; i < initialCount; i += 1) {
      stepStream();
    }
    if (reducedMotion) {
      setPaused(true);
    }
  }, [stepStream]);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(stepStream, 1350);
    return () => window.clearInterval(id);
  }, [paused, stepStream]);

  const handleReplay = () => {
    eventIdxRef.current = 0;
    highestStageRef.current = -1;
    manualInspectRef.current = false;
    setRows([]);
    setTotalEvents(0);
    setHighestStage(-1);
    setSelectedStage(-1);
    setManualBlockOverride(null);
    for (let i = 0; i < 4; i += 1) {
      stepStream();
    }
    setPaused(false);
  };

  const handleSelectStage = (stage: number) => {
    manualInspectRef.current = true;
    setManualBlockOverride(null);
    setSelectedStage(stage);
    if (stage > highestStageRef.current) {
      highestStageRef.current = stage;
      setHighestStage(stage);
    }
  };

  const effectiveIdx = selectedStage < 0 ? 0 : selectedStage;
  const stageData = STAGES[effectiveIdx];
  const isBlocked = manualBlockOverride !== null ? manualBlockOverride : stageData.blocked;

  const handleToggleBlock = () => {
    const nextBlocked = !isBlocked;
    manualInspectRef.current = true;
    setManualBlockOverride(nextBlocked);
    if (selectedStage < 0) {
      setSelectedStage(2);
    }
    rowIdRef.current += 1;
    const manualEvent: StreamRow = nextBlocked
      ? {
          id: rowIdRef.current,
          ts: formatNow(),
          cls: "block",
          ip: "185.220.101.42",
          msg: "manual firewall drop applied",
          tag: "blocked",
          stage: 3,
          ms: "3.6 ms",
        }
      : {
          id: rowIdRef.current,
          ts: formatNow(),
          cls: "warn",
          ip: "185.220.101.42",
          msg: "firewall rule lifted manually",
          tag: "lifted",
          stage: 2,
          ms: "3.4 ms",
        };
    setRows((prev) => [...prev.slice(-10), manualEvent]);
    setTotalEvents((prev) => prev + 1);
  };

  const isObserving = selectedStage < 0 && manualBlockOverride === null;

  const riskLabel = selectedStage < 0 ? "Risk 14" : `Risk ${stageData.risk}`;
  const riskChipClass =
    selectedStage < 0
      ? "border-line bg-surface text-ink-secondary"
      : stageData.riskTone === "crit"
        ? "border-danger/30 bg-danger/12 text-danger"
        : "border-warn/30 bg-warn/12 text-warn";

  let statusLabel = "Observing";
  let statusChipClass = "border-line bg-surface text-ink-secondary";
  let hostDotClass = "bg-safe";
  let prose =
    "Baseline traffic from internal subnets is passing local scoring with zero alerts. Secura tracks behavioral memory per source IP across services.";
  let ruleText = "No firewall rule applied yet";

  if (!isObserving) {
    if (isBlocked) {
      statusLabel = "Blocked";
      statusChipClass = "border-safe/30 bg-safe/12 text-safe";
      hostDotClass = "bg-safe";
      prose =
        manualBlockOverride === true
          ? "Manual block applied for 185.220.101.42. Verified outside trusted subnets; signed nftables drop rule is active on web-prod-02 and logged to the audit trail."
          : stageData.prose;
      ruleText = "nft add element inet secura blocked { 185.220.101.42 timeout 4h }";
    } else {
      statusLabel = manualBlockOverride === false ? "Rule lifted" : stageData.status;
      statusChipClass = "border-accent/35 bg-accent/12 text-accent";
      hostDotClass =
        stageData.dotTone === "danger"
          ? "bg-danger"
          : stageData.dotTone === "warn"
            ? "bg-warn"
            : "bg-safe";
      prose =
        manualBlockOverride === false
          ? "Firewall block for 185.220.101.42 was lifted manually. Secura continues monitoring the source with active behavioral memory."
          : stageData.prose;
      ruleText =
        manualBlockOverride === false
          ? "nft delete element inet secura blocked { 185.220.101.42 }"
          : stageData.rule;
    }
  }

  const activeMitre = selectedStage < 0 ? [] : stageData.mitre;

  return (
    <section
      id="product"
      aria-labelledby="product-heading"
      className="border-line border-t py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-7">
        <div className="mb-10 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-[600px]">
            <h2
              id="product-heading"
              className="text-ink text-[clamp(1.65rem,3vw,2.2rem)] leading-[1.15] font-semibold tracking-[-0.03em]"
            >
              Thousands of logs. Only what matters.
            </h2>
            <p className="text-ink-secondary mt-3 text-[15px] leading-[1.6]">
              Secura reads every line your servers produce, ignores the noise, and acts the moment
              something turns dangerous. Watch a single attacker unfold on{" "}
              <span className="text-ink-soft font-mono text-[13.5px]">web-prod-02</span> below.
            </p>
          </div>
          <a
            href={DASHBOARD_URL}
            className="border-line bg-panel text-ink hover:border-line-hover hover:bg-surface inline-flex h-9 shrink-0 items-center rounded-md border px-3.5 text-[13px] font-medium transition-colors"
          >
            Inspect full console
          </a>
        </div>

        <div
          role="region"
          aria-label="Interactive threat containment workbench"
          className="border-line bg-panel overflow-hidden rounded-lg border"
        >
          <div className="border-line bg-surface/60 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
            <div className="text-ink-secondary flex flex-wrap items-center gap-2.5 text-[12.5px]">
              <span className={`h-2 w-2 rounded-full ${hostDotClass}`} aria-hidden="true" />
              <span className="text-ink font-mono text-[12.5px] font-medium">web-prod-02</span>
              <span className="bg-line-strong h-3.5 w-px" aria-hidden="true" />
              <span>
                {paused
                  ? "Stream paused for inspection"
                  : "Streaming auth, nginx, and firewall logs"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-pressed={paused}
                onClick={() => setPaused((p) => !p)}
                className="border-line bg-panel text-ink-soft hover:border-line-hover hover:bg-surface hover:text-ink inline-flex h-7 cursor-pointer items-center rounded-md border px-2.5 text-[12px] font-medium transition-colors"
              >
                {paused ? "Resume stream" : "Pause stream"}
              </button>
              <button
                type="button"
                onClick={handleReplay}
                className="border-line bg-panel text-ink-soft hover:border-line-hover hover:bg-surface hover:text-ink inline-flex h-7 cursor-pointer items-center rounded-md border px-2.5 text-[12px] font-medium transition-colors"
              >
                Replay sequence
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.12fr_1fr]">
            <div className="border-line flex flex-col border-b lg:border-r lg:border-b-0">
              <div className="border-line bg-well/60 flex items-center justify-between border-b px-4 py-2.5 text-[12px]">
                <strong className="text-ink-soft font-medium">Live host events</strong>
                <span className="text-ink-muted font-mono text-[11.5px] tabular-nums">
                  {ingestionRate}
                </span>
              </div>

              <div
                aria-live="off"
                className="bg-well flex min-h-[340px] flex-1 flex-col justify-end gap-1 p-3 font-mono text-[11.5px] tabular-nums"
              >
                {rows.map((row) => {
                  const rowBg =
                    row.cls === "bad"
                      ? "bg-danger/10 text-ink"
                      : row.cls === "block"
                        ? "bg-safe/10 text-ink"
                        : row.cls === "warn"
                          ? "bg-warn/8 text-ink-soft"
                          : "text-ink-muted";

                  const tagStyle =
                    row.cls === "bad"
                      ? "border-danger/30 bg-danger/12 text-danger"
                      : row.cls === "block"
                        ? "border-safe/30 bg-safe/12 text-safe"
                        : row.cls === "warn"
                          ? "border-warn/30 bg-warn/12 text-warn"
                          : "border-line bg-panel text-ink-muted";

                  return (
                    <div
                      key={row.id}
                      className={`grid grid-cols-[62px_112px_1fr_auto] items-center gap-2 rounded px-2 py-1 ${rowBg}`}
                    >
                      <span className="text-ink-muted">{row.ts}</span>
                      <span className="text-ink-secondary truncate">{row.ip}</span>
                      <span className="truncate">{row.msg}</span>
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[10.5px] leading-none ${tagStyle}`}
                      >
                        {row.tag}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-line bg-panel text-ink-muted flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5 text-[12px]">
                <span>Noise filtered locally before AI triage</span>
                <div className="flex items-center gap-4 font-mono text-[11.5px] tabular-nums">
                  <span>
                    Events <b className="text-ink-soft font-medium">{totalEvents}</b>
                  </span>
                  <span>
                    Incidents <b className="text-ink-soft font-medium">1</b>
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-panel flex flex-col">
              <div className="border-line flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div
                    aria-hidden="true"
                    className="border-line bg-surface text-ink-soft flex h-7 w-7 items-center justify-center rounded-md border"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                    </svg>
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-ink text-[13px] font-semibold">Incident INC-4092</span>
                    <span className="text-ink-muted font-mono text-[11.5px]">
                      Source 185.220.101.42
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums">
                  <span className={`rounded border px-2 py-0.5 font-medium ${riskChipClass}`}>
                    {riskLabel}
                  </span>
                  <span className={`rounded border px-2 py-0.5 font-medium ${statusChipClass}`}>
                    {statusLabel}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-4">
                <p className="text-ink-soft text-[13.5px] leading-[1.6]">{prose}</p>

                <div aria-label="Mapped MITRE ATT&CK techniques" className="flex flex-wrap gap-1.5">
                  {MITRE_CHIPS.map((chip) => {
                    const matched = activeMitre.includes(chip.id);
                    return (
                      <span
                        key={chip.id}
                        className={`rounded border px-2 py-0.5 font-mono text-[11px] transition-colors ${
                          matched
                            ? "border-accent/35 bg-accent/12 text-ink"
                            : "border-line bg-well text-ink-muted"
                        }`}
                      >
                        {chip.label}
                      </span>
                    );
                  })}
                </div>

                <div>
                  <div className="text-ink-muted mb-2 text-[11.5px] font-medium">
                    Correlated attack trace (select any stage to inspect)
                  </div>
                  <ol className="flex flex-col gap-1.5">
                    {TRACE_ITEMS.map((step, idx) => {
                      const reached = idx <= highestStage || (isBlocked && idx === 3);
                      const selected = idx === selectedStage;
                      const dotColor =
                        step.tone === "bad"
                          ? "bg-danger"
                          : step.tone === "safe"
                            ? "bg-safe"
                            : "bg-warn";

                      return (
                        <li key={step.num}>
                          <button
                            type="button"
                            onClick={() => handleSelectStage(idx)}
                            aria-current={selected ? "step" : undefined}
                            className={`flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-md border px-3 py-2 text-left text-[12.5px] transition-colors ${
                              selected
                                ? "border-line-strong bg-surface text-ink"
                                : reached
                                  ? "border-line bg-well/60 text-ink-soft hover:border-line-hover hover:bg-surface/60"
                                  : "bg-well/30 text-ink-muted hover:border-line hover:text-ink-soft border-transparent"
                            }`}
                          >
                            <span className="flex min-w-0 items-center gap-2.5">
                              <span
                                aria-hidden="true"
                                className={`h-2 w-2 shrink-0 rounded-full ${
                                  reached || selected ? dotColor : "bg-line-strong"
                                }`}
                              />
                              <span className="text-ink-muted font-mono text-[11px]">
                                {step.num}
                              </span>
                              <span className="truncate">{step.label}</span>
                            </span>
                            <span className="text-ink-secondary shrink-0 font-mono text-[11px] tabular-nums">
                              {step.score}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>

              <div className="border-line bg-well/50 flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3">
                <span className="text-ink-secondary truncate font-mono text-[11.5px]">
                  {ruleText}
                </span>
                <button
                  type="button"
                  onClick={handleToggleBlock}
                  className={`inline-flex h-7 shrink-0 cursor-pointer items-center rounded-md border px-2.5 text-[12px] font-medium transition-colors ${
                    isBlocked
                      ? "border-safe/30 bg-safe/12 text-safe hover:bg-safe/20"
                      : "border-line bg-panel text-ink hover:border-line-hover hover:bg-surface"
                  }`}
                >
                  {isBlocked ? "Lift block" : "Block 185.220.101.42"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            "Every event scored in milliseconds by local models before hitting an LLM.",
            "Suspicious IPs tracked across auth, web, and firewall logs over time.",
            "Attackers blocked automatically before lateral movement or data loss.",
          ].map((point) => (
            <div key={point} className="text-ink-secondary flex items-start gap-2.5 text-[13.5px]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="text-safe mt-0.5 shrink-0"
              >
                <path d="m5 12 5 5L20 7" />
              </svg>
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
