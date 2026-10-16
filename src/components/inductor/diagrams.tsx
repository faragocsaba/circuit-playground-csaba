import { acResponse, resonantFrequency, type InductorSample, type InductorSettings } from '@/lib/inductor-model';

type Point = [number, number];
const loop: Point[] = [[150, 155], [150, 90], [560, 90], [560, 300], [150, 300], [150, 235]];
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

export function InductorCircuit({ settings, sample, motion, fieldScale }: { settings: InductorSettings; sample: InductorSample; motion: number; fieldScale: number }) {
  const strength = Math.min(1, Math.abs(sample.current) / Math.max(1, fieldScale));
  const count = Math.abs(sample.current) > 0.5 ? Math.min(14, Math.max(4, Math.ceil(Math.abs(sample.current) / 25))) : 0;
  const hasC = settings.mode !== 'rl';
  const label = settings.mode === 'rl' ? settings.connected ? 'DC SOURCE' : 'SWITCH OFF' : settings.mode === 'lc' ? 'NO SOURCE' : 'AC SOURCE';
  return <svg className="circuit-svg" viewBox="0 0 720 390" role="img" aria-label={`Inductor circuit, ${settings.mode.toUpperCase()} arrangement, current ${sample.current.toFixed(1)} milliamps`}>
    <path d="M150 155V90H560V300H150V235" className="wire" />
    {settings.mode === 'lc' ? <path d="M150 150V240" className="wire" /> : <>
      <circle cx="150" cy="195" r="40" className="symbol" />
      {settings.mode === 'rlc' ? <path d="M125 195q12-28 25 0t25 0" className="symbol" /> : <><text x="150" y="185" textAnchor="middle" className="terminal-label">{settings.connected ? '+' : '0'}</text><text x="150" y="214" textAnchor="middle" className="terminal-label">{settings.connected ? '−' : 'V'}</text></>}
    </>}
    <text x="40" y="140">{label}</text><text x="40" y="264">{sample.source.toFixed(2)} V</text>
    <rect x="320" y="77" width="100" height="26" fill="var(--card)" />
    <path d="M320 90h10l6-10 12 20 12-20 12 20 12-20 12 20 6-10h18" className="wire" />
    <text x="330" y="64">R · {settings.resistance.toFixed(0)} Ω</text>
    <rect x="545" y="148" width="50" height="94" fill="var(--card)" />
    {[0, 1, 2].map(k => <ellipse key={k} cx="572" cy="195" rx={34 + k * 18} ry={60 + k * 14} className="capacitor-field" fill="none" opacity={strength * (1 - k * 0.28)} />)}
    <path d={coil(560, 150, 4, 11, true)} className="symbol" fill="none" />
    <path d="M560 238V242" className="wire" />
    <text x="655" y="182">L</text><text x="655" y="207">{settings.inductance} H</text>
    <text x="655" y="250" className="font-mono">{sample.vL.toFixed(2)} V</text>
    {hasC && <><rect x="340" y="280" width="32" height="40" fill="var(--card)" /><path d="M350 272V328M362 272V328" className="symbol" />
      <text x="330" y="350">C · {settings.capacitance} µF · {sample.vC.toFixed(2)} V</text></>}
    {Array.from({ length: count }, (_, i) => <circle key={i} r="3.5" className="current-particle" {...along(loop, ((motion / 3 + i / count) % 1 + 1) % 1)} />)}
    <text x="250" y="200" className="current-text">I = {sample.current.toFixed(1)} mA</text>
  </svg>;
}

export function InductorInside({ sample }: { sample: InductorSample }) {
  const total = Math.max(1e-9, sample.energyL + sample.energyC);
  const lines = Math.round(Math.min(1, Math.abs(sample.current) / 300) * 5);
  const dir = sample.current >= 0;
  return <svg className="cutaway-svg" viewBox="0 0 600 222" role="img" aria-label={`Magnetic field inside the coil and stored energy: ${sample.energyL.toFixed(1)} millijoules in the field, ${sample.energyC.toFixed(1)} in the capacitor`}>
    <text x="40" y="26">COIL · MAGNETIC FIELD</text>
    <rect x="70" y="80" width="240" height="60" rx="4" className="region-metal" />
    {Array.from({ length: 8 }, (_, k) => <ellipse key={k} cx={90 + k * 29} cy="110" rx="9" ry="40" fill="none" className="symbol" />)}
    {Array.from({ length: lines }, (_, k) => { const y = 110 + (k - (lines - 1) / 2) * 11; return <path key={k} d={dir ? `M50 ${y}H330m-8-5 8 5-8 5` : `M330 ${y}H50m8-5-8 5 8 5`} className="capacitor-field" />; })}
    <text x="190" y="180" textAnchor="middle">{lines ? `field ${dir ? '→' : '←'} grows with current` : 'no current, no field'}</text>
    <text x="380" y="26">WHERE THE ENERGY IS</text>
    {([['Magnetic (L)', sample.energyL, 'var(--primary)', 60], ['Electric (C)', sample.energyC, 'var(--coral)', 120]] as const).map(([name, e, color, y]) => <g key={name}>
      <text x="380" y={y}>{name}</text>
      <rect x="380" y={y + 8} width="180" height="16" rx="3" fill="var(--secondary)" />
      <rect x="380" y={y + 8} width={180 * e / total} height="16" rx="3" fill={color} />
      <text x="560" y={y} textAnchor="end" className="font-mono">{e.toFixed(1)} mJ</text>
    </g>)}
    <text x="300" y="211" textAnchor="middle">E = ½·L·I² in the coil · E = ½·C·V² on the plates</text>
  </svg>;
}

export function InductorTrace({ history, window: span, showCap }: { history: InductorSample[]; window: number; showCap: boolean }) {
  const last = history.at(-1);
  const end = Math.max(span, last?.time ?? 0); const start = end - span;
  const shown = history.filter(s => s.time >= start);
  const x = (t: number) => 46 + (t - start) / span * 500;
  const vScale = Math.max(1, ...shown.map(s => Math.max(Math.abs(s.source), Math.abs(s.vL), Math.abs(s.vC))));
  const iScale = Math.max(1, ...shown.map(s => Math.abs(s.current)));
  const volts = (v: number) => 75 - v / vScale * 42; const amps = (i: number) => 180 - i / iScale * 35;
  const trace = (read: (s: InductorSample) => number, y: (n: number) => number) => shown.map((s, i) => `${i ? 'L' : 'M'}${x(s.time).toFixed(1)} ${y(read(s)).toFixed(1)}`).join(' ');
  const ticks = Array.from({ length: 5 }, (_, k) => k * span / 4);
  return <svg className="capacitor-trace" viewBox="0 0 600 248" role="img" aria-label={`Live voltage and current graphs over ${span} seconds`}>
    {ticks.map(t => <g key={t}><path d={`M${x(start + t)} 26V222`} className="trace-grid" /><text x={x(start + t)} y="241" textAnchor="middle">{(start + t).toFixed(1)}s</text></g>)}
    <path d="M46 75H546M46 180H546" className="comparison-axis" />
    <text x="12" y="34">V</text><text x="10" y="148">mA</text><text x="552" y="38">{vScale.toFixed(1)}</text><text x="552" y="151">{iScale.toFixed(0)}</text>
    <path d={trace(s => s.source, volts)} className="trace-input" />
    <path d={trace(s => showCap ? s.vC : s.vL, volts)} className="trace-output" />
    <path d={trace(s => s.current, amps)} className="capacitor-current-trace" />
  </svg>;
}

export function ResonanceCurve({ settings }: { settings: InductorSettings }) {
  const fMax = 5, fMin = 0.1;
  const x = (f: number) => 56 + (f - fMin) / (fMax - fMin) * 500;
  const freqs = Array.from({ length: 241 }, (_, k) => fMin + k * (fMax - fMin) / 240);
  const peak = settings.voltage / settings.resistance * 1000;
  const y = (i: number) => 200 - i / peak * 165;
  const f0 = resonantFrequency(settings); const now = acResponse(settings);
  return <svg className="capacitor-trace mx-auto block" style={{ maxHeight: 340 }} viewBox="0 0 600 248" role="img" aria-label={`Resonance curve: peak current versus frequency, resonance at ${f0.toFixed(2)} hertz`}>
    {[0, 1, 2, 3, 4, 5].map(f => <g key={f}><path d={`M${x(Math.max(fMin, f))} 30V200`} className="trace-grid" /><text x={x(Math.max(fMin, f))} y="220" textAnchor="middle">{f} Hz</text></g>)}
    <path d="M56 200H556" className="comparison-axis" /><text x="8" y="40">mA</text><text x="8" y="58" className="font-mono">{peak.toFixed(0)}</text>
    <path d={freqs.map((f, k) => `${k ? 'L' : 'M'}${x(f).toFixed(1)} ${y(acResponse(settings, f).peakCurrent).toFixed(1)}`).join(' ')} className="trace-output" />
    {f0 <= fMax && <><path d={`M${x(f0)} 30V200`} className="capacitor-current-trace" strokeDasharray="4 4" /><text x={x(f0) + 6} y="44">f₀ = {f0.toFixed(2)} Hz</text></>}
    <circle cx={x(settings.frequency)} cy={y(now.peakCurrent)} r="5" fill="var(--primary)" />
    <text x="300" y="242" textAnchor="middle">Drive frequency · the dot is your setting</text>
  </svg>;
}
