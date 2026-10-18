import type { BandColor, ResistorSettings } from '@/lib/resistor-model';
import { colorBands, formatOhms, resistorModel } from '@/lib/resistor-model';
import { parallelResistorFlow } from '@/lib/resistor-flow-model';

type Pt = [number, number];
function along(points: Pt[], t: number): Pt {
  const p = (i: number) => points[i] as Pt;
  const lens = points.slice(1).map((q, i) => Math.hypot(q[0] - p(i)[0], q[1] - p(i)[1]));
  let d = (((t % 1) + 1) % 1) * lens.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lens.length; i++) {
    const len = lens[i] as number, a = p(i), b = p(i + 1);
    if (d <= len) { const f = d / len; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; }
    d -= len;
  }
  return p(points.length - 1);
}
function Particles({ path, current, phase, cls }: { path: Pt[]; current: number; phase: number; cls: string }) {
  if (current < 0.01) return null;
  const n = 14;
  return <>{Array.from({ length: n }, (_, i) => { const [x, y] = along(path, i / n + phase * Math.min(1, current / 20) * 0.25); return <circle key={i} cx={x} cy={y} r={3.2} className={`current-particle ${cls}`} />; })}</>;
}
function Zigzag({ x, y, vertical = false }: { x: number; y: number; vertical?: boolean }) {
  const pts = [-30, -25, -15, -5, 5, 15, 25, 30].map((o, i) => { const w = i === 0 || i === 7 ? 0 : i % 2 ? 8 : -8; return vertical ? `${x + w},${y + o}` : `${x + o},${y + w}`; });
  return <polyline points={pts.join(' ')} className="symbol" strokeLinejoin="round" />;
}

export function ResistorCircuit({ settings, phase }: { settings: ResistorSettings; phase: number }) {
  const m = resistorModel(settings);
  const { arrangement } = settings;
  return <svg viewBox="0 0 640 390" className="circuit-svg" role="img" aria-label={`${arrangement} resistor circuit carrying ${m.current.toFixed(1)} milliamps`}>
    <path d={arrangement === 'parallel' ? 'M120 170 V90 H380 M380 300 H120 V220' : 'M120 170 V90 H520 V300 H120 V220'} className="wire" />
    <line x1="100" y1="170" x2="140" y2="170" className="symbol" /><line x1="110" y1="220" x2="130" y2="220" className="symbol" />
    <text x="150" y="176" className="terminal-label">+</text><text x="60" y="200">{settings.voltage.toFixed(1)} V</text>
    {arrangement === 'parallel' ? <>
      <rect x="250" y="70" width="0" height="0" />
      <path d="M260 90 V140 M260 240 V300 M380 90 V140 M380 240 V300" className="wire" />
      <rect x="248" y="140" width="24" height="100" fill="var(--card)" /><rect x="368" y="140" width="24" height="100" fill="var(--card)" />
      <path d="M260 140 V160 M260 220 V240 M380 140 V160 M380 220 V240" className="wire" />
      <Zigzag x={260} y={190} vertical /><Zigzag x={380} y={190} vertical />
      <text x="278" y="186" className="terminal-label flow-text-collector">R₁</text><text x="278" y="202">{formatOhms(settings.r1)}</text>
      <text x="398" y="186" className="terminal-label flow-text-base">R₂</text><text x="398" y="202">{formatOhms(settings.r2)}</text>
      <circle cx="260" cy="90" r="4" className="node" /><circle cx="380" cy="90" r="4" className="node" /><circle cx="260" cy="300" r="4" className="node" /><circle cx="380" cy="300" r="4" className="node" />
      {parallelResistorFlow(settings, phase).map(stream => <g key={stream.branch} data-current-branch={stream.branch + 1}>
        {stream.dots.map((dot, i) => <circle key={i} cx={dot.x} cy={dot.y} r={3.2} className={`current-particle ${stream.branch === 0 ? 'flow-collector' : 'flow-base'}`} />)}
      </g>)}
      <text x="420" y="80" className="current-text">I = I₁ + I₂</text>
    </> : <>
      <rect x="230" y="78" width="80" height="24" fill="var(--card)" />
      <Zigzag x={270} y={90} /><text x="250" y="68" className="terminal-label">R₁</text><text x="250" y="124">{formatOhms(settings.r1)}</text>
      {arrangement === 'series' && <><rect x="490" y="160" width="60" height="80" fill="var(--card)" /><Zigzag x={520} y={200} vertical /><text x="540" y="196" className="terminal-label">R₂</text><text x="540" y="212">{formatOhms(settings.r2)}</text></>}
      <Particles path={[[120, 170], [120, 90], [520, 90], [520, 300], [120, 300], [120, 220]]} current={m.current} phase={phase} cls="" />
    </>}
    <text x="330" y="340" textAnchor="middle" className="current-text">I = {m.current.toFixed(2)} mA</text>
  </svg>;
}

const bandFill: Record<BandColor, string> = { black: '#1d1d1f', brown: '#7b4a26', red: '#d23a2c', orange: '#ec8a21', yellow: '#f2cf2d', green: '#3b9a4a', blue: '#2f64c9', violet: '#8a4fc2', grey: '#8d8d8d', white: '#f4f4f4', gold: '#c8a443' };
export function ColorCode({ ohms, label }: { ohms: number; label: string }) {
  const bands = colorBands(ohms);
  return <svg viewBox="0 0 300 110" className="w-full" role="img" aria-label={`${label}: ${bands.join(', ')}`} style={{ maxHeight: 130 }}>
    <line x1="10" y1="55" x2="290" y2="55" className="wire" />
    <rect x="70" y="30" width="160" height="50" rx="22" fill="oklch(0.86 0.05 80)" stroke="var(--border)" />
    {bands.map((b, i) => <rect key={i} x={i === 3 ? 200 : 100 + i * 24} y="30" width="12" height="50" fill={bandFill[b]} />)}
    <text x="150" y="104" textAnchor="middle" style={{ font: '11px var(--font-mono)', fill: 'var(--muted-foreground)' }}>{label} · {bands.slice(0, 3).join(' · ')} · gold ±5%</text>
  </svg>;
}

/** Straight V–I line of the total resistance with the working point. */
export function OhmPlot({ settings }: { settings: ResistorSettings }) {
  const m = resistorModel(settings);
  const maxI = (12 / m.total) * 1000;
  const x = (v: number) => 40 + (v / 12) * 540, y = (i: number) => 210 - (i / maxI) * 180;
  return <svg viewBox="0 0 600 240" className="capacitor-trace" role="img" aria-label="Current versus voltage line">
    <line x1="40" y1="210" x2="580" y2="210" stroke="var(--border)" /><line x1="40" y1="30" x2="40" y2="210" stroke="var(--border)" />
    <line x1={x(0)} y1={y(0)} x2={x(12)} y2={y(maxI)} stroke="var(--primary)" strokeWidth="2" />
    <circle cx={x(settings.voltage)} cy={y(m.current)} r="6" fill="var(--coral)" />
    <text x="580" y="228" textAnchor="end">12 V</text><text x="44" y="26">{maxI.toFixed(1)} mA</text><text x="36" y="224" textAnchor="end">0</text>
  </svg>;
}
