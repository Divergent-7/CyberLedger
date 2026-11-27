import { useEffect, useRef, useState } from "react";
import type { TrafficPoint } from "@/data/telemetry";

interface TrafficChartProps {
  data: TrafficPoint[];
}

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const cx = ((p0.x + p1.x) / 2).toFixed(1);
    d += ` C ${cx} ${p0.y.toFixed(1)}, ${cx} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }
  return d;
}

export function TrafficChart({ data }: TrafficChartProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(560);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const sync = () => setWidth(Math.max(el.clientWidth || 560, 280));
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = 214;
  const padL = 38;
  const padR = 12;
  const padT = 12;
  const padB = 26;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const maxEv = Math.max(...data.map((d) => d.events), 10) * 1.12;
  const maxTh = Math.max(...data.map((d) => d.threats), 5) * 1.18;
  const stepX = data.length > 1 ? plotW / (data.length - 1) : plotW;

  const xAt = (i: number) => padL + i * stepX;
  const yEv = (v: number) => padT + plotH - (v / maxEv) * plotH;
  const yTh = (v: number) => padT + plotH - (v / maxTh) * plotH;

  const evPts = data.map((d, i) => ({ x: xAt(i), y: yEv(d.events) }));
  const thPts = data.map((d, i) => ({ x: xAt(i), y: yTh(d.threats) }));

  const evLine = smoothPath(evPts);
  const thLine = smoothPath(thPts);
  const baseY = (padT + plotH).toFixed(1);
  const evArea =
    evPts.length > 1
      ? `${evLine} L ${evPts[evPts.length - 1].x.toFixed(1)} ${baseY} L ${evPts[0].x.toFixed(1)} ${baseY} Z`
      : "";
  const thArea =
    thPts.length > 1
      ? `${thLine} L ${thPts[thPts.length - 1].x.toFixed(1)} ${baseY} L ${thPts[0].x.toFixed(1)} ${baseY} Z`
      : "";

  const labelEvery = width < 440 && data.length > 7 ? 2 : 1;

  const handlePointerMove = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg || data.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * width;
    const rawIdx = Math.round((relX - padL) / stepX);
    setHoverIdx(Math.max(0, Math.min(data.length - 1, rawIdx)));
  };

  const hovered = hoverIdx !== null ? data[hoverIdx] : null;
  const hoveredEv = hoverIdx !== null ? evPts[hoverIdx] : null;
  const hoveredTh = hoverIdx !== null ? thPts[hoverIdx] : null;

  const tipW = 156;
  const tipLeft = hoveredEv
    ? hoveredEv.x > width - tipW - 24
      ? Math.max(8, hoveredEv.x - tipW - 14)
      : Math.min(width - tipW - 8, hoveredEv.x + 14)
    : 0;

  return (
    <div ref={stageRef} className="relative h-[214px] w-full select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="block h-full w-full overflow-visible"
        role="img"
        aria-label="Traffic and threat velocity over time"
      >
        <defs>
          <linearGradient id="evFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7B95B5" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#7B95B5" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="thFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E06C62" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#E06C62" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <g>
          {[0, 1, 2, 3].map((i) => {
            const frac = i / 3;
            const y = padT + plotH * (1 - frac);
            const val = Math.round(maxEv * frac);
            const lbl = val >= 1000 ? `${Math.round(val / 1000)}k` : String(val);
            return (
              <g key={i}>
                <line
                  x1={padL}
                  y1={y.toFixed(1)}
                  x2={width - padR}
                  y2={y.toFixed(1)}
                  stroke="#26241E"
                  strokeWidth="1"
                />
                <text
                  x={padL - 8}
                  y={(y + 3.5).toFixed(1)}
                  textAnchor="end"
                  fill="#6D6B65"
                  fontFamily="Geist Mono, monospace"
                  fontSize="10.5"
                >
                  {lbl}
                </text>
              </g>
            );
          })}
        </g>

        <g>
          {data.map((d, i) => {
            if (i % labelEvery !== 0 && i !== data.length - 1) return null;
            return (
              <text
                key={d.t}
                x={xAt(i).toFixed(1)}
                y={height - 6}
                textAnchor="middle"
                fill="#6D6B65"
                fontFamily="Geist Mono, monospace"
                fontSize="10.5"
              >
                {d.t}
              </text>
            );
          })}
        </g>

        {evArea && <path d={evArea} fill="url(#evFill)" />}
        {thArea && <path d={thArea} fill="url(#thFill)" />}
        {evLine && (
          <path
            d={evLine}
            fill="none"
            stroke="#7B95B5"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {thLine && (
          <path
            d={thLine}
            fill="none"
            stroke="#E06C62"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {hoveredEv && hoveredTh && (
          <>
            <line
              x1={hoveredEv.x.toFixed(1)}
              y1={padT}
              x2={hoveredEv.x.toFixed(1)}
              y2={padT + plotH}
              stroke="#4A463C"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            <circle
              cx={hoveredEv.x.toFixed(1)}
              cy={hoveredEv.y.toFixed(1)}
              r="3.5"
              fill="#14120B"
              stroke="#7B95B5"
              strokeWidth="1.75"
            />
            <circle
              cx={hoveredTh.x.toFixed(1)}
              cy={hoveredTh.y.toFixed(1)}
              r="3.5"
              fill="#14120B"
              stroke="#E06C62"
              strokeWidth="1.75"
            />
          </>
        )}

        <rect
          x={padL}
          y={padT}
          width={Math.max(plotW, 1)}
          height={Math.max(plotH, 1)}
          fill="transparent"
          className="cursor-crosshair"
          onPointerMove={(e) => handlePointerMove(e.clientX)}
          onPointerLeave={() => setHoverIdx(null)}
        />
      </svg>

      {hovered && (
        <div
          style={{ left: `${tipLeft}px` }}
          className="border-line-strong bg-surface/95 pointer-events-none absolute top-2 z-10 w-[156px] rounded-md border px-2.5 py-2 text-[11.5px] shadow-lg backdrop-blur-xs"
        >
          <div className="text-ink-muted mb-1 font-mono text-[10.5px]">{hovered.t}</div>
          <div className="flex items-center justify-between gap-2 py-0.5">
            <span className="text-ink-secondary inline-flex items-center gap-1.5">
              <i className="bg-baseline inline-block h-1.5 w-1.5 rounded-full" />
              Events
            </span>
            <span className="text-ink font-mono font-medium tabular-nums">
              {hovered.events.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 py-0.5">
            <span className="text-ink-secondary inline-flex items-center gap-1.5">
              <i className="bg-danger inline-block h-1.5 w-1.5 rounded-full" />
              Threats
            </span>
            <span className="text-ink font-mono font-medium tabular-nums">
              {hovered.threats.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
