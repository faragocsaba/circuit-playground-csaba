import { useState } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { diodes, forwardVoltage, ivCurve, ZENER_VOLTAGE, type DiodeKind, type LedColor } from '@/lib/diode-model';

const kinds: DiodeKind[] = ['rectifier', 'schottky', 'led', 'zener'];
const patterns: Record<DiodeKind, string | undefined> = { rectifier: undefined, schottky: '9 3', led: '3 3', zener: '12 4 2 4' };
const windows = { full: [-8, 4], forward: [0, 4], reverse: [-8, 0] } as const;

export function DiodeComparison() {
  const [visible, setVisible] = useState<DiodeKind[]>([...kinds]);
  const [color, setColor] = useState<LedColor>('red');
  const [voltage, setVoltage] = useState(1);
  const [range, setRange] = useState<keyof typeof windows>('full');
  const [min, max] = windows[range];
  const x = (v: number) => 76 + (v - min) / (max - min) * 850;
  const y = (current: number) => 235 - current / 140 * 180;
  const ticks = range === 'full' ? [-8, -6, -4, -2, 0, 2, 4] : range === 'forward' ? [0, 1, 2, 3, 4] : [-8, -6, -4, -2, 0];
  function changeRange(next: keyof typeof windows) {
    setRange(next);
    setVoltage(v => Math.max(windows[next][0], Math.min(windows[next][1], v)));
  }
  return <section className="diode-comparison" aria-label="Diode curve comparison">
    <div className="comparison-heading"><h2>Current–voltage comparison</h2><div className="segment" aria-label="Voltage range">{(['full', 'forward', 'reverse'] as const).map(r => <Button key={r} variant="ghost" size="sm" aria-pressed={range === r} onClick={() => changeRange(r)}>{r === 'full' ? 'Full range' : r === 'forward' ? 'Forward' : 'Reverse'}</Button>)}</div></div>
    <div className="comparison-legend" aria-label="Visible curves">{kinds.map(kind => <Button key={kind} variant="outline" size="sm" aria-pressed={visible.includes(kind)} onClick={() => setVisible(v => v.includes(kind) ? v.filter(k => k !== kind) : [...v, kind])}><svg width="26" height="12" aria-hidden="true"><path d="M1 6H25" className={`comparison-curve curve-${kind}`} strokeDasharray={patterns[kind]} /></svg>{diodes[kind].name}</Button>)}<label className="comparison-color">LED color<select aria-label="Comparison LED color" value={color} onChange={e => setColor(e.target.value as LedColor)}><option value="red">Red · 1.8 V</option><option value="green">Green · 2.1 V</option><option value="blue">Blue · 3.0 V</option></select></label></div>
    <div className="comparison-chart">
      <svg viewBox="0 0 980 470" role="img" aria-label={`Overlaid diode current–voltage curves, ${range} range, probe at ${voltage.toFixed(2)} volts`}>
        <defs><clipPath id="comparison-plot"><rect x="76" y="40" width="850" height="390" /></clipPath></defs>
        {[-140, -70, 0, 70, 140].map(i => <g key={i}><path d={`M76 ${y(i)}H926`} className="trace-grid" /><text x="64" y={y(i) + 4} textAnchor="end">{i}</text></g>)}
        {ticks.map(v => <g key={v}><path d={`M${x(v)} 40V430`} className="trace-grid" /><text x={x(v)} y="450" textAnchor="middle">{v}</text></g>)}
        <path d={`M76 ${y(0)}H926M${x(0)} 40V430`} className="comparison-axis" />
        <text x="76" y="23">Current (mA)</text><text x="926" y="468" textAnchor="end">Diode voltage (V)</text>
        <g clipPath="url(#comparison-plot)">
          {kinds.filter(k => visible.includes(k)).map(kind => <path key={kind} data-testid={`curve-${kind}`} className={`comparison-curve curve-${kind}`} strokeDasharray={patterns[kind]} d={Array.from({ length: 481 }, (_, n) => { const v = min + n / 480 * (max - min); return `${n ? 'L' : 'M'}${x(v)},${y(ivCurve(kind, v, color))}`; }).join(' ')} />)}
          <path d={`M${x(voltage)} 40V430`} className="comparison-probe" />
          {kinds.filter(k => visible.includes(k)).map((kind, n) => <circle key={kind} cx={x(voltage)} cy={y(ivCurve(kind, voltage, color))} r={7 - n} className={`comparison-point curve-${kind}`} />)}
        </g>
      </svg>
      {visible.length === 0 && <p className="comparison-empty">No curves selected</p>}
    </div>
    <div className="comparison-voltage"><label htmlFor="comparison-voltage" className="control-label">Diode voltage<output className="value-pill">{voltage.toFixed(2)} V</output></label><input id="comparison-voltage" className="range" type="range" min={min} max={max} step="0.01" value={voltage} onChange={e => setVoltage(Number(e.target.value))} /><div className="range-ends"><span>{min} V</span><span>{max} V</span></div></div>
    <div className="comparison-readouts" aria-live="polite">{kinds.map(kind => <div key={kind} className={`comparison-readout ${visible.includes(kind) ? '' : 'curve-hidden'}`}><div className="flex items-center gap-2 text-xs"><svg width="24" height="12" aria-hidden="true"><path d="M1 6H23" className={`comparison-curve curve-${kind}`} strokeDasharray={patterns[kind]} /></svg>{diodes[kind].name}</div><div className="readout-value">{ivCurve(kind, voltage, color).toFixed(2)} <span className="readout-unit">mA</span></div><p className="mt-2 text-xs text-muted-foreground">Forward knee {forwardVoltage(kind, color).toFixed(1)} V{kind === 'zener' ? ` · reverse −${ZENER_VOLTAGE} V` : ''}</p></div>)}</div>
    <div className="panel-note"><Info size={14} className="shrink-0" /><span>Rectifier and Zener curves overlap in forward bias; the dashed Zener curve separates below −5.1 V. Idealized knees and equal illustrative slopes: real devices vary, and circuit current also depends on the series resistor.</span></div>
  </section>;
}