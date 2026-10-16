import type { ReactNode } from "react";
import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "./kit";

/**
 * The expertise page's three practice loops: motion design, no footage and no words, so one
 * render serves both languages. Each loop lasts nine seconds in three acts of three, the
 * order of the practice's caption on the page (expertise-loops.js lights the caption in turn):
 *   network  — Réseau / Contrôles / Résilience
 *   compute  — Capacité / Hébergement / Observabilité
 *   data     — Données / Modèles / Production
 * Every motion is periodic over the loop, so its last frame leads back into its first.
 */
export const PRACTICE_SECONDS = 9;
export const PRACTICE_SIZE = { width: 1200, height: 900 } as const;
export const PRACTICES = ["network", "compute", "data"] as const;
export type Practice = (typeof PRACTICES)[number];

const C = {
  night: "#07172a",
  deep: "#0b2340",
  idle: "#1f4168",
  blue: "#2f86ff",
  light: "#7ab8ff",
  white: "#e9f2ff",
  grey: "#8d97a4",
  threat: "#ff5d5d",
};

type P = [number, number];
const ramp = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const smooth = Easing.inOut(Easing.cubic);
/** Rises over [a, b], holds, falls over [c, d]. */
const span = (t: number, a: number, b: number, c: number, d: number) => Math.min(smooth(ramp(t, a, b)), 1 - smooth(ramp(t, c, d)));
const wrap = (x: number, period = PRACTICE_SECONDS) => ((x % period) + period) % period;
/** A loop-safe wave: whole cycles per loop only. */
const wave = (t: number, cycles: number, phase = 0) => Math.sin((2 * Math.PI * cycles * t) / PRACTICE_SECONDS + phase);
const mix = (a: string, b: string, x: number) => {
  const pa = a.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  const pb = b.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * clamp(x))).join(",")})`;
};
const hash = (n: number) => wrap(Math.sin(n * 127.1 + 311.7) * 43758.5453, 1);

/** A point at fraction `u` of a polyline's length. */
function along(points: P[], u: number): P {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  let rest = clamp(u) * lengths.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (rest <= lengths[i] || i === lengths.length - 1) {
      const k = lengths[i] ? rest / lengths[i] : 0;
      return [points[i][0] + (points[i + 1][0] - points[i][0]) * k, points[i][1] + (points[i + 1][1] - points[i][1]) * k];
    }
    rest -= lengths[i];
  }
  return points[points.length - 1];
}
const line = (points: P[]) => points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");

function useSeconds() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
}

/** The navy surface: a faint dot grid and a vignette, as the page's diagram surfaces. */
function Stage({ children }: { children: ReactNode }) {
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <svg viewBox="0 0 1200 900" width="100%" height="100%">
        <defs>
          <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="15" cy="15" r="1.4" fill={C.light} opacity="0.12" />
          </pattern>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="55%" stopColor={C.night} stopOpacity="0" />
            <stop offset="100%" stopColor="#020a14" stopOpacity="0.85" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <rect width="1200" height="900" fill="url(#dots)" />
        {children}
        <rect width="1200" height="900" fill="url(#vignette)" pointerEvents="none" />
      </svg>
    </AbsoluteFill>
  );
}

function Packet({ at, color = C.light, size = 7, opacity = 1 }: { at: P; color?: string; size?: number; opacity?: number }) {
  return (
    <g opacity={opacity}>
      <circle cx={at[0]} cy={at[1]} r={size * 2.4} fill={color} opacity={0.35} filter="url(#glow)" />
      <circle cx={at[0]} cy={at[1]} r={size} fill={color} />
    </g>
  );
}

/* ---------------------------------------------------------------- Networks & cybersecurity */

const N: Record<string, P> = { E: [150, 450], F: [350, 450], C1: [590, 280], C2: [590, 620], S1: [930, 170], S2: [990, 450], S3: [930, 730] };
const LINKS = [["E", "F"], ["F", "C1"], ["F", "C2"], ["C1", "C2"], ["C1", "S2"], ["C2", "S2"], ["C2", "S3"], ["S1", "S2"], ["S2", "S3"]];
const ROUTES = [
  { offset: 0, path: ["E", "F", "C1", "S1"], detour: ["E", "F", "C1", "S2", "S1"] },
  { offset: 0.25, path: ["E", "F", "C2", "S3"] },
  { offset: 0.5, path: ["E", "F", "C1", "S2"] },
  { offset: 0.75, path: ["E", "F", "C2", "S2"] },
];
const TRAVEL = 3;

function Globe({ at, threat }: { at: P; threat: number }) {
  const [x, y] = at;
  const stroke = mix(C.light, C.threat, threat);
  return (
    <g stroke={stroke} strokeWidth="3" fill="none">
      <circle cx={x} cy={y} r="52" fill={C.deep} />
      <ellipse cx={x} cy={y} rx="22" ry="52" />
      <path d={`M${x - 52} ${y}H${x + 52}M${x - 45} ${y - 26}H${x + 45}M${x - 45} ${y + 26}H${x + 45}`} opacity="0.6" />
    </g>
  );
}

function Shield({ at, flash }: { at: P; flash: number }) {
  const [x, y] = at;
  const d = `M${x} ${y - 66}L${x + 54} ${y - 46}V${y + 6}C${x + 54} ${y + 42} ${x + 28} ${y + 62} ${x} ${y + 76}C${x - 28} ${y + 62} ${x - 54} ${y + 42} ${x - 54} ${y + 6}V${y - 46}Z`;
  return (
    <g>
      <path d={d} fill={C.blue} opacity={0.25 + 0.6 * flash} filter="url(#glow)" />
      <path d={d} fill={mix("0f3a73", "2f86ff", flash * 0.7)} stroke={C.light} strokeWidth="3.5" strokeLinejoin="round" />
      <rect x={x - 17} y={y - 2} width="34" height="28" rx="5" fill={C.white} />
      <path d={`M${x - 10} ${y - 2}v-10a10 10 0 0 1 20 0v10`} fill="none" stroke={C.white} strokeWidth="5" />
    </g>
  );
}

function Switch({ at, glow }: { at: P; glow: number }) {
  const [x, y] = at;
  return (
    <g>
      <rect x={x - 58} y={y - 34} width="116" height="68" rx="14" fill={C.blue} opacity={glow * 0.5} filter="url(#glow)" />
      <rect x={x - 58} y={y - 34} width="116" height="68" rx="14" fill={C.deep} stroke={C.light} strokeWidth="3" />
      <path d={`M${x - 30} ${y - 10}h52m-12 -9 12 9-12 9M${x + 30} ${y + 12}h-52m12 -9-12 9 12 9`} fill="none" stroke={C.light} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function Server({ at, t, seed }: { at: P; t: number; seed: number }) {
  const [x, y] = at;
  return (
    <g>
      <rect x={x - 46} y={y - 56} width="92" height="112" rx="12" fill={C.deep} stroke={C.light} strokeWidth="3" />
      {[0, 1, 2].map((row) => (
        <g key={row}>
          <rect x={x - 32} y={y - 40 + row * 32} width="64" height="20" rx="4" fill={C.idle} />
          <circle cx={x + 22} cy={y - 30 + row * 32} r="4" fill={C.light} opacity={0.45 + 0.55 * Math.abs(wave(t, 9 + row * 3 + seed, seed + row))} />
        </g>
      ))}
    </g>
  );
}

export function NetworkLoop() {
  const t = useSeconds();
  // Act 3: the link from the upper core to the upper site fails, traffic takes the detour,
  // then the link is restored before the loop closes.
  const broken = Math.min(smooth(ramp(t, 6, 6.4)), 1 - smooth(ramp(t, 8.3, 8.9)));
  // Act 2: an intrusion leaves the outside, meets the firewall and is stopped.
  const threatU = smooth(ramp(t, 3.2, 4.3));
  const threatOn = t >= 3.2 && t < 4.35;
  const impact = ramp(t, 4.3, 5.2);
  const flash = span(t, 4.25, 4.35, 4.6, 5.4);
  const [c1, s1] = [N.C1, N.S1];
  const mid: P = [(c1[0] + s1[0]) / 2, (c1[1] + s1[1]) / 2];
  const gap = 0.07 * broken;
  return (
    <Stage>
      {LINKS.map(([a, b]) => (
        <line key={a + b} x1={N[a][0]} y1={N[a][1]} x2={N[b][0]} y2={N[b][1]} stroke={C.idle} strokeWidth="4" strokeLinecap="round" />
      ))}
      {/* The link that fails, opened from its middle. */}
      <g stroke={mix("1f4168", "ff5d5d", broken)} strokeWidth="4" strokeLinecap="round">
        <line x1={c1[0]} y1={c1[1]} x2={c1[0] + (mid[0] - c1[0]) * (1 - gap * 2)} y2={c1[1] + (mid[1] - c1[1]) * (1 - gap * 2)} />
        <line x1={s1[0]} y1={s1[1]} x2={s1[0] + (mid[0] - s1[0]) * (1 - gap * 2)} y2={s1[1] + (mid[1] - s1[1]) * (1 - gap * 2)} />
      </g>
      <path d={`M${mid[0] - 13} ${mid[1] - 13}l26 26m0 -26-26 26`} stroke={C.threat} strokeWidth="5" strokeLinecap="round" opacity={broken} />
      <circle cx={mid[0]} cy={mid[1]} r={10 + 40 * ramp(t, 6, 6.7)} fill="none" stroke={C.threat} strokeWidth="3" opacity={(1 - ramp(t, 6, 6.7)) * (t >= 6 ? 1 : 0)} />
      {/* The detour, lit while it carries the traffic. */}
      <path d={line([N.C1, N.S2, N.S1])} fill="none" stroke={C.light} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity={0.55 * broken} />
      <path d={line([N.C1, N.S2, N.S1])} fill="none" stroke={C.light} strokeWidth="14" opacity={0.25 * broken} filter="url(#glow)" />

      {ROUTES.flatMap((route, r) =>
        Array.from({ length: 9 }, (_, k) => {
          const spawn = k + route.offset;
          const age = wrap(t - spawn);
          if (age >= TRAVEL) return null;
          const detour = route.detour && spawn >= 4 && spawn < 8;
          const path = (detour ? route.detour! : route.path).map((key) => N[key]);
          const fade = Math.min(1, age / 0.2, (TRAVEL - age) / 0.2);
          return <Packet key={`${r}-${k}`} at={along(path, age / TRAVEL)} opacity={fade} />;
        }),
      )}

      {threatOn && <Packet at={along([N.E, N.F], threatU)} color={C.threat} size={9} />}
      {impact > 0 && impact < 1 && (
        <g opacity={1 - impact}>
          <circle cx={N.F[0]} cy={N.F[1]} r={70 + 90 * impact} fill="none" stroke={C.threat} strokeWidth="4" />
          {Array.from({ length: 8 }, (_, i) => {
            const angle = Math.PI * (0.6 + (0.8 * i) / 7);
            const reach = 40 + 110 * Easing.out(Easing.quad)(impact);
            return <circle key={i} cx={N.F[0] - 30 + Math.cos(angle) * reach} cy={N.F[1] + Math.sin(angle) * reach} r={5 * (1 - impact) + 1} fill={C.threat} />;
          })}
        </g>
      )}

      <Globe at={N.E} threat={span(t, 3, 3.3, 4.2, 4.8)} />
      <Shield at={N.F} flash={flash} />
      <Switch at={N.C1} glow={span(t, 0.2, 0.7, 2.4, 3) * 0.6 + broken * 0.6} />
      <Switch at={N.C2} glow={span(t, 0.2, 0.7, 2.4, 3) * 0.6} />
      <Server at={N.S1} t={t} seed={1} />
      <Server at={N.S2} t={t} seed={2} />
      <Server at={N.S3} t={t} seed={3} />
    </Stage>
  );
}

/* ---------------------------------------------------------------- AI infrastructure & cloud HPC */

const RACKS = [355, 470, 585, 700];
const SLOT = { top: 300, pitch: 46, height: 34, width: 88, rows: 8 };
const ZONE = { x: 300, y: 225, w: 510, h: 560 };
const PANEL = { x: 870, y: 250, w: 270, h: 400 };

/** Slot n lights once, in a scattered order; four stay free: capacity is planned, not maxed. */
const lit = (t: number, n: number) => (hash(n) < 0.875 ? ramp(t, 0.3 + hash(n + 50) * 2.3, 0.55 + hash(n + 50) * 2.3) : 0);

function Workload({ at, opacity }: { at: P; opacity: number }) {
  const [x, y] = at;
  return (
    <g opacity={opacity}>
      <path d={`M${x} ${y - 22}l20 11v24l-20 11-20-11v-24z`} fill={C.blue} />
      <path d={`M${x} ${y - 22}l20 11-20 11-20-11z`} fill={C.light} />
      <path d={`M${x} ${y}v24`} stroke={C.night} strokeWidth="2" opacity="0.4" />
    </g>
  );
}

function Spark({ x, y, w, h, t, seed, draw }: { x: number; y: number; w: number; h: number; t: number; seed: number; draw: number }) {
  const points: P[] = Array.from({ length: 41 }, (_, i) => {
    const s = i / 40;
    const v = 0.5 + 0.22 * Math.sin(seed * 3 + s * 9 + (2 * Math.PI * 2 * t) / PRACTICE_SECONDS) + 0.14 * Math.sin(seed + s * 23 - (2 * Math.PI * 3 * t) / PRACTICE_SECONDS);
    return [x + s * w, y + h - v * h];
  });
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" fill={C.night} opacity="0.6" />
      <clipPath id={`spark-${seed}`}><rect x={x} y={y - 4} width={w * draw} height={h + 8} /></clipPath>
      <path d={line(points)} fill="none" stroke={C.light} strokeWidth="3" strokeLinejoin="round" clipPath={`url(#spark-${seed})`} />
      <line x1={x} x2={x + w} y1={y + h * 0.2} y2={y + h * 0.2} stroke={C.grey} strokeWidth="1.5" strokeDasharray="5 6" opacity={draw * 0.6} />
    </g>
  );
}

export function ComputeLoop() {
  const t = useSeconds();
  const reset = 1 - smooth(ramp(t, 8.4, 9));
  const zone = smooth(ramp(t, 3, 3.9)) * reset;
  const lock = Easing.out(Easing.back(1.6))(ramp(t, 3.8, 4.2)) * reset;
  const panel = smooth(ramp(t, 6, 6.5)) * reset;
  const perimeter = 2 * (ZONE.w + ZONE.h);
  const used = Array.from({ length: 32 }, (_, n) => lit(t, n)).reduce((a, b) => a + b, 0) / 32;
  return (
    <Stage>
      {/* The sovereign hosting perimeter, drawn in act 2. */}
      <rect x={ZONE.x} y={ZONE.y} width={ZONE.w} height={ZONE.h} rx="28" fill={C.blue} opacity={0.06 * zone} />
      <rect x={ZONE.x} y={ZONE.y} width={ZONE.w} height={ZONE.h} rx="28" fill="none" stroke={C.light} strokeWidth="3"
        strokeDasharray={`${perimeter * zone} ${perimeter}`} pathLength={perimeter} />
      <g transform={`translate(${ZONE.x + ZONE.w / 2} ${ZONE.y}) scale(${lock})`}>
        <circle r="34" fill={C.night} stroke={C.light} strokeWidth="3" />
        <rect x="-14" y="-4" width="28" height="22" rx="4" fill={C.white} />
        <path d="M-8 -4v-8a8 8 0 0 1 16 0v8" fill="none" stroke={C.white} strokeWidth="4" />
      </g>

      {RACKS.map((x, r) => (
        <g key={x}>
          <rect x={x - 8} y={SLOT.top - 22} width={SLOT.width + 16} height={SLOT.rows * SLOT.pitch + 30} rx="10" fill={C.deep} stroke={C.idle} strokeWidth="3" />
          {Array.from({ length: SLOT.rows }, (_, j) => {
            const n = r * SLOT.rows + j;
            const on = lit(t, n) * reset;
            const y = SLOT.top + j * SLOT.pitch - 8;
            return (
              <g key={j}>
                <rect x={x} y={y} width={SLOT.width} height={SLOT.height} rx="5" fill={mix("1f4168", "2f86ff", on)} />
                {on > 0 && <rect x={x} y={y} width={SLOT.width} height={SLOT.height} rx="5" fill={C.blue} opacity={0.5 * on} filter="url(#glow)" />}
                {[0, 1, 2, 3].map((k) => (
                  <rect key={k} x={x + 10 + k * 18} y={y + 9} width="10" height="16" rx="2" fill={C.white}
                    opacity={on * (0.35 + 0.45 * Math.abs(wave(t, 7 + ((n + k) % 5), n + k)))} />
                ))}
              </g>
            );
          })}
        </g>
      ))}
      {/* Capacity in use, under the racks. */}
      <rect x={RACKS[0] - 8} y={SLOT.top + SLOT.rows * SLOT.pitch + 22} width={RACKS[3] - RACKS[0] + SLOT.width + 16} height="12" rx="6" fill={C.idle} />
      <rect x={RACKS[0] - 8} y={SLOT.top + SLOT.rows * SLOT.pitch + 22} width={(RACKS[3] - RACKS[0] + SLOT.width + 16) * used * reset} height="12" rx="6" fill={C.light} />

      {/* Act 2: workloads queue outside, then move into the perimeter. */}
      {Array.from({ length: 5 }, (_, i) => {
        const start: P = [150, 300 + i * 100];
        const end: P = [RACKS[i % 4] + SLOT.width / 2, SLOT.top + ((i * 3) % 8) * SLOT.pitch + 9];
        const move = smooth(ramp(t, 3.6 + i * 0.35, 4.6 + i * 0.35));
        const visible = smooth(ramp(t, 3, 3.4)) * (1 - ramp(move, 0.85, 1));
        return <Workload key={i} at={[start[0] + (end[0] - start[0]) * move, start[1] + (end[1] - start[1]) * move]} opacity={visible} />;
      })}

      {/* Act 3: telemetry rises from the racks into the observability panel. */}
      {panel > 0.01 && Array.from({ length: 12 }, (_, i) => {
        const from: P = [RACKS[i % 4] + SLOT.width / 2, SLOT.top + (i % 6) * SLOT.pitch * 1.3];
        const to: P = [PANEL.x + 20, PANEL.y + 60 + (i % 3) * 120];
        const age = wrap(t - 6.2 - i * 0.12, 1.1) / 1.1;
        return <Packet key={i} at={[from[0] + (to[0] - from[0]) * age, from[1] + (to[1] - from[1]) * age - Math.sin(age * Math.PI) * 50]} size={4} opacity={panel * Math.min(1, age * 5, (1 - age) * 5)} />;
      })}
      <g opacity={panel} transform={`translate(${(1 - panel) * 40} 0)`}>
        <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx="20" fill={C.deep} stroke={C.light} strokeWidth="3" />
        {[0, 1, 2].map((row) => (
          <g key={row}>
            <rect x={PANEL.x + 24} y={PANEL.y + 28 + row * 120} width={70 - row * 14} height="10" rx="5" fill={C.grey} opacity="0.6" />
            <Spark x={PANEL.x + 24} y={PANEL.y + 50 + row * 120} w={PANEL.w - 48} h={62} t={t} seed={row + 1} draw={smooth(ramp(t, 6.3 + row * 0.25, 7.5 + row * 0.25))} />
          </g>
        ))}
      </g>
    </Stage>
  );
}

/* ---------------------------------------------------------------- Data & MLOps */

const SOURCES: P[] = [[130, 270], [130, 450], [130, 630]];
const TABLE = { x: 320, y: 340, w: 150, h: 220 };
const LAYERS: P[][] = [
  [340, 450, 560].map((y) => [600, y] as P),
  [290, 395, 505, 610].map((y) => [730, y] as P),
  [395, 505].map((y) => [860, y] as P),
];
const SERVICE = { x: 975, y: 365, w: 160, h: 170 };

function Cylinder({ at, lit }: { at: P; lit: number }) {
  const [x, y] = at;
  return (
    <g stroke={mix("7ab8ff", "e9f2ff", lit)} strokeWidth="3">
      <path d={`M${x - 48} ${y - 34}v68a48 15 0 0 0 96 0v-68`} fill={C.deep} />
      <ellipse cx={x} cy={y - 34} rx="48" ry="15" fill={mix("0b2340", "2f86ff", lit * 0.6)} />
      <path d={`M${x - 48} ${y}a48 15 0 0 0 96 0`} fill="none" opacity="0.6" />
    </g>
  );
}

export function DataLoop() {
  const t = useSeconds();
  const reset = 1 - smooth(ramp(t, 8.5, 9));
  const act1 = span(t, 0, 0.4, 2.6, 3.2);
  const ship = smooth(ramp(t, 6, 6.7));
  const live = smooth(ramp(t, 6.6, 7)) * reset;
  const retrain = smooth(ramp(t, 7.4, 8.2)) * reset;
  const edges = LAYERS.slice(1).flatMap((layer, l) => layer.flatMap((b) => LAYERS[l].map((a) => [a, b] as [P, P])));
  // Act 2: activation waves cross the network, left to right.
  const front = 560 + wrap(t - 3, 1) * 360;
  const learning = span(t, 3, 3.3, 5.7, 6.1);
  const heat = (x: number) => learning * Math.exp(-(((x - front) / 60) ** 2));
  const accuracy: P[] = Array.from({ length: 31 }, (_, i) => [585 + i * 10, 725 - 60 * (1 - Math.exp(-i / 7))]);
  return (
    <Stage>
      {/* Act 1: the sources stream into one prepared table. */}
      {SOURCES.flatMap((source, s) =>
        Array.from({ length: 27 }, (_, k) => {
          const age = wrap(t - k / 3 - s * 0.11, 1);
          const target: P = [TABLE.x, TABLE.y + 60 + s * 50];
          const at = along([[source[0] + 50, source[1]], [235, source[1] + (target[1] - source[1]) * 0.3], target], age);
          return k % 3 === 0 ? null : <Packet key={`${s}-${k}`} at={at} size={4.5} opacity={(0.45 + 0.55 * act1) * Math.min(1, age * 6, (1 - age) * 6)} />;
        }),
      )}
      {SOURCES.map((source, s) => <Cylinder key={s} at={source} lit={act1 * (0.5 + 0.5 * Math.abs(wave(t, 3, s)))} />)}
      <rect x={TABLE.x} y={TABLE.y} width={TABLE.w} height={TABLE.h} rx="16" fill={C.deep} stroke={C.light} strokeWidth="3" />
      {Array.from({ length: 5 }, (_, row) => {
        const fill = smooth(ramp(t, 0.4 + row * 0.45, 0.9 + row * 0.45)) * reset;
        return [0, 1, 2].map((col) => (
          <rect key={`${row}-${col}`} x={TABLE.x + 16 + col * 42} y={TABLE.y + 20 + row * 40} width={34 * fill} height="22" rx="4" fill={col ? C.idle : C.blue} opacity={0.4 + 0.6 * fill} />
        ));
      })}
      {/* The table feeds the model. */}
      {Array.from({ length: 6 }, (_, k) => {
        const age = wrap(t - k / 6, 1);
        return <Packet key={k} at={along([[TABLE.x + TABLE.w, 450], [LAYERS[0][1][0] - 26, 450]], age)} size={4} opacity={0.3 + 0.7 * learning} />;
      })}

      {/* Act 2: the model learns. */}
      {edges.map(([a, b], i) => (
        <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={mix("1f4168", "7ab8ff", heat((a[0] + b[0]) / 2) + 0.15 * live)} strokeWidth={2 + 2 * heat((a[0] + b[0]) / 2)} />
      ))}
      {LAYERS.flat().map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="30" fill={C.blue} opacity={heat(x) * 0.8} filter="url(#glow)" />
          <circle cx={x} cy={y} r="22" fill={mix("0b2340", "2f86ff", heat(x) + 0.3 * live)} stroke={C.light} strokeWidth="3" />
        </g>
      ))}
      <path d={line(accuracy)} fill="none" stroke={C.light} strokeWidth="4" strokeLinecap="round" strokeDasharray="400" strokeDashoffset={400 * (1 - smooth(ramp(t, 3.2, 5.6)) * reset)} />
      <path d="M585 660v65h300" fill="none" stroke={C.idle} strokeWidth="3" />

      {/* Act 3: the trained model ships to a monitored service, then feeds retraining. */}
      {ship > 0 && ship < 1 && (
        <g transform={`translate(${880 + (SERVICE.x + 50 - 880) * ship} ${450 - Math.sin(ship * Math.PI) * 60})`}>
          <rect x="-20" y="-20" width="40" height="40" rx="8" fill={C.light} />
          <circle r="7" fill={C.night} />
        </g>
      )}
      <rect x={SERVICE.x - 10} y={SERVICE.y - 10} width={SERVICE.w + 20} height={SERVICE.h + 20} rx="26" fill={C.blue} opacity={0.4 * live} filter="url(#glow)" />
      <rect x={SERVICE.x} y={SERVICE.y} width={SERVICE.w} height={SERVICE.h} rx="20" fill={C.deep} stroke={C.light} strokeWidth="3" />
      <circle cx={SERVICE.x + 28} cy={SERVICE.y + 28} r="8" fill={mix("1f4168", "7ab8ff", live)} />
      {[0, 1, 2].map((row) => <rect key={row} x={SERVICE.x + 24} y={SERVICE.y + 60 + row * 30} width={(112 - row * 26) * (0.25 + 0.75 * live)} height="12" rx="6" fill={row ? C.idle : C.blue} />)}
      {live > 0.01 && Array.from({ length: 4 }, (_, k) => {
        const age = wrap(t - k * 0.25, 1);
        const y = SERVICE.y + 40 + k * 30;
        const out = age < 0.5;
        const x = out ? 1185 - (1185 - SERVICE.x - SERVICE.w) * (age * 2) : SERVICE.x + SERVICE.w + (1185 - SERVICE.x - SERVICE.w) * (age * 2 - 1);
        return <Packet key={k} at={[x, y + (out ? 0 : 12)]} size={4} color={out ? C.white : C.light} opacity={live * Math.min(1, Math.abs(age - 0.5) * 10 + 0.2)} />;
      })}
      {/* Monitoring: a heartbeat under the service. */}
      <clipPath id="beat"><rect x={SERVICE.x - 10} y="580" width={(SERVICE.w + 20) * live} height="80" /></clipPath>
      <path clipPath="url(#beat)" fill="none" stroke={C.light} strokeWidth="3.5" strokeLinejoin="round"
        d={line(Array.from({ length: 46 }, (_, i) => {
          const x = SERVICE.x - 10 + i * 4;
          const phase = wrap(i / 15 - (t * 4) / 3, 1);
          const y = 620 - (phase > 0.45 && phase < 0.5 ? 30 : phase >= 0.5 && phase < 0.55 ? -22 : 0);
          return [x, y] as P;
        }))} />
      {/* The MLOps loop: production feeds the next training. */}
      <path d={`M${SERVICE.x + SERVICE.w / 2} ${SERVICE.y + SERVICE.h + 110}C${SERVICE.x + SERVICE.w / 2} 900 ${TABLE.x + TABLE.w / 2} 900 ${TABLE.x + TABLE.w / 2} ${TABLE.y + TABLE.h + 16}`}
        fill="none" stroke={C.light} strokeWidth="3.5" strokeDasharray="10 10" pathLength="1000" strokeDashoffset={0}
        style={{ clipPath: `inset(0 0 0 ${(1 - retrain) * 100}%)` }} opacity={retrain} />
      <path d={`M${TABLE.x + TABLE.w / 2 - 12} ${TABLE.y + TABLE.h + 30}l12 -16 12 16`} fill="none" stroke={C.light} strokeWidth="3.5" opacity={ramp(retrain, 0.9, 1)} />
    </Stage>
  );
}

export const PRACTICE_LOOPS = { network: NetworkLoop, compute: ComputeLoop, data: DataLoop } satisfies Record<Practice, () => ReactNode>;
