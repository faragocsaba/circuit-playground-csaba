import { analyze, combination, instant, type CircuitSettings } from '@/lib/circuit-model';
import { coilFace, inducedCurrent, type LenzSettings } from '@/lib/lenz-model';

type Point = [number, number];
function along(points: Point[], progress: number) {
  const segs = points.slice(1).map((end, i) => { const start = points[i]!; return { start, end, length: Math.hypot(end[0] - start[0], end[1] - start[1]) }; });
  let distance = progress * segs.reduce((s, x) => s + x.length, 0);
  for (const { start, end, length } of segs) {
    if (distance <= length) { const r = distance / length; return { cx: start[0] + r * (end[0] - start[0]), cy: start[1] + r * (end[1] - start[1]) }; }
    distance -= length;
  }
  return { cx: points[0]![0], cy: points[0]![1] };
}
const coil = (x: number, y: number, turns: number, r: number, vertical: boolean) =>
  `M${x} ${y}` + Array.from({ length: turns }, () => vertical ? ` a${r} ${r} 0 1 1 0 ${2 * r}` : ` a${r} ${r} 0 1 1 ${2 * r} 0`).join('');

const loop: Point[] = [[150, 155], [150, 90], [560, 90], [560, 300], [150, 300], [150, 235]];

/** Series AC circuit; each of R, L, C is drawn as a symbol when switched in, a plain wire when out. */
export function CombinedCircuit({ settings, time, motion }: { settings: CircuitSettings; time: number; motion: number }) {
  const a = analyze(settings);
  const now = instant(settings, a, time);
  const count = Math.abs(now.current) > 0.5 ? Math.min(14, Math.max(4, Math.ceil(Math.abs(now.current) / 25))) : 0;
  const fieldStrength = Math.min(1, Math.abs(now.current) / Math.max(1, a.peakCurrent));
  return <svg className="circuit-svg" viewBox="0 0 720 390" role="img" aria-label={`Series ${combination(settings)} AC circuit, current ${now.current.toFixed(1)} milliamps`}>
    <path d="M150 155V90H560V300H150V235" className="wire" />
    <circle cx="150" cy="195" r="40" className="symbol" />
    <path d="M125 195q12-28 25 0t25 0" className="symbol" />
    <text x="40" y="140">AC SOURCE</text><text x="40" y="264">{now.source.toFixed(2)} V</text>
    {settings.useR ? <>
      <rect x="320" y="77" width="100" height="26" fill="var(--card)" />
      <path d="M320 90h10l6-10 12 20 12-20 12 20 12-20 12 20 6-10h18" className="wire" />
      <text x="330" y="64">R · {settings.resistance.toFixed(0)} Ω</text>
      <text x="330" y="126" className="font-mono">{a.vR.toFixed(2)} V</text>
    </> : <text x="330" y="64" opacity={0.55}>R bypassed</text>}
    {settings.useL ? <>
      <rect x="545" y="148" width="50" height="94" fill="var(--card)" />
      {[0, 1, 2].map(k => <ellipse key={k} cx="572" cy="195" rx={34 + k * 18} ry={60 + k * 14} className="capacitor-field" fill="none" opacity={fieldStrength * (1 - k * 0.28)} />)}
      <path d={coil(560, 150, 4, 11, true)} className="symbol" fill="none" />
      <path d="M560 238V242" className="wire" />
      <text x="655" y="182">L</text><text x="655" y="207">{settings.inductance} H</text>
      <text x="655" y="250" className="font-mono">{a.vL.toFixed(2)} V</text>
    </> : <text x="600" y="130" opacity={0.55}>L bypassed</text>}
    {settings.useC ? <>
      <rect x="340" y="280" width="32" height="40" fill="var(--card)" />
      <path d="M350 272V328M362 272V328" className="symbol" />
      <text x="330" y="350">C · {settings.capacitance} µF · {a.vC.toFixed(2)} V</text>
    </> : <text x="330" y="350" opacity={0.55}>C bypassed</text>}
    {Array.from({ length: count }, (_, i) => <circle key={i} r="3.5" className="current-particle" {...along(loop, ((motion / 3 + i / count) % 1 + 1) % 1)} />)}
    <text x="250" y="200" className="current-text">I = {now.current.toFixed(1)} mA</text>
  </svg>;
}

/** Phasor diagram: current along +x; vR in phase, vL leads 90°, vC lags 90°; their sum is the source. */
export function PhasorDiagram({ settings, time }: { settings: CircuitSettings; time: number }) {
  const a = analyze(settings);
  const cx = 195, cy = 195, maxLen = 130;
  const maxV = Math.max(1e-9, settings.voltage, a.vR, a.vL, a.vC);
  const scale = maxLen / maxV;
  const w = 2 * Math.PI * settings.frequency;
  const ang = w * time; // current reference rotates with time
  const vec = (len: number, deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + len * Math.cos(rad), y: cy - len * Math.sin(rad) };
  };
  const lead = a.phase;
  const iEnd = vec(52, (ang * 180) / Math.PI);
  const rEnd = vec(a.vR * scale, (ang * 180) / Math.PI);
  const lEnd = vec(a.vL * scale, (ang * 180) / Math.PI + 90);
  const cEnd = vec(a.vC * scale, (ang * 180) / Math.PI - 90);
  const sEnd = vec(settings.voltage * scale, (ang * 180) / Math.PI - lead);
  const arrow = (end: { x: number; y: number }, cls: string, key: string, width = 2.5) =>
    len2(end) > 4 ? <line key={key} x1={cx} y1={cy} x2={end.x} y2={end.y} className={cls} strokeWidth={width} markerEnd="url(#ph-arrow)" /> : null;
  const len2 = (p: { x: number; y: number }) => Math.hypot(p.x - cx, p.y - cy);
  return <svg className="capacitor-trace mx-auto block" style={{ maxHeight: 390 }} viewBox="0 0 600 390" role="img" aria-label={`Phasor diagram: current ${lead >= 0 ? 'leads' : 'lags'} the source by ${Math.abs(lead).toFixed(0)} degrees`}>
    <defs><marker id="ph-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--muted-foreground)" /></marker></defs>
    <circle cx={cx} cy={cy} r={maxLen + 18} className="ant-grid" />
    <path d={`M${cx - maxLen - 18} ${cy}H${cx + maxLen + 18}M${cx} ${cy - maxLen - 18}V${cy + maxLen + 18}`} className="comparison-axis" opacity={0.4} />
    {arrow(iEnd, 'phasor-i', 'i', 2)}
    {arrow(rEnd, 'phasor-r', 'r')}
    {arrow(lEnd, 'phasor-l', 'l')}
    {arrow(cEnd, 'phasor-c', 'c')}
    {arrow(sEnd, 'phasor-s', 's', 3)}
    <text x={iEnd.x + 8} y={iEnd.y} className="phasor-i-text">I</text>
    {len2(rEnd) > 4 && <text x={rEnd.x + 8} y={rEnd.y} className="phasor-r-text">V_R</text>}
    {len2(lEnd) > 4 && <text x={lEnd.x + 8} y={lEnd.y} className="phasor-l-text">V_L</text>}
    {len2(cEnd) > 4 && <text x={cEnd.x + 8} y={cEnd.y} className="phasor-c-text">V_C</text>}
    <text x={sEnd.x + 8} y={sEnd.y} className="phasor-s-text">V_source</text>
    <g transform="translate(420,60)">
      <text x="0" y="0" style={{ fontSize: 12, fontWeight: 600 }}>READING THE PHASORS</text>
      {([
        ['V_R', 'in phase with current', 'var(--primary)'],
        ['V_L', 'leads current by 90°', 'var(--coral)'],
        ['V_C', 'lags current by 90°', 'var(--flow-collector)'],
        ['V_source', 'the sum of all three', 'var(--amber)'],
      ] as const).map(([name, note, color], k) => <g key={name} transform={`translate(0,${26 + k * 34})`}>
        <rect x="0" y="-9" width="14" height="4" rx="2" fill={color} />
        <text x="22" y="-4" className="font-mono" style={{ fill: 'var(--foreground)' }}>{name}</text>
        <text x="22" y="10">{note}</text>
      </g>)}
      <text x="0" y="176" className="font-mono" style={{ fill: 'var(--foreground)' }}>φ = {lead.toFixed(1)}°</text>
      <text x="0" y="192">current {lead >= 0 ? 'leads' : 'lags'} the source</text>
    </g>
  </svg>;
}

/** Lenz's law: a bar magnet sliding toward and away from a coil connected to a galvanometer. */
export function LenzDiagram({ settings, distance, velocity }: { settings: LenzSettings; distance: number; velocity: number }) {
  const emf = inducedCurrent(settings, distance, velocity);
  const face = coilFace(settings, velocity);
  const magX = 90 + (distance - 1.2) * 90; // magnet centre
  const coilX = 430;
  const strength = Math.min(1, Math.abs(emf) / 0.12);
  const rings = Math.round(strength * 3);
  const needle = Math.max(-1, Math.min(1, emf / 0.12));
  const north = settings.pole === 'north';
  return <svg className="circuit-svg" viewBox="0 0 720 390" role="img" aria-label={`Magnet ${velocity > 0.01 ? 'approaching' : velocity < -0.01 ? 'receding from' : 'resting near'} the coil; induced current ${(Math.abs(emf) * 1000).toFixed(0)} milliunits`}>
    {/* magnet */}
    <g>
      <rect x={magX - 70} y="160" width="70" height="44" fill={north ? 'var(--coral)' : 'var(--flow-collector)'} rx="3" />
      <rect x={magX} y="160" width="70" height="44" fill={north ? 'var(--flow-collector)' : 'var(--coral)'} rx="3" />
      <text x={magX - 35} y="187" textAnchor="middle" style={{ fill: 'var(--card)', fontWeight: 700 }}>{north ? 'N' : 'S'}</text>
      <text x={magX + 35} y="187" textAnchor="middle" style={{ fill: 'var(--card)', fontWeight: 700 }}>{north ? 'S' : 'N'}</text>
      {Math.abs(velocity) > 0.01 && <path d={velocity > 0 ? `M${magX + 82} 182h34m-9-7 9 7-9 7` : `M${magX - 82} 182h-34m9-7-9 7 9 7`} className="ant-arrow" />}
      <text x={magX} y="140" textAnchor="middle">{velocity > 0.01 ? 'approaching' : velocity < -0.01 ? 'receding' : 'at rest'}</text>
    </g>
    {/* coil */}
    <rect x={coilX - 14} y="120" width="28" height="150" rx="4" className="region-metal" />
    {Array.from({ length: 6 }, (_, k) => <ellipse key={k} cx={coilX} cy={132 + k * 25} rx="26" ry="9" fill="none" className="symbol" />)}
    {Array.from({ length: rings }, (_, k) => <ellipse key={k} cx={coilX} cy="195" rx={44 + k * 22} ry={80 + k * 16} fill="none" className="capacitor-field" opacity={strength * (1 - k * 0.28)} />)}
    <text x={coilX} y="300" textAnchor="middle">COIL</text>
    {face !== 'none' && <text x={coilX - 40} y="112" textAnchor="end" className="font-mono" style={{ fill: 'var(--coral)', fontWeight: 700 }}>this face: {face.toUpperCase()}</text>}
    {/* wires to galvanometer */}
    <path d={`M${coilX - 26} 270V340H300M${coilX + 26} 270V340H420`} className="wire" />
    {/* galvanometer */}
    <circle cx="360" cy="340" r="26" className="symbol" fill="var(--card)" />
    <line x1="360" y1="340" x2={360 + needle * 18} y2={340 - 16} stroke="var(--coral)" strokeWidth="2.5" />
    <text x="360" y="384" textAnchor="middle">GALVANOMETER</text>
    <text x="330" y="322" className="font-mono">{needle > 0.03 ? '+' : needle < -0.03 ? '−' : '0'}</text>
    <text x="392" y="322" className="font-mono">{needle < -0.03 ? '+' : needle > 0.03 ? '−' : '0'}</text>
    {/* explanation */}
    <text x="40" y="40" style={{ fill: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>
      {face === 'none' ? 'Move the magnet: only change induces current.' : velocity > 0
        ? `The coil fights the approach — it becomes a ${face} pole and pushes back.`
        : `The coil fights the retreat — it becomes a ${face} pole and pulls the magnet back.`}
    </text>
    <text x="40" y="60">Lenz's law: the induced current always opposes the change that made it.</text>
  </svg>;
}

/** Small trace of induced current over time for the Lenz lab. */
export function LenzTrace({ history, window: span }: { history: { time: number; current: number }[]; window: number }) {
  const last = history.at(-1);
  const end = Math.max(span, last?.time ?? 0); const start = end - span;
  const shown = history.filter(s => s.time >= start);
  const x = (t: number) => 46 + ((t - start) / span) * 500;
  const scale = Math.max(0.02, ...shown.map(s => Math.abs(s.current)));
  const y = (i: number) => 124 - (i / scale) * 90;
  const ticks = Array.from({ length: 5 }, (_, k) => (k * span) / 4);
  return <svg className="capacitor-trace" viewBox="0 0 600 248" role="img" aria-label={`Induced current over the last ${span} seconds`}>
    {ticks.map(t => <g key={t}><path d={`M${x(start + t)} 26V222`} className="trace-grid" /><text x={x(start + t)} y="241" textAnchor="middle">{(start + t).toFixed(1)}s</text></g>)}
    <path d="M46 124H546" className="comparison-axis" />
    <text x="10" y="34">I</text>
    <path d={shown.map((s, i) => `${i ? 'L' : 'M'}${x(s.time).toFixed(1)} ${y(s.current).toFixed(1)}`).join(' ')} className="trace-output" />
    <text x="300" y="20" textAnchor="middle">induced current · sign = direction</text>
  </svg>;
}
