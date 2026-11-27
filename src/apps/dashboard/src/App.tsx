import { CyberLedgerMark } from "@cyberledger/ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { AddServerModal } from "@/components/AddServerModal";
import { TrafficChart } from "@/components/TrafficChart";
import {
  ATTACK_VECTORS,
  BASE_EVENTS_BY_RANGE,
  createInitialFeedRows,
  FEED_SCRIPT,
  type FeedRow,
  fmtCompact,
  fmtTime,
  HOST_MULT,
  INITIAL_INCIDENTS,
  type Incident,
  SERVERS,
  type TabId,
  TITLES,
  type TimeRange,
  TRAFFIC_BY_RANGE,
  WWW_URL,
} from "@/data/telemetry";

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
}

function getInitials(name?: string | null, email?: string): string {
  const source = (name?.trim() || email?.split("@")[0] || "CL").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [signingOut, setSigningOut] = useState<boolean>(false);

  const [tab, setTab] = useState<TabId>("overview");
  const [range, setRange] = useState<TimeRange>("24h");
  const [host, setHost] = useState<string>("all");
  const [query, setQuery] = useState<string>("");
  const [autoBlock, setAutoBlock] = useState<boolean>(true);
  const [incidents, setIncidents] = useState<Incident[]>(() =>
    INITIAL_INCIDENTS.map((item) => ({
      ...item,
      mitre: [...item.mitre],
      chain: item.chain.map((step) => ({ ...step })),
    })),
  );
  const [selectedId, setSelectedId] = useState<string>(INITIAL_INCIDENTS[0].id);
  const [feedPaused, setFeedPaused] = useState<boolean>(false);
  const [feedRows, setFeedRows] = useState<FeedRow[]>(createInitialFeedRows);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: "",
  });

  const feedStepRef = useRef(7);
  const toastTimerRef = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3200);
  };

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const res = await fetch(`${WWW_URL}/api/me`, {
          credentials: "include",
        });
        if (!res.ok) {
          if (!cancelled) window.location.replace(`${WWW_URL}/login`);
          return;
        }
        const data = (await res.json()) as { user?: AuthUser };
        if (!data?.user) {
          if (!cancelled) window.location.replace(`${WWW_URL}/login`);
          return;
        }
        if (!cancelled) {
          setAuthUser(data.user);
          setAuthChecked(true);
        }
      } catch {
        if (!cancelled) window.location.replace(`${WWW_URL}/login`);
      }
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (feedPaused) return;
      const entry = FEED_SCRIPT[feedStepRef.current++ % FEED_SCRIPT.length];
      setFeedRows((prev) => [
        ...prev.slice(-9).map((r) => ({ ...r, isNew: false })),
        {
          id: `ev-${Date.now()}-${feedStepRef.current}`,
          ts: fmtTime(new Date()),
          cls: entry[0],
          ip: entry[1],
          msg: entry[2],
          tag: entry[3],
          isNew: true,
        },
      ]);
    }, 2200);
    return () => window.clearInterval(interval);
  }, [feedPaused]);

  const visibleIncidents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return incidents.filter((inc) => {
      if (host !== "all" && inc.host !== host) return false;
      if (tab === "blocked" && inc.status !== "blocked") return false;
      if (!q) return true;
      const mitreStr = inc.mitre.join(" ").toLowerCase();
      return (
        inc.ip.toLowerCase().includes(q) ||
        inc.attack.toLowerCase().includes(q) ||
        mitreStr.includes(q) ||
        inc.host.toLowerCase().includes(q)
      );
    });
  }, [incidents, host, tab, query]);

  const selectedIncident = useMemo(
    () => visibleIncidents.find((i) => i.id === selectedId) ?? visibleIncidents[0] ?? incidents[0],
    [visibleIncidents, selectedId, incidents],
  );

  const mult = HOST_MULT[host] ?? 1;

  const trafficSeries = useMemo(
    () =>
      TRAFFIC_BY_RANGE[range].map((pt) => ({
        t: pt.t,
        events: Math.round(pt.events * mult),
        threats: Math.max(1, Math.round(pt.threats * mult)),
      })),
    [range, mult],
  );

  const scaledVectors = useMemo(
    () =>
      ATTACK_VECTORS.map((v) => ({
        ...v,
        count: Math.max(4, Math.round(v.count * mult)),
      })),
    [mult],
  );
  const maxVectorCount = Math.max(...scaledVectors.map((v) => v.count), 1);
  const totalVectorHits = scaledVectors.reduce((acc, v) => acc + v.count, 0);

  const openReviews = incidents.filter((i) => i.status === "review").length;
  const blockedCount = 17 + incidents.filter((i) => i.status === "blocked").length;
  const scaledEvents = Math.round(BASE_EVENTS_BY_RANGE[range] * mult);

  const toggleMitigation = (id: string) => {
    const target = incidents.find((item) => item.id === id);
    if (!target) return;
    const nextBlocked = target.status !== "blocked";

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;
        const nextChain = [...inc.chain];
        if (nextChain.length > 0) {
          nextChain[nextChain.length - 1] = nextBlocked
            ? { label: "Blocked by admin via iptables DROP", score: "60m TTL", tone: "safe" }
            : { label: "Firewall rule lifted by admin", score: "manual", tone: "" };
        }
        return {
          ...inc,
          status: nextBlocked ? "blocked" : "review",
          actor: nextBlocked ? "ADMIN" : null,
          updated: "just now",
          chain: nextChain,
        };
      }),
    );

    setFeedRows((prev) => [
      ...prev.slice(-9).map((r) => ({ ...r, isNew: false })),
      {
        id: `act-${Date.now()}`,
        ts: fmtTime(new Date()),
        cls: nextBlocked ? "block" : "warn",
        ip: target.ip,
        msg: nextBlocked
          ? `admin: iptables DROP applied on ${target.host}`
          : `admin: firewall block removed on ${target.host}`,
        tag: nextBlocked ? "blocked" : "unblocked",
        isNew: true,
      },
    ]);

    showToast(
      nextBlocked
        ? `Blocked ${target.ip} on ${target.host} (60m auto-unban queued)`
        : `Unblocked ${target.ip} on ${target.host}`,
    );
  };

  const showCharts = tab === "overview" || tab === "incidents";
  const showIncidents = tab === "overview" || tab === "incidents" || tab === "blocked";
  const showFeed = tab === "overview" || tab === "feed";
  const showServers = tab === "overview" || tab === "servers" || tab === "blocked";
  const showRightRail = showFeed || showServers;

  const activeQueryLower = query.trim().toLowerCase();

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch(`${WWW_URL}/api/me`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      // Redirect even if sign-out request fails.
    } finally {
      window.location.replace(`${WWW_URL}/login`);
    }
  };

  if (!authChecked || !authUser) {
    return (
      <div className="bg-canvas text-ink-secondary flex min-h-svh items-center justify-center font-mono text-[12.5px]">
        Checking session...
      </div>
    );
  }

  return (
    <div className="bg-canvas text-ink flex min-h-svh text-[13.5px]">
      {/* Sidebar */}
      <aside
        aria-label="Primary navigation"
        className={`border-line bg-canvas fixed inset-y-0 left-0 z-40 flex w-[236px] shrink-0 flex-col border-r transition-transform duration-150 lg:sticky lg:top-0 lg:h-svh lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-line flex h-14 items-center border-b px-4">
          <a href={WWW_URL} aria-label="cyberLedger home" className="rounded">
            <CyberLedgerMark size={20} />
          </a>
        </div>

        <div className="p-3">
          <div className="border-line bg-panel hover:border-line-hover relative flex h-9 items-center rounded-md border px-2.5 transition-colors">
            <span className="bg-safe mr-2 h-2 w-2 shrink-0 rounded-full" aria-hidden="true" />
            <select
              value={host}
              onChange={(e) => setHost(e.target.value)}
              aria-label="Filter by server"
              className="text-ink w-full cursor-pointer appearance-none bg-transparent pr-5 font-mono text-[12px] focus:outline-none"
            >
              <option value="all" className="bg-panel text-ink">
                All servers (4)
              </option>
              {SERVERS.map((s) => (
                <option key={s.name} value={s.name} className="bg-panel text-ink">
                  {s.name}
                </option>
              ))}
            </select>
            <span
              className="text-ink-muted pointer-events-none absolute right-2.5"
              aria-hidden="true"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </div>
        </div>

        <div className="text-ink-muted px-4 pt-1 pb-1.5 font-mono text-[10.5px] tracking-[0.06em] uppercase">
          Workspace
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-2.5" aria-label="Console views">
          {(
            [
              {
                id: "overview" as const,
                label: "Overview",
                icon: (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                ),
              },
              {
                id: "incidents" as const,
                label: "Incidents",
                badge: String(incidents.length),
                badgeTone: openReviews > 0 ? "alert" : "neutral",
                icon: (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 9v4M12 17h.01" />
                    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                  </svg>
                ),
              },
              {
                id: "feed" as const,
                label: "Live Feed",
                badge: feedPaused ? "Paused" : "Live",
                badgeTone: feedPaused ? "neutral" : "live",
                icon: (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 12h4l3-8 4 16 3-8h4" />
                  </svg>
                ),
              },
              {
                id: "blocked" as const,
                label: "Blocked IPs",
                badge: String(blockedCount),
                badgeTone: "neutral",
                icon: (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                  </svg>
                ),
              },
              {
                id: "servers" as const,
                label: "Servers",
                badge: "4/4",
                badgeTone: "neutral",
                icon: (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="4" width="18" height="6" rx="1.5" />
                    <rect x="3" y="14" width="18" height="6" rx="1.5" />
                    <path d="M7 7h.01M7 17h.01" />
                  </svg>
                ),
              },
            ] as const
          ).map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  setMenuOpen(false);
                }}
                className={`flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-left text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-surface text-ink"
                    : "text-ink-secondary hover:bg-panel hover:text-ink"
                }`}
              >
                <span className={active ? "text-ink" : "text-ink-muted"}>{item.icon}</span>
                <span className="flex-1 truncate">{item.label}</span>
                {"badge" in item && item.badge && (
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[10.5px] leading-none ${
                      item.badgeTone === "alert"
                        ? "bg-danger/15 text-danger"
                        : item.badgeTone === "live"
                          ? "bg-safe/15 text-safe"
                          : "bg-well text-ink-muted border-line border"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-line flex flex-col gap-3 border-t p-3">
          <div className="border-line bg-panel flex items-center justify-between gap-2 rounded-md border px-3 py-2.5">
            <div className="min-w-0">
              <div className="text-ink text-[12.5px] font-medium">Auto-Block</div>
              <div className="text-ink-muted font-mono text-[11px]">
                {autoBlock ? "Risk >= 90 active" : "Manual review only"}
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoBlock}
              aria-label="Toggle automatic blocking for risk 90 and above"
              onClick={() => {
                const next = !autoBlock;
                setAutoBlock(next);
                showToast(
                  next
                    ? "Auto-Block enabled for risk scores 90 and above"
                    : "Auto-Block paused; manual confirmation required",
                );
              }}
              className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-colors ${
                autoBlock ? "border-accent bg-accent" : "border-line-hover bg-well"
              }`}
            >
              <span
                className={`bg-ink block h-3.5 w-3.5 rounded-full transition-transform ${
                  autoBlock ? "translate-x-[17px]" : "translate-x-[2px]"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-2.5 px-1">
            <div
              aria-hidden="true"
              className="border-line bg-surface text-ink-soft flex h-8 w-8 shrink-0 items-center justify-center rounded-md border font-mono text-[11px] font-medium"
            >
              {getInitials(authUser.name, authUser.email)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-ink truncate text-[12.5px] font-medium">
                {authUser.name || authUser.email.split("@")[0]}
              </div>
              <div className="text-ink-muted truncate font-mono text-[11px]">{authUser.email}</div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              title="Sign out"
              aria-label="Sign out"
              className="text-ink-muted hover:bg-surface hover:text-ink flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors disabled:opacity-50"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Scrim */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      {/* Main Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="border-line bg-canvas/95 sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 backdrop-blur-xs sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              className="border-line bg-panel text-ink-secondary hover:text-ink flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border lg:hidden"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <h1 className="text-ink truncate text-[15px] font-semibold tracking-[-0.02em]">
              {TITLES[tab]}
            </h1>
            <span className="border-line bg-panel text-ink-secondary hidden items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] sm:inline-flex">
              <span className="bg-safe h-1.5 w-1.5 rounded-full" aria-hidden="true" />
              <span>{host === "all" ? "4 agents online" : host}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="border-line bg-well focus-within:border-line-strong relative hidden h-8 w-[210px] items-center rounded-md border px-2.5 md:flex lg:w-[240px]">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="text-ink-muted mr-2 shrink-0"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search IP, MITRE, host..."
                aria-label="Filter incidents by IP, attack, MITRE technique, or host"
                className="text-ink placeholder:text-ink-muted w-full bg-transparent text-[12.5px] focus:outline-none"
              />
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="text-ink-muted hover:text-ink ml-1 cursor-pointer text-[14px] leading-none"
                >
                  &times;
                </button>
              )}
            </div>

            <div
              role="group"
              aria-label="Time range"
              className="border-line bg-well hidden items-center rounded-md border p-0.5 sm:flex"
            >
              {(["1h", "24h", "7d"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={`h-6 cursor-pointer rounded px-2 font-mono text-[11.5px] transition-colors ${
                    range === r ? "bg-surface text-ink" : "text-ink-muted hover:text-ink-secondary"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="bg-ink text-canvas inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 text-[12.5px] font-medium transition-opacity hover:opacity-90"
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
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Add server</span>
            </button>
          </div>
        </header>

        {/* Workspace Content */}
        <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-4 p-4 sm:p-6">
          {/* Unified 4-cell KPI Ribbon */}
          <section
            aria-label="Key telemetry metrics"
            className="border-line bg-line grid grid-cols-1 gap-px overflow-hidden rounded-lg border sm:grid-cols-2 xl:grid-cols-4"
          >
            <div className="bg-panel p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-secondary text-[12px] font-medium">
                  Events processed ({range})
                </span>
                <span className="bg-safe/12 text-safe rounded px-1.5 py-0.5 font-mono text-[10.5px]">
                  +12.4%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-ink font-mono text-[24px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
                  {fmtCompact(scaledEvents)}
                </span>
              </div>
              <div className="text-ink-muted mt-2 text-[11.5px]">Average ingest 3.8 ms</div>
            </div>

            <div className="bg-panel p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-secondary text-[12px] font-medium">Active incidents</span>
                <span
                  className={`rounded px-1.5 py-0.5 font-mono text-[10.5px] ${
                    openReviews > 0 ? "bg-warn/12 text-warn" : "bg-safe/12 text-safe"
                  }`}
                >
                  {openReviews ? `${openReviews} need review` : "all handled"}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-ink font-mono text-[24px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
                  {incidents.length}
                </span>
                <span className="text-ink-muted font-mono text-[12px]">
                  {openReviews ? `${openReviews} open` : "all contained"}
                </span>
              </div>
              <div className="text-ink-muted mt-2 text-[11.5px]">Deduplicated by source IP</div>
            </div>

            <div className="bg-panel p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-secondary text-[12px] font-medium">IPs blocked</span>
                <span className="border-line bg-well text-ink-muted rounded border px-1.5 py-0.5 font-mono text-[10.5px]">
                  60m TTL
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-ink font-mono text-[24px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
                  {blockedCount}
                </span>
              </div>
              <div className="text-ink-muted mt-2 text-[11.5px]">
                14 automatic, {blockedCount - 14} manual
              </div>
            </div>

            <div className="bg-panel p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-secondary text-[12px] font-medium">
                  AI triage efficiency
                </span>
                <span className="bg-safe/12 text-safe rounded px-1.5 py-0.5 font-mono text-[10.5px]">
                  -92% LLM
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-ink font-mono text-[24px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
                  99.1%
                </span>
              </div>
              <div className="text-ink-muted mt-2 text-[11.5px]">Scored in under 20 ms</div>
            </div>
          </section>

          {/* Analytics Row */}
          {showCharts && (
            <section
              aria-label="Traffic and attack vector analytics"
              className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]"
            >
              <div className="border-line bg-panel rounded-lg border p-4 sm:p-5">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-ink text-[14px] font-semibold tracking-[-0.015em]">
                      Traffic and threat velocity
                    </h2>
                    <p className="text-ink-muted mt-0.5 text-[12px]">
                      Ingested log volume against flagged threats across{" "}
                      {host === "all" ? "all servers" : host}
                    </p>
                  </div>
                  <div className="text-ink-secondary flex items-center gap-3 text-[11.5px]">
                    <span className="inline-flex items-center gap-1.5">
                      <i className="bg-baseline inline-block h-2 w-2 rounded-xs" />
                      Events
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <i className="bg-danger inline-block h-2 w-2 rounded-xs" />
                      Threats
                    </span>
                  </div>
                </div>
                <TrafficChart data={trafficSeries} />
              </div>

              <div className="border-line bg-panel flex flex-col justify-between rounded-lg border p-4 sm:p-5">
                <div>
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-ink text-[14px] font-semibold tracking-[-0.015em]">
                        Top attack vectors
                      </h2>
                      <p className="text-ink-muted mt-0.5 text-[12px]">
                        MITRE ATT&amp;CK classified activity
                      </p>
                    </div>
                    <span className="text-ink-muted font-mono text-[11px]">
                      {totalVectorHits.toLocaleString()} hits
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {scaledVectors.map((v) => {
                      const pct = Math.max(6, Math.round((v.count / maxVectorCount) * 100));
                      const isFiltered =
                        activeQueryLower.length > 0 && activeQueryLower === v.mitre.toLowerCase();
                      return (
                        <button
                          key={v.mitre}
                          type="button"
                          title={`Filter incidents by ${v.mitre}`}
                          onClick={() => setQuery(isFiltered ? "" : v.mitre)}
                          className={`group flex w-full cursor-pointer flex-col gap-1.5 rounded-md border px-2.5 py-2 text-left transition-colors ${
                            isFiltered
                              ? "border-accent/60 bg-surface"
                              : "hover:border-line hover:bg-surface/60 border-transparent"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-[12.5px]">
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="text-ink truncate font-medium">{v.name}</span>
                              <span className="border-line bg-well text-ink-muted rounded border px-1.5 py-0.5 font-mono text-[10px]">
                                {v.mitre}
                              </span>
                            </span>
                            <span className="text-ink-secondary font-mono text-[12px] tabular-nums">
                              {v.count.toLocaleString()}
                            </span>
                          </div>
                          <div className="bg-well h-1.5 w-full overflow-hidden rounded-full">
                            <div
                              style={{ width: `${pct}%`, backgroundColor: v.color }}
                              className="h-full rounded-full transition-all duration-200"
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-line text-ink-muted mt-4 flex items-center justify-between border-t pt-3 text-[11.5px]">
                  <span>
                    Sources: <strong className="text-ink-soft font-medium">UFW, Auth, Nginx, App</strong>
                  </span>
                  <span className="font-mono">MITRE v15</span>
                </div>
              </div>
            </section>
          )}

          {/* Lower Operations Split */}
          <section
            className={`grid grid-cols-1 gap-4 ${
              showIncidents && showRightRail
                ? "xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]"
                : ""
            }`}
          >
            {/* Incidents Table + AI Incident Briefing */}
            {showIncidents && (
              <div className="border-line bg-panel flex min-w-0 flex-col rounded-lg border p-4 sm:p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-ink text-[14px] font-semibold tracking-[-0.015em]">
                      {tab === "blocked" ? "Blocked attackers" : "Correlated incidents"}
                    </h2>
                    <p className="text-ink-muted mt-0.5 text-[12px]">
                      Select a row to inspect the AI diagnosis and attack trace
                    </p>
                  </div>
                  <span className="text-ink-muted font-mono text-[11.5px]">
                    {visibleIncidents.length} shown
                  </span>
                </div>

                <div className="border-line overflow-x-auto rounded-md border">
                  <table className="w-full border-collapse text-left text-[12.5px]">
                    <thead>
                      <tr className="border-line bg-well text-ink-muted border-b font-mono text-[10.5px] tracking-[0.04em] uppercase">
                        <th className="px-3 py-2.5 font-medium">Source IP</th>
                        <th className="px-3 py-2.5 font-medium">Threat</th>
                        <th className="px-3 py-2.5 font-medium">Risk</th>
                        <th className="px-3 py-2.5 font-medium">Status</th>
                        <th className="px-3 py-2.5 text-right font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-line divide-y">
                      {visibleIncidents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-ink-muted px-4 py-8 text-center text-[12.5px]">
                            No incidents match the active filter. Clear the search or switch hosts
                            to inspect all activity.
                          </td>
                        </tr>
                      ) : (
                        visibleIncidents.map((inc) => {
                          const isSelected = selectedIncident?.id === inc.id;
                          const isBlocked = inc.status === "blocked";
                          const statusLabel = isBlocked
                            ? inc.actor === "AUTO"
                              ? "Auto-blocked"
                              : "Blocked"
                            : "Needs review";

                          return (
                            <tr
                              key={inc.id}
                              tabIndex={0}
                              aria-selected={isSelected}
                              onClick={() => setSelectedId(inc.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setSelectedId(inc.id);
                                }
                              }}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? "bg-surface" : "hover:bg-surface/50"
                              }`}
                            >
                              <td className="px-3 py-2.5 align-top">
                                <div className="text-ink font-mono text-[12.5px] font-medium">
                                  {inc.ip}
                                </div>
                                <div className="text-ink-muted mt-0.5 flex items-center gap-2 font-mono text-[11px]">
                                  <span>{inc.host}</span>
                                  <span>{inc.updated}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 align-top">
                                <div className="text-ink font-medium">{inc.attack}</div>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {inc.mitre.map((code) => (
                                    <span
                                      key={code}
                                      className="border-line bg-well text-ink-secondary rounded border px-1.5 py-0.5 font-mono text-[10px]"
                                    >
                                      {code}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-3 py-2.5 align-top">
                                <span
                                  className={`inline-flex rounded px-1.5 py-0.5 font-mono text-[11.5px] font-semibold tabular-nums ${
                                    inc.risk >= 90
                                      ? "bg-danger/15 text-danger border-danger/30 border"
                                      : "bg-warn/15 text-warn border-warn/30 border"
                                  }`}
                                >
                                  {inc.risk}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 align-top">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-medium whitespace-nowrap ${
                                    isBlocked
                                      ? "bg-safe/12 text-safe"
                                      : "bg-warn/12 text-warn"
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      isBlocked ? "bg-safe" : "bg-warn"
                                    }`}
                                    aria-hidden="true"
                                  />
                                  {statusLabel}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-right align-top">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMitigation(inc.id);
                                  }}
                                  className={`h-7 cursor-pointer rounded border px-2.5 text-[11.5px] font-medium whitespace-nowrap transition-colors ${
                                    isBlocked
                                      ? "border-line bg-well text-ink-soft hover:border-line-hover hover:text-ink"
                                      : "border-danger/35 bg-danger/12 text-danger hover:bg-danger/20"
                                  }`}
                                >
                                  {isBlocked ? "Unblock" : "Block IP"}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* AI Incident Briefing */}
                {selectedIncident && (
                  <div
                    aria-live="polite"
                    className="border-line bg-well mt-4 overflow-hidden rounded-md border"
                  >
                    <div className="border-line bg-surface/60 flex flex-wrap items-center justify-between gap-2 border-b px-3.5 py-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="bg-accent/15 text-accent inline-flex h-5 w-5 items-center justify-center rounded"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </span>
                        <span className="text-ink text-[12.5px] font-semibold">
                          AI incident briefing
                        </span>
                        <span className="border-line bg-well text-ink-soft rounded border px-1.5 py-0.5 font-mono text-[10.5px]">
                          {selectedIncident.ip}
                        </span>
                        <span className="border-line bg-well text-ink-secondary rounded border px-1.5 py-0.5 font-mono text-[10.5px]">
                          {selectedIncident.host}
                        </span>
                        <span className="border-line bg-well text-ink-muted rounded border px-1.5 py-0.5 font-mono text-[10.5px]">
                          {selectedIncident.events} events
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            showToast(`Added ${selectedIncident.ip} to safelist preview`)
                          }
                          className="border-line bg-surface text-ink-soft hover:border-line-hover hover:text-ink h-7 cursor-pointer rounded border px-2.5 text-[11.5px] font-medium transition-colors"
                        >
                          Safelist IP
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleMitigation(selectedIncident.id)}
                          className={`h-7 cursor-pointer rounded px-2.5 text-[11.5px] font-medium transition-colors ${
                            selectedIncident.status === "blocked"
                              ? "border-line bg-surface text-ink-soft hover:border-line-hover hover:text-ink border"
                              : "bg-ink text-canvas hover:opacity-90"
                          }`}
                        >
                          {selectedIncident.status === "blocked" ? "Unblock" : "Block IP"}
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5">
                      <p className="text-ink-soft text-[12.5px] leading-[1.6]">
                        {selectedIncident.summary}
                      </p>

                      <div className="text-ink-muted mt-3.5 mb-2 font-mono text-[10.5px] tracking-[0.06em] uppercase">
                        Attack chain trace
                      </div>

                      <ol className="flex flex-col gap-1.5">
                        {selectedIncident.chain.map((step, idx) => {
                          const dotColor =
                            step.tone === "bad"
                              ? "bg-danger"
                              : step.tone === "warn"
                                ? "bg-warn"
                                : step.tone === "safe"
                                  ? "bg-safe"
                                  : "bg-ink-muted";
                          const scoreColor =
                            step.tone === "bad"
                              ? "text-danger"
                              : step.tone === "warn"
                                ? "text-warn"
                                : step.tone === "safe"
                                  ? "text-safe"
                                  : "text-ink-muted";
                          return (
                            <li
                              key={`${step.label}-${idx}`}
                              className="border-line/70 bg-panel/60 flex items-center justify-between gap-3 rounded border px-2.5 py-1.5 text-[12px]"
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                <span
                                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`}
                                  aria-hidden="true"
                                />
                                <span className="text-ink-muted font-mono text-[11px]">
                                  {idx + 1}.
                                </span>
                                <span className="text-ink truncate">{step.label}</span>
                              </span>
                              <span className={`shrink-0 font-mono text-[11px] ${scoreColor}`}>
                                {step.score}
                              </span>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Right Rail: Live Feed + Connected Servers */}
            {showRightRail && (
              <div className="flex min-w-0 flex-col gap-4">
                {showFeed && (
                  <div className="border-line bg-panel flex flex-col rounded-lg border p-4 sm:p-5">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-ink text-[14px] font-semibold tracking-[-0.015em]">
                          Live event stream
                        </h2>
                        <span className="border-line bg-well text-ink-muted rounded border px-1.5 py-0.5 font-mono text-[10.5px]">
                          {host === "all" ? "All hosts" : host}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 font-mono text-[10.5px] ${
                            feedPaused
                              ? "bg-well text-ink-muted"
                              : "bg-safe/12 text-safe"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              feedPaused ? "bg-ink-muted" : "bg-safe animate-pulse"
                            }`}
                            aria-hidden="true"
                          />
                          {feedPaused ? "Paused" : "Live"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setFeedPaused((prev) => !prev)}
                        className="border-line bg-surface text-ink-soft hover:border-line-hover hover:text-ink h-7 cursor-pointer rounded border px-2.5 text-[11.5px] font-medium transition-colors"
                      >
                        {feedPaused ? "Resume" : "Pause"}
                      </button>
                    </div>

                    <div
                      role="log"
                      aria-live="off"
                      aria-label="Live security event stream"
                      className={`border-line bg-well flex flex-col gap-1 overflow-y-auto rounded-md border p-2 font-mono text-[11.5px] ${
                        tab === "feed" ? "max-h-[520px]" : "max-h-[268px]"
                      }`}
                    >
                      {feedRows.map((row) => {
                        const tagClass =
                          row.cls === "bad"
                            ? "bg-danger/15 text-danger"
                            : row.cls === "warn"
                              ? "bg-warn/15 text-warn"
                              : row.cls === "block"
                                ? "bg-accent/15 text-accent"
                                : "bg-safe/12 text-safe";
                        return (
                          <div
                            key={row.id}
                            className={`hover:bg-panel/80 grid grid-cols-[58px_102px_minmax(0,1fr)_auto] items-center gap-2 rounded px-2 py-1.5 ${
                              row.isNew ? "animate-feed-in bg-panel/60" : ""
                            }`}
                          >
                            <span className="text-ink-muted text-[10.5px] tabular-nums">
                              {row.ts}
                            </span>
                            <span className="text-ink-secondary truncate text-[11px]">
                              {row.ip}
                            </span>
                            <span className="text-ink-soft truncate" title={row.msg}>
                              {row.msg}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] leading-none whitespace-nowrap ${tagClass}`}
                            >
                              {row.tag}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {showServers && (
                  <div className="border-line bg-panel rounded-lg border p-4 sm:p-5">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-ink text-[14px] font-semibold tracking-[-0.015em]">
                          Connected servers
                        </h2>
                        <p className="text-ink-muted mt-0.5 text-[12px]">
                          Click a host to filter metrics and incidents
                        </p>
                      </div>
                      <span className="bg-safe/12 text-safe rounded px-1.5 py-0.5 font-mono text-[10.5px]">
                        4 of 4 online
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {SERVERS.map((s) => {
                        const isActive = host === s.name;
                        return (
                          <button
                            key={s.name}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => setHost(isActive ? "all" : s.name)}
                            className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${
                              isActive
                                ? "border-accent/60 bg-surface"
                                : "border-line bg-well/60 hover:border-line-hover hover:bg-surface/60"
                            }`}
                          >
                            <span className="flex min-w-0 items-center gap-2.5">
                              <span
                                className="bg-safe h-2 w-2 shrink-0 rounded-full"
                                aria-hidden="true"
                              />
                              <span className="min-w-0">
                                <span className="text-ink block truncate font-mono text-[12.5px] font-medium">
                                  {s.name}
                                </span>
                                <span className="text-ink-muted mt-0.5 flex items-center gap-2 text-[11px]">
                                  <span>{s.os}</span>
                                  <span className="font-mono">{s.region}</span>
                                </span>
                              </span>
                            </span>

                            <span className="text-ink-secondary flex shrink-0 items-center gap-3 font-mono text-[11px] tabular-nums">
                              <span>{s.rpm}</span>
                              <span className="text-safe">{s.latency}</span>
                              <span className="text-ink-muted">{s.cpu}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Add Server Modal */}
      <AddServerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onDone={() => {
          setModalOpen(false);
          showToast("Waiting for first agent heartbeat...");
        }}
      />

      {/* Toast Notification */}
      <div
        role="status"
        aria-live="polite"
        className={`border-line-strong bg-surface text-ink fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-md border px-3.5 py-2.5 text-[12.5px] shadow-xl transition-all duration-150 ${
          toast.visible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <span
          aria-hidden="true"
          className="bg-safe/15 text-safe inline-flex h-5 w-5 items-center justify-center rounded-full"
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
            <path d="m5 12 5 5L20 7" />
          </svg>
        </span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
