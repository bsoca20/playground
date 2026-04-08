"use client";

import type { SimResult } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, isNaN(v) ? 0 : v));
}

function hexRgbArr(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}

// ─── Static config ────────────────────────────────────────────────────────────

const W = 860, H = 560, CX = 430, CY = 280, R1 = 155, R2 = 260;

const PILLARS = [
  { id: "medical",    label: "Medical",    sub: "Affairs",   angle: 0,   color: "#60a5fa", simKey: "launchReadiness"       as keyof SimResult },
  { id: "commercial", label: "Commercial", sub: "& Ventas",  angle: 60,  color: "#fb923c", simKey: "stakeholderTrust"      as keyof SimResult },
  { id: "access",     label: "Market",     sub: "Access",    angle: 120, color: "#a78bfa", simKey: "competitivePosition"   as keyof SimResult },
  { id: "patient",    label: "Patient",    sub: "Support",   angle: 180, color: "#f472b6", simKey: "financialSustainability" as keyof SimResult },
  { id: "innovation", label: "Innovation", sub: "& Digital", angle: 240, color: "#34d399", simKey: "launchAttractiveness"  as keyof SimResult },
  { id: "operations", label: "Operations", sub: "& Supply",  angle: 300, color: "#fbbf24", simKey: "organizationalReadiness" as keyof SimResult },
];

const OUTER_NODES = [
  { id: "kol",        label: "KOL Network",  pillar: "medical",    offset: -22 },
  { id: "msl",        label: "MSL Field",    pillar: "medical",    offset: +22 },
  { id: "kam",        label: "KAM",          pillar: "commercial", offset: -22 },
  { id: "hcp",        label: "HCP Eng.",     pillar: "commercial", offset: +22 },
  { id: "payers",     label: "Payers",       pillar: "access",     offset: -22 },
  { id: "neuro",      label: "Neurólogos",   pillar: "access",     offset: +22 },
  { id: "psp",        label: "PSP",          pillar: "patient",    offset: -22 },
  { id: "adherence",  label: "Adherencia",   pillar: "patient",    offset: +22 },
  { id: "digital",    label: "Digital",      pillar: "innovation", offset: -22 },
  { id: "congress",   label: "Congresos",    pillar: "innovation", offset: +22 },
  { id: "regulatory", label: "Regulatorio",  pillar: "operations", offset: -22 },
  { id: "pharmacov",  label: "Farmacovig.",  pillar: "operations", offset: +22 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function EcosystemMap({ sim, currentYear, launchClosed }: {
  sim: SimResult;
  currentYear: number;
  launchClosed: boolean;
}) {
  // Activation per pillar (0–1)
  const act: Record<string, number> = {};
  PILLARS.forEach(p => { act[p.id] = clamp01((sim[p.simKey] as number) / 100); });

  // Build pillar nodes
  const pillarNodes = PILLARS.map(p => ({ ...p, ...polar(CX, CY, R1, p.angle), r: 28 }));
  const pillarByIdMap = new Map(PILLARS.map(p => [p.id, p]));

  // Build outer nodes
  const outerNodes = OUTER_NODES.map(o => {
    const pillar = pillarByIdMap.get(o.pillar)!;
    const pos = polar(CX, CY, R2, pillar.angle + o.offset);
    return { ...o, ...pos, r: 15, color: pillar.color, activation: act[o.pillar] };
  });

  // All nodes map for edge lookup
  const nodeCoords = new Map<string, { x: number; y: number }>();
  nodeCoords.set("cefalix", { x: CX, y: CY });
  pillarNodes.forEach(n => nodeCoords.set(n.id, { x: n.x, y: n.y }));
  outerNodes.forEach(n => nodeCoords.set(n.id, { x: n.x, y: n.y }));

  // Edges
  const edges: Array<{ x1: number; y1: number; x2: number; y2: number; activation: number; main: boolean; color: string; idx: number }> = [];
  let edgeIdx = 0;

  // Center → pillars
  pillarNodes.forEach(p => {
    edges.push({ x1: CX, y1: CY, x2: p.x, y2: p.y, activation: act[p.id], main: true, color: "#FF3030", idx: edgeIdx++ });
  });

  // Pillars → outer
  OUTER_NODES.forEach(o => {
    const pillar = pillarByIdMap.get(o.pillar)!;
    const from = nodeCoords.get(o.pillar)!;
    const to = nodeCoords.get(o.id)!;
    edges.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, activation: act[o.pillar], main: false, color: pillar.color, idx: edgeIdx++ });
  });

  // Cross-pillar (adjacent, very subtle)
  PILLARS.forEach((p, i) => {
    const next = PILLARS[(i + 1) % PILLARS.length];
    const a = nodeCoords.get(p.id)!;
    const b = nodeCoords.get(next.id)!;
    const crossAct = (act[p.id] + act[next.id]) / 2 * 0.35;
    edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, activation: crossAct, main: false, color: "#ffffff", idx: edgeIdx++ });
  });

  return (
    <div
      className="rounded-[1.5rem] p-5"
      style={{ backgroundColor: "#070707", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: "#FF3030" }}>
            Ecosystem Map
          </div>
          <div className="mt-0.5 text-[10px]" style={{ color: "rgba(255,255,255,0.22)" }}>
            Red neural de lanzamiento · Cefalix {currentYear}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {[
            { label: "Readiness",     value: sim.launchReadiness,       color: "#60a5fa" },
            { label: "Stakeholders",  value: sim.stakeholderTrust,       color: "#fb923c" },
            { label: "Competitividad",value: sim.competitivePosition,    color: "#a78bfa" },
            { label: "Org. Readiness",value: sim.organizationalReadiness, color: "#fbbf24" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-[10px]" style={{ color: "rgba(255,255,255,0.28)" }}>
              {label}{" "}
              <span className="font-black" style={{ color }}>{Math.round(value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG network */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: "480px" }}>
        <defs>
          <filter id="eco-glow-red" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="eco-glow-node" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <style>{`
            @keyframes ecoFlow  { from{stroke-dashoffset:32}  to{stroke-dashoffset:0}  }
            @keyframes ecoFlowS { from{stroke-dashoffset:20}  to{stroke-dashoffset:0}  }
            @keyframes ecoPulse { 0%,100%{opacity:.45} 50%{opacity:1} }
            @keyframes ecoOrbit { 0%{stroke-dashoffset:0} 100%{stroke-dashoffset:-440} }
          `}</style>
        </defs>

        {/* Subtle ring guides */}
        <circle cx={CX} cy={CY} r={R2 + 32} fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
        <circle cx={CX} cy={CY} r={R2}      fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
        <circle cx={CX} cy={CY} r={R1 + 18} fill="none" stroke="rgba(255,255,255,0.03)"  strokeWidth="1" />
        <circle cx={CX} cy={CY} r={78}       fill="none" stroke="rgba(255,48,48,0.07)"    strokeWidth="1" />

        {/* Orbiting dash ring when launched */}
        {launchClosed && (
          <circle cx={CX} cy={CY} r={R2 + 22} fill="none" stroke="#FF3030"
            strokeWidth="1.5" strokeDasharray="12 8" opacity="0.18"
            style={{ animation: "ecoOrbit 18s linear infinite" }}
          />
        )}

        {/* ── Edges ── */}
        {edges.map((e) => {
          const a = clamp01(e.activation);
          const opacity = e.main ? 0.08 + a * 0.55 : 0.04 + a * 0.38;
          const [r, g, b] = hexRgbArr(e.color);
          const stroke = `rgba(${r},${g},${b},${opacity})`;
          const dashArr = e.main ? "9 6" : a > 0.5 ? "5 5" : "3 8";
          const dur = `${0.7 + (1 - a) * 2.3}s`;
          const anim = a > 0.2 ? `ecoFlow ${dur} linear infinite` : undefined;

          return (
            <line
              key={e.idx}
              x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke={stroke}
              strokeWidth={e.main ? 1.5 : 0.7}
              strokeDasharray={dashArr}
              style={anim ? { animation: anim, animationDelay: `${(e.idx * 0.13) % 2}s` } : undefined}
            />
          );
        })}

        {/* ── Outer nodes ── */}
        {outerNodes.map((node, i) => {
          const a = clamp01(node.activation);
          const [r, g, b] = hexRgbArr(node.color);
          return (
            <g key={node.id}
              style={{ animation: `ecoPulse ${2.2 + (i % 4) * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.22}s` }}>
              <circle cx={node.x} cy={node.y} r={node.r}
                fill={`rgba(${r},${g},${b},${0.04 + a * 0.1})`}
                stroke={node.color}
                strokeWidth="0.8"
                opacity={0.25 + a * 0.75}
              />
              <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="middle"
                fontSize="6.5" fontFamily="system-ui,sans-serif" fontWeight="700"
                fill="white" opacity={0.35 + a * 0.65}
              >
                {node.label}
              </text>
            </g>
          );
        })}

        {/* ── Pillar nodes ── */}
        {pillarNodes.map((node, i) => {
          const a = clamp01(act[node.id]);
          const pct = Math.round(a * 100);
          const [r, g, b] = hexRgbArr(node.color);
          return (
            <g key={node.id} filter="url(#eco-glow-node)"
              style={{ animation: `ecoPulse ${2.8 + (i % 3) * 0.6}s ease-in-out infinite`, animationDelay: `${i * 0.4}s` }}>
              {/* Outer glow halo */}
              <circle cx={node.x} cy={node.y} r={node.r + 9}
                fill="none" stroke={node.color} strokeWidth="1"
                opacity={a * 0.22}
              />
              {/* Main body */}
              <circle cx={node.x} cy={node.y} r={node.r}
                fill={`rgba(${r},${g},${b},${0.06 + a * 0.17})`}
                stroke={node.color}
                strokeWidth={1 + a * 1.5}
                opacity={0.45 + a * 0.55}
              />
              {/* Label */}
              <text x={node.x} y={node.y - 5} textAnchor="middle" dominantBaseline="middle"
                fontSize="8.5" fontFamily="system-ui,sans-serif" fontWeight="900"
                fill="white" opacity={0.55 + a * 0.45}
              >
                {node.label.toUpperCase()}
              </text>
              {node.sub && (
                <text x={node.x} y={node.y + 5} textAnchor="middle" dominantBaseline="middle"
                  fontSize="6.5" fontFamily="system-ui,sans-serif" fontWeight="600"
                  fill={node.color} opacity={0.75}
                >
                  {node.sub}
                </text>
              )}
              <text x={node.x} y={node.y + 17} textAnchor="middle" dominantBaseline="middle"
                fontSize="8" fontFamily="system-ui,sans-serif" fontWeight="900"
                fill={node.color} opacity={0.9}
              >
                {pct}%
              </text>
            </g>
          );
        })}

        {/* ── Center node ── */}
        <g filter="url(#eco-glow-red)">
          <circle cx={CX} cy={CY} r={62} fill="rgba(255,48,48,0.03)" stroke="rgba(255,48,48,0.1)" strokeWidth="1" />
          <circle cx={CX} cy={CY} r={38} fill="rgba(255,48,48,0.15)" stroke="#FF3030" strokeWidth="2.5" />
          <text x={CX} y={CY - 6} textAnchor="middle" dominantBaseline="middle"
            fontSize="11" fontFamily="Anton,system-ui,sans-serif" fontWeight="900"
            fill="#FF3030" style={{ letterSpacing: "1.5px" }}
          >
            CEFALIX
          </text>
          <text x={CX} y={CY + 8} textAnchor="middle" dominantBaseline="middle"
            fontSize="8.5" fontFamily="system-ui,sans-serif"
            fill="rgba(255,255,255,0.4)"
          >
            {currentYear}
          </text>
          {launchClosed && (
            <text x={CX} y={CY + 21} textAnchor="middle" dominantBaseline="middle"
              fontSize="7" fontFamily="system-ui,sans-serif" fontWeight="700"
              fill="#FF3030" style={{ letterSpacing: "1px" }}
            >
              LAUNCHED ✓
            </text>
          )}
        </g>
      </svg>

      {/* Legend bar */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {pillarNodes.map(n => {
          const a = clamp01(act[n.id]);
          return (
            <div key={n.id} className="flex items-center gap-1.5 text-[10px]">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: n.color, opacity: 0.4 + a * 0.6 }} />
              <span style={{ color: "rgba(255,255,255,0.3)" }}>{n.label}</span>
              <span className="font-black" style={{ color: n.color }}>{Math.round(a * 100)}%</span>
            </div>
          );
        })}
        <div className="ml-auto text-[9px]" style={{ color: "rgba(255,255,255,0.12)" }}>
          Datos en tiempo real · simulador Cefalix
        </div>
      </div>
    </div>
  );
}
