export type TabId = "overview" | "incidents" | "feed" | "blocked" | "servers";
export type TimeRange = "1h" | "24h" | "7d";
export type TraceTone = "" | "warn" | "bad" | "safe";
export type FeedTone = "ok" | "warn" | "bad" | "block";

export interface TrafficPoint {
  t: string;
  events: number;
  threats: number;
}

export interface AttackVector {
  name: string;
  mitre: string;
  count: number;
  color: string;
}

export interface TraceStep {
  label: string;
  score: string;
  tone: TraceTone;
}

export interface Incident {
  id: string;
  ip: string;
  host: string;
  attack: string;
  mitre: string[];
  risk: number;
  status: "blocked" | "review";
  actor: "AUTO" | "ADMIN" | null;
  updated: string;
  events: number;
  summary: string;
  chain: TraceStep[];
}

export interface ServerInfo {
  name: string;
  os: string;
  region: string;
  latency: string;
  rpm: string;
  cpu: string;
}

export interface FeedRow {
  id: string;
  ts: string;
  cls: FeedTone;
  ip: string;
  msg: string;
  tag: string;
  isNew: boolean;
}

export const WWW_URL = import.meta.env.VITE_WWW_URL ?? "http://localhost:3000";

export const INSTALL_CMD =
  "curl -sSL get.cyberledger.dev | sudo sh -s -- --key=cl_live_99a8b7c6d5";

export const TRAFFIC_BY_RANGE: Record<TimeRange, TrafficPoint[]> = {
  "1h": [
    { t: "01:20", events: 1820, threats: 14 },
    { t: "01:25", events: 2140, threats: 19 },
    { t: "01:30", events: 1960, threats: 12 },
    { t: "01:35", events: 2480, threats: 31 },
    { t: "01:40", events: 3120, threats: 68 },
    { t: "01:45", events: 4290, threats: 142 },
    { t: "01:50", events: 2890, threats: 48 },
    { t: "01:55", events: 2310, threats: 22 },
    { t: "02:00", events: 2640, threats: 27 },
    { t: "02:05", events: 3580, threats: 94 },
    { t: "02:10", events: 2420, threats: 18 },
    { t: "02:15", events: 2190, threats: 15 },
  ],
  "24h": [
    { t: "04:00", events: 8400, threats: 42 },
    { t: "06:00", events: 7920, threats: 38 },
    { t: "08:00", events: 10300, threats: 74 },
    { t: "10:00", events: 12800, threats: 96 },
    { t: "12:00", events: 14200, threats: 184 },
    { t: "14:00", events: 13600, threats: 128 },
    { t: "16:00", events: 15900, threats: 245 },
    { t: "18:00", events: 14700, threats: 162 },
    { t: "20:00", events: 13100, threats: 118 },
    { t: "22:00", events: 11900, threats: 210 },
    { t: "00:00", events: 10400, threats: 92 },
    { t: "02:00", events: 9620, threats: 86 },
  ],
  "7d": [
    { t: "Sat", events: 118000, threats: 840 },
    { t: "Sun", events: 109000, threats: 790 },
    { t: "Mon", events: 152000, threats: 1340 },
    { t: "Tue", events: 164000, threats: 1580 },
    { t: "Wed", events: 149000, threats: 1120 },
    { t: "Thu", events: 171000, threats: 1890 },
    { t: "Fri", events: 142840, threats: 1475 },
  ],
};

export const BASE_EVENTS_BY_RANGE: Record<TimeRange, number> = {
  "1h": 31800,
  "24h": 142800,
  "7d": 1010000,
};

export const HOST_MULT: Record<string, number> = {
  all: 1,
  "web-prod-02": 0.42,
  "api-eu-01": 0.28,
  "edge-gw-01": 0.22,
  "db-replica-01": 0.08,
};

export const ATTACK_VECTORS: AttackVector[] = [
  { name: "SSH Brute Force", mitre: "T1110", count: 412, color: "#D9A14A" },
  { name: "Port Scanning", mitre: "T1046", count: 294, color: "#7B95B5" },
  { name: "SQL Injection", mitre: "T1190", count: 186, color: "#E06C62" },
  { name: "Path Traversal", mitre: "T1083", count: 138, color: "#7FA982" },
  { name: "Cred Stuffing", mitre: "T1110.004", count: 95, color: "#9C9A93" },
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: "inc_4419",
    ip: "185.220.101.42",
    host: "web-prod-02",
    attack: "SQL Injection and SSH Brute Force",
    mitre: ["T1190", "T1110"],
    risk: 94,
    status: "blocked",
    actor: "AUTO",
    updated: "2m ago",
    events: 438,
    summary:
      "Source IP progressed from a 1,024-port SYN scan to 412 failed SSH logins for root, then sent a UNION SELECT SQL injection payload to /login. Risk crossed 90 and the firewall agent dropped the IP automatically for 60 minutes.",
    chain: [
      { label: "SYN scan across 1,024 ports", score: "risk 30", tone: "" },
      { label: "412 failed SSH logins for root", score: "risk 62", tone: "warn" },
      { label: "UNION SELECT payload on /login", score: "risk 94", tone: "bad" },
      { label: "Auto-blocked via iptables DROP", score: "60m TTL", tone: "safe" },
    ],
  },
  {
    id: "inc_4418",
    ip: "197.55.12.40",
    host: "api-eu-01",
    attack: "Distributed SSH Brute Force",
    mitre: ["T1110"],
    risk: 84,
    status: "review",
    actor: null,
    updated: "7m ago",
    events: 196,
    summary:
      "Repeated credential attempts targeting deploy and ubuntu accounts on port 22 after probing Nginx admin endpoints. Risk score sits below the 90 auto-block threshold and waits for one-click mitigation.",
    chain: [
      { label: "Nginx admin endpoint 404 recon", score: "risk 28", tone: "" },
      { label: "196 SSH password failures on port 22", score: "risk 84", tone: "warn" },
      { label: "Awaiting operator decision", score: "manual", tone: "" },
    ],
  },
  {
    id: "inc_4416",
    ip: "45.155.205.93",
    host: "edge-gw-01",
    attack: "Sensitive File and .env Probing",
    mitre: ["T1083"],
    risk: 78,
    status: "review",
    actor: null,
    updated: "19m ago",
    events: 84,
    summary:
      "Automated scanner requested /.env, /.git/config, and /wp-config.php across HTTPS endpoints with high 404 velocity. Correlated into one incident and ready for manual block if activity continues.",
    chain: [
      { label: "Automated TLS handshake probe", score: "risk 22", tone: "" },
      { label: "84 sensitive path requests returning 404", score: "risk 78", tone: "warn" },
      { label: "Awaiting operator decision", score: "manual", tone: "" },
    ],
  },
  {
    id: "inc_4412",
    ip: "91.240.118.172",
    host: "web-prod-02",
    attack: "Multi-Port Recon and Exploit Attempt",
    mitre: ["T1046", "T1190"],
    risk: 91,
    status: "blocked",
    actor: "AUTO",
    updated: "41m ago",
    events: 312,
    summary:
      "Probed ports 21, 22, 80, 443, and 3306 before attempting remote command injection against /api/v1/export. Signed block rule applied and written to the audit log.",
    chain: [
      { label: "Probed 5 service ports (21, 22, 80, 443, 3306)", score: "risk 34", tone: "" },
      { label: "Command injection payload on /api/v1/export", score: "risk 91", tone: "bad" },
      { label: "Auto-blocked via iptables DROP", score: "60m TTL", tone: "safe" },
    ],
  },
];

export const SERVERS: ServerInfo[] = [
  {
    name: "web-prod-02",
    os: "Ubuntu 24.04",
    region: "eu-central",
    latency: "3ms",
    rpm: "1.9k/m",
    cpu: "0.4%",
  },
  {
    name: "api-eu-01",
    os: "Debian 12",
    region: "eu-west",
    latency: "4ms",
    rpm: "1.4k/m",
    cpu: "0.3%",
  },
  {
    name: "edge-gw-01",
    os: "Ubuntu 24.04",
    region: "us-east",
    latency: "5ms",
    rpm: "2.2k/m",
    cpu: "0.5%",
  },
  {
    name: "db-replica-01",
    os: "Debian 12",
    region: "eu-central",
    latency: "2ms",
    rpm: "410/m",
    cpu: "0.2%",
  },
];

export const FEED_SCRIPT: [FeedTone, string, string, string][] = [
  ["ok", "10.0.4.12", "GET /health 200", "ok"],
  ["ok", "10.0.4.18", "sshd: accepted key for deploy", "ok"],
  ["warn", "197.55.12.40", "sshd: failed password for ubuntu", "brute"],
  ["ok", "172.16.0.9", "GET /api/products 200", "ok"],
  ["warn", "185.220.101.42", "SYN scan on 1,024 ports", "scan"],
  ["ok", "10.0.4.12", "POST /api/sessions 201", "ok"],
  ["warn", "45.155.205.93", "GET /.env 404 (84 hits)", "probe"],
  ["bad", "185.220.101.42", "POST /login ' UNION SELECT --", "risk 94"],
  ["block", "185.220.101.42", "iptables DROP applied (60m)", "blocked"],
  ["ok", "10.0.4.18", "cron: snapshot completed", "ok"],
];

export const TITLES: Record<TabId, string> = {
  overview: "Security overview",
  incidents: "Active incidents",
  feed: "Live event stream",
  blocked: "Blocked IPs and mitigations",
  servers: "Connected Linux agents",
};

const pad = (n: number) => String(n).padStart(2, "0");

export function fmtTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function createInitialFeedRows(): FeedRow[] {
  const now = Date.now();
  return FEED_SCRIPT.slice(0, 7).map((item, idx) => ({
    id: `init-${idx}`,
    ts: fmtTime(new Date(now - (7 - idx) * 2000)),
    cls: item[0],
    ip: item[1],
    msg: item[2],
    tag: item[3],
    isNew: false,
  }));
}
