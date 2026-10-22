import { capacitorVisualState, type CapacitorSample, type CapacitorSettings } from '@/lib/capacitor-model';

type Point = [number, number];
function along(points: Point[], progress: number) {
  const segments = points.slice(1).flatMap((end, i) => {
    const start = points[i];
    return start ? [{ start, end, length: Math.hypot(end[0] - start[0], end[1] - start[1]) }] : [];
  });
  let distance = progress * segments.reduce((sum, segment) => sum + segment.length, 0);
  for (const { start, end, length } of segments) {
    if (distance <= length && length > 0) {
      const ratio = distance / length;
      return { cx: start[0] + ratio * (end[0] - start[0]), cy: start[1] + ratio * (end[1] - start[1]), angle: Math.atan2(end[1] - start[1], end[0] - start[0]) * 180 / Math.PI };
    }
    distance -= length;
  }
  const first = points[0];
  return { cx: first?.[0] ?? 0, cy: first?.[1] ?? 0, angle: 0 };
}

export function CapacitorCircuit({ settings, sample, motion }: { settings: CapacitorSettings; sample: CapacitorSample; motion: number }) {
  const visual = capacitorVisualState(sample);
  // Separate wire runs: no arrows enter the source, resistor or dielectric.
  const paths: Point[][] = [[[150, 143], [150, 90], [308, 90]], [[432, 90], [560, 90], [560, 173]], [[560, 217], [560, 300], [150, 300], [150, 247]]];
  return <svg className="circuit-svg" viewBox="0 0 720 390" role="img" aria-label={`Capacitor series RC circuit, ${settings.mode === 'ac' ? 'alternating source' : settings.connected ? 'charging' : 'discharging'}`}>
    <path d="M150 155V90H560V185M560 205V300H150V235" className="wire" />
    <circle cx="150" cy="195" r="40" className="symbol" />
    {settings.mode === 'ac' ? <path d="M125 195q12-28 25 0t25 0" className="symbol" /> : <><text x="150" y="185" textAnchor="middle" className="terminal-label">{settings.connected ? settings.voltage >= 0 ? '+' : '−' : '0'}</text><text x="150" y="214" textAnchor="middle" className="terminal-label">{settings.connected ? settings.voltage >= 0 ? '−' : '+' : 'V'}</text></>}
    <text x="60" y="140">{settings.mode === 'ac' ? 'AC SOURCE' : settings.connected ? 'DC SOURCE' : 'DISCHARGE'}</text><text x="60" y="264">{sample.source.toFixed(2)} V</text>
    <rect x="320" y="77" width="100" height="26" fill="var(--card)" />
    <path d="M320 90h10l6-10 12 20 12-20 12 20 12-20 12 20 6-10h18" className="wire" />
    <text x="330" y="64">R · {settings.resistance.toFixed(1)} kΩ</text>
    <path d="M532 185H588M532 205H588" className="symbol" />
    <text x="608" y="182">C</text><text x="608" y="207">{settings.capacitance} µF</text>
    <text x="510" y="177" className="terminal-label">{sample.voltage >= 0 ? '+' : '−'}</text><text x="510" y="223" className="terminal-label">{sample.voltage >= 0 ? '−' : '+'}</text>
    <text x="580" y="253">{sample.voltage.toFixed(2)} V</text>
    <g data-testid="capacitor-wire-current" data-direction={visual.currentDirection} opacity={visual.currentStrength}>
      {paths.map((points, path) => Array.from({ length: path === 2 ? 10 : 4 }, (_, i) => {
        const count = path === 2 ? 10 : 4;
        const progress = ((motion / 3 + i / count) % 1 + 1) % 1;
        const { cx, cy, angle } = along(points, progress);
        return <path key={`${path}-${i}`} d="M-7 0H7M2-5 7 0 2 5" className="capacitor-current-arrow" transform={`translate(${cx},${cy}) rotate(${angle + (visual.currentDirection < 0 ? 180 : 0)})`} opacity={Math.min(1, progress * 12, (1 - progress) * 12)} />;
      }))}
    </g>
    <text x="300" y="335" className="current-text">I = {sample.current.toFixed(2)} mA</text>
  </svg>;
}

export function CapacitorPlates({ sample }: { sample: CapacitorSample }) {
  const visual = capacitorVisualState(sample);
  const positive = visual.upperPolarity >= 0;
  return <svg className="cutaway-svg" viewBox="0 0 600 222" role="img" aria-label={`Capacitor plates with opposite stored charges, ${sample.charge.toFixed(0)} microcoulombs on the upper plate`}>
    <text x="122" y="29" textAnchor="middle">PLATE 1 · TOP</text><text x="478" y="29" textAnchor="middle">PLATE 2 · BOTTOM</text>
    <rect x="80" y="45" width="85" height="125" rx="3" className="region-p" /><rect x="435" y="45" width="85" height="125" rx="3" className="region-n" />
    <rect x="180" y="45" width="240" height="125" rx="3" className="region-metal" />
    <path d="M165 45V170M435 45V170" className="symbol" />
    <text x="300" y="187" textAnchor="middle">insulating dielectric</text>
    {visual.chargeLevels.map((opacity, i) => <g key={i} opacity={opacity} data-testid="capacitor-plate-charge">
      <text x={96 + i % 3 * 26} y={61 + Math.floor(i / 3) * 14} textAnchor="middle" className="capacitor-charge-sign">{positive ? '+' : '−'}</text>
      <text x={451 + i % 3 * 26} y={61 + Math.floor(i / 3) * 14} textAnchor="middle" className="capacitor-charge-sign">{positive ? '−' : '+'}</text>
    </g>)}
    <g data-testid="capacitor-electric-field" data-direction={visual.fieldDirection} opacity={visual.fieldStrength}>
      {[75, 110, 145].map(y => <path key={y} d={visual.fieldDirection >= 0 ? `M210 ${y}H390m-8-5 8 5-8 5` : `M390 ${y}H210m8-5-8 5 8 5`} className="capacitor-field" />)}
    </g>
    <text x="300" y="211" textAnchor="middle">Q = ±{Math.abs(sample.charge).toFixed(0)} µC · electric field from + to −</text>
  </svg>;
}

export function CapacitorTrace({ history, voltageScale }: { history: CapacitorSample[]; voltageScale: number }) {
  const last = history.at(-1);
  const end = Math.max(12, last?.time ?? 0);
  const start = end - 12;
  const x = (t: number) => 46 + (t - start) / 12 * 500;
  const volts = (v: number) => 75 - v / Math.max(1, voltageScale) * 42;
  const currentScale = Math.max(1, ...history.map(s => Math.abs(s.current)));
  const amps = (i: number) => 180 - i / currentScale * 35;
  const trace = (read: (s: CapacitorSample) => number, y: (n: number) => number) => history.filter(s => s.time >= start).map((s, i) => `${i ? 'L' : 'M'}${x(s.time)} ${y(read(s))}`).join(' ');
  return <svg className="capacitor-trace" viewBox="0 0 600 248" role="img" aria-label="Live voltage and current graphs over twelve seconds">
    {[0, 3, 6, 9, 12].map(t => <g key={t}><path d={`M${x(start + t)} 26V222`} className="trace-grid" /><text x={x(start + t)} y="241" textAnchor="middle">{(start + t).toFixed(0)}s</text></g>)}
    <path d="M46 75H546M46 180H546" className="comparison-axis" />
    <text x="12" y="34">V</text><text x="10" y="148">mA</text><text x="552" y="38">{voltageScale.toFixed(0)}</text><text x="552" y="151">{currentScale.toFixed(1)}</text>
    <text x="19" y="79">0</text><text x="19" y="184">0</text>
    <path d={trace(s => s.source, volts)} className="trace-input" /><path d={trace(s => s.voltage, volts)} className="trace-output" /><path d={trace(s => s.current, amps)} className="capacitor-current-trace" />
    {last && <><circle cx={x(last.time)} cy={volts(last.voltage)} r="3" fill="var(--primary)" /><circle cx={x(last.time)} cy={amps(last.current)} r="3" fill="var(--flow-collector)" /></>}
  </svg>;
}