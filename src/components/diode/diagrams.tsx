import { useEffect, useRef } from 'react';
import { ivCurve, ZENER_VOLTAGE, type DiodeKind, type DiodeResult, type LedColor } from '@/lib/diode-model';

function useSvgPlayback(playing: boolean) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => { if (!playing || media.matches) ref.current?.pauseAnimations(); else ref.current?.unpauseAnimations(); };
    sync(); media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, [playing]);
  return ref;
}

const LOOP = 'M150 160V90H560V300H150V230';

function DiodeSymbol({ kind, model, color }: { kind: DiodeKind; model: DiodeResult; color: LedColor }) {
  // Anode at top (y=165), cathode at bottom (y=225); triangle points down.
  const bar = kind === 'zener' ? 'M538 226L542 220H578L582 214' : kind === 'schottky' ? 'M536 216V212H542V220H578V228H584V224' : 'M540 220H580';
  return <g>
    <rect x="528" y="150" width="64" height="90" fill="var(--card)" />
    {kind === 'led' && <circle cx="560" cy="200" r={22 + model.brightness * 26} fill={`var(--led-${color})`} opacity={model.brightness * 0.55} />}
    <path d="M560 150V180M560 220V240" className="wire" />
    <path d="M540 180H580L560 220Z" className="symbol" fill={kind === 'led' && model.brightness > 0 ? `var(--led-${color})` : 'none'} />
    <path d={bar} className="symbol" />
    {kind === 'led' && <path d="M588 186l16-12m-6 0h6v6M590 202l16-12m-6 0h6v6" className="symbol" style={{ strokeWidth: 1.6 }} />}
    <text x="510" y="178" className="terminal-label">A</text><text x="510" y="232" className="terminal-label">K</text>
  </g>;
}

export function DiodeCircuit({ kind, model, color, source, resistance, speed, playing }: { kind: DiodeKind; model: DiodeResult; color: LedColor; source: number; resistance: number; speed: number; playing: boolean }) {
  const ref = useSvgPlayback(playing);
  const count = model.conducting ? Math.min(12, Math.max(3, Math.ceil(Math.abs(model.current) / 1.2))) : 0;
  const reverse = model.current < 0;
  const positiveTop = source >= 0;
  return <svg ref={ref} className="circuit-svg" viewBox="0 0 720 390" role="img" aria-label={`${kind} diode series circuit, ${model.state}`}>
    <path d={LOOP} className="wire" />
    {/* source */}
    <path d="M150 160V178M150 212V230" className="wire" />
    <path d="M126 180H174M138 192H162M126 200H174M138 210H162" className="symbol" />
    <text x="186" y="178" className="terminal-label">{positiveTop ? '+' : '−'}</text><text x="186" y="220" className="terminal-label">{positiveTop ? '−' : '+'}</text>
    <text x="60" y="140" className="carrier-text">SOURCE</text><text x="60" y="262">{source >= 0 ? '+' : '−'}{Math.abs(source).toFixed(1)} V</text>
    {/* resistor */}
    <rect x="320" y="78" width="100" height="24" fill="var(--card)" />
    <path d="M320 90h10l6-10 12 20 12-20 12 20 12-20 12 20 6-10h8" className="wire" />
    <text x="340" y="66">R · {resistance.toFixed(1)} kΩ</text><text x="340" y="126">{Math.abs(model.vr).toFixed(2)} V</text>
    <DiodeSymbol kind={kind} model={model} color={color} />
    <text x="606" y="222">{model.vd.toFixed(2)} V</text>
    {Array.from({ length: count }, (_, i) => <circle key={i} r="3.5" className="current-particle"><animateMotion path={LOOP} dur={`${6 / speed}s`} begin={`${-i * 6 / speed / count}s`} repeatCount="indefinite" keyPoints={reverse ? '1;0' : '0;1'} keyTimes="0;1" calcMode="linear" /></circle>)}
    <text x="340" y="330" className="current-text">I = {Math.abs(model.current).toFixed(2)} mA {reverse ? '(reverse)' : ''}</text>
  </svg>;
}

export function Junction({ kind, model, color, speed, playing }: { kind: DiodeKind; model: DiodeResult; color: LedColor; speed: number; playing: boolean }) {
  const ref = useSvgPlayback(playing);
  const half = 10 + model.depletion * 70;
  const left = 300 - half; const right = 300 + half;
  const count = model.conducting ? Math.min(10, Math.max(3, Math.ceil(Math.abs(model.current) / 1.5))) : 0;
  const forward = model.current > 0;
  const leftLabel = kind === 'schottky' ? 'METAL' : 'P · ANODE';
  return <svg ref={ref} viewBox="0 0 600 222" className="cutaway-svg" role="img" aria-label={`Junction view: ${model.state}`}>
    <text x="60" y="31">{leftLabel}</text><text x="440" y="31">N · CATHODE</text>
    <rect x="40" y="49" width="260" height="118" rx="3" className={kind === 'schottky' ? 'region-metal' : 'region-p'} />
    <rect x="300" y="49" width="260" height="118" rx="3" className="region-n" />
    <rect x={left} y="49" width={right - left} height="118" className="depletion" />
    <path d={`M${left} 49V167M${right} 49V167`} className="cutaway-boundary" />
    <text x="300" y="186" textAnchor="middle">depletion zone</text>
    {!model.conducting && Array.from({ length: 6 }, (_, i) => <g key={i}>
      {kind !== 'schottky' && <><circle cx={70 + i * 25} cy={70 + (i % 3) * 30} r="5" className="hole-carrier" stroke="var(--coral)" strokeWidth="1.5" /><text x={70 + i * 25} y={73 + (i % 3) * 30} textAnchor="middle" className="hole-sign">+</text></>}
      <circle cx={530 - i * 25} cy={80 + (i % 3) * 30} r="5" className="carrier" /><text x={530 - i * 25} y={83 + (i % 3) * 30} textAnchor="middle" className="electron-sign">−</text>
    </g>)}
    {forward && Array.from({ length: count }, (_, i) => <g key={`e${i}`}>
      <circle r="5" className="carrier" /><text x="0" y="3" textAnchor="middle" className="electron-sign">−</text>
      <animateMotion path={`M540 ${66 + (i % 5) * 20}H${kind === 'schottky' ? 60 : 300}`} dur={`${3 / speed}s`} begin={`${-i * 3 / speed / count}s`} repeatCount="indefinite" />
    </g>)}
    {forward && kind !== 'schottky' && Array.from({ length: count }, (_, i) => <g key={`h${i}`}>
      <circle r="5" className="hole-carrier" stroke="var(--coral)" strokeWidth="1.5" /><text x="0" y="3" textAnchor="middle" className="hole-sign">+</text>
      <animateMotion path={`M60 ${76 + (i % 5) * 20}H300`} dur={`${3 / speed}s`} begin={`${-i * 3 / speed / count}s`} repeatCount="indefinite" />
    </g>)}
    {model.current < 0 && Array.from({ length: count }, (_, i) => <g key={`b${i}`}>
      <circle r="5" className="carrier" /><text x="0" y="3" textAnchor="middle" className="electron-sign">−</text>
      <animateMotion path={`M60 ${66 + (i % 5) * 20}H540`} dur={`${2 / speed}s`} begin={`${-i * 2 / speed / count}s`} repeatCount="indefinite" />
    </g>)}
    {kind === 'led' && model.brightness > 0 && Array.from({ length: 4 }, (_, i) => <path key={`p${i}`} d="M0 0q4 -6 8 0t8 0t8 0" stroke={`var(--led-${color})`} strokeWidth="2" fill="none" opacity={0.4 + model.brightness * 0.6}>
      <animateMotion path={`M300 ${70 + i * 25}L${380 + i * 20} 10`} dur={`${1.6 / speed}s`} begin={`${-i * 0.4 / speed}s`} repeatCount="indefinite" />
    </path>)}
    <path d="M52 200H182m-7-4 7 4-7 4" stroke="var(--coral)" fill="none" /><text x="53" y="215" className="carrier-text">{model.state === 'Breakdown' ? 'electrons tunnel P → N' : model.conducting ? 'carriers meet at the junction' : 'carriers pulled back — no flow'}</text>
  </svg>;
}

export function IVPlot({ kind, model, color }: { kind: DiodeKind; model: DiodeResult; color: LedColor }) {
  const xOf = (v: number) => 44 + (v + 8) / 12 * 406; // −8 … +4 V
  const yOf = (i: number) => 100 - Math.max(-70, Math.min(70, i)) ;
  const pts = Array.from({ length: 121 }, (_, n) => { const v = -8 + n * 0.1; return `${n ? 'L' : 'M'}${xOf(v)},${yOf(ivCurve(kind, v, color))}`; }).join(' ');
  const opY = yOf(model.conducting ? (model.current > 0 ? 1 : -1) * Math.min(70, 8 + Math.abs(model.current) * 3) : 0);
  return <svg className="trace-svg" viewBox="0 0 480 177" role="img" aria-label="Current–voltage characteristic with operating point">
    <path d={`M44 100H450M${xOf(0)} 24V168`} className="trace-grid" />
    <text x="420" y="94">V →</text><text x={xOf(0) + 6} y="34">I ↑</text>
    {kind === 'zener' && <text x={xOf(-ZENER_VOLTAGE) - 20} y="165">−{ZENER_VOLTAGE} V</text>}
    <path d={pts} className="trace-output" />
    <circle cx={xOf(Math.max(-8, Math.min(4, model.vd)))} cy={opY} r="6" fill="var(--coral)" stroke="var(--card)" strokeWidth="2" />
  </svg>;
}
