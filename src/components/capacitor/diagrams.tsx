import type { CapacitorSample, CapacitorSettings } from '@/lib/capacitor-model';

function along(points: number[][], progress: number) {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  let distance = progress * lengths.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (distance <= lengths[i]) {
      const ratio = distance / lengths[i];
      return { cx: points[i][0] + ratio * (points[i + 1][0] - points[i][0]), cy: points[i][1] + ratio * (points[i + 1][1] - points[i][1]) };
    }
    distance -= lengths[i];
  }
  return { cx: points[0][0], cy: points[0][1] };
}

export function CapacitorCircuit({ settings, sample, motion }: { settings: CapacitorSettings; sample: CapacitorSample; motion: number }) {
  const count = Math.abs(sample.current) > 0.02 ? Math.min(12, Math.max(3, Math.ceil(Math.abs(sample.current)))) : 0;
  const paths = [[[150, 155], [150, 90], [560, 90], [560, 185]], [[560, 205], [560, 300], [150, 300], [150, 235]]];
  return <svg className="circuit-svg" viewBox="0 0 720 390" role="img" aria-label={`Capacitor series RC circuit, ${settings.mode === 'ac' ? 'alternating source' : settings.connected ? 'charging' : 'discharging'}`}>
    <path d="M150 155V90H560V185M560 205V300H150V235" className="wire" />
    <circle cx="150" cy="195" r="40" className="symbol" />
    {settings.mode === 'ac' ? <path d="M125 195q12-28 25 0t25 0" className="symbol" /> : <><text x="150" y="185" textAnchor="middle" className="terminal-label">{settings.connected ? '+' : '0'}</text><text x="150" y="214" textAnchor="middle" className="terminal-label">{settings.connected ? '−' : 'V'}</text></>}
    <text x="60" y="140">{settings.mode === 'ac' ? 'AC SOURCE' : settings.connected ? 'DC SOURCE' : 'DISCHARGE'}</text><text x="60" y="264">{sample.source.toFixed(2)} V</text>
    <rect x="320" y="77" width="100" height="26" fill="var(--card)" />
    <path d="M320 90h10l6-10 12 20 12-20 12 20 12-20 12 20 6-10h18" className="wire" />
    <text x="330" y="64">R · {settings.resistance.toFixed(1)} kΩ</text>
    <path d="M532 185H588M532 205H588" className="symbol" />
    <text x="608" y="182">C</text><text x="608" y="207">{settings.capacitance} µF</text>
    <text x="510" y="177" className="terminal-label">{sample.voltage >= 0 ? '+' : '−'}</text><text x="510" y="223" className="terminal-label">{sample.voltage >= 0 ? '−' : '+'}</text>
    <text x="580" y="253">{sample.voltage.toFixed(2)} V</text>
    {paths.map((points, path) => Array.from({ length: count }, (_, i) => {
      const progress = ((motion / 3 + i / count) % 1 + 1) % 1;
      return <circle key={`${path}-${i}`} r="3.5" className="current-particle" {...along(points, progress)} />;
    }))}
    <text x="300" y="335" className="current-text">I = {sample.current.toFixed(2)} mA</text>
  </svg>;
}

export function CapacitorPlates({ sample }: { sample: CapacitorSample }) {
  const count = Math.min(12, Math.round(Math.abs(sample.voltage)));
  const positive = sample.voltage >= 0;
  return <svg className="cutaway-svg" viewBox="0 0 600 222" role="img" aria-label={`Capacitor plates with opposite stored charges, ${sample.charge.toFixed(0)} microcoulombs on the upper plate`}>
    <text x="65" y="29">UPPER PLATE</text><text x="402" y="29">LOWER PLATE</text>
    <rect x="80" y="45" width="85" height="125" rx="3" className="region-p" /><rect x="435" y="45" width="85" height="125" rx="3" className="region-n" />
    <rect x="180" y="45" width="240" height="125" rx="3" className="region-metal" />
    <path d="M165 45V170M435 45V170" className="symbol" />
    <text x="300" y="187" textAnchor="middle">insulating dielectric</text>
    {Array.from({ length: count }, (_, i) => <g key={i}>
      <circle cx={103 + i % 2 * 36} cy={59 + Math.floor(i / 2) * 19} r="7" className={positive ? 'hole-carrier' : 'carrier'} stroke="var(--coral)" />
      <text x={103 + i % 2 * 36} y={62 + Math.floor(i / 2) * 19} textAnchor="middle" className={positive ? 'hole-sign' : 'electron-sign'}>{positive ? '+' : '−'}</text>
      <circle cx={458 + i % 2 * 36} cy={59 + Math.floor(i / 2) * 19} r="7" className={positive ? 'carrier' : 'hole-carrier'} stroke="var(--coral)" />
      <text x={458 + i % 2 * 36} y={62 + Math.floor(i / 2) * 19} textAnchor="middle" className={positive ? 'electron-sign' : 'hole-sign'}>{positive ? '−' : '+'}</text>
    </g>)}
    {count > 0 && [75, 110, 145].map(y => <path key={y} d={positive ? `M210 ${y}H390m-8-5 8 5-8 5` : `M390 ${y}H210m8-5-8 5 8 5`} className="capacitor-field" opacity={Math.min(1, Math.abs(sample.voltage) / 5)} />)}
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