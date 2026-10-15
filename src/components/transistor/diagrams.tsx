import { useEffect, useRef } from 'react';
import { configurations, transistorModel, type Configuration, type Model, type TransistorType } from '@/lib/transistor-model';

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
function Flow({ path, amount, speed, reverse = false }: { path: string; amount: number; speed: number; reverse?: boolean }) {
  const count = amount > 0 ? Math.min(7, Math.max(2, Math.ceil(amount))) : 0;
  return <>{Array.from({ length: count }, (_, i) => <circle key={i} r="3.5" className="current-particle"><animateMotion path={path} dur={`${3 / speed}s`} begin={`${-i * 3 / speed / count}s`} repeatCount="indefinite" keyPoints={reverse ? '1;0' : '0;1'} keyTimes="0;1" calcMode="linear" /></circle>)}</>;
}
function Ground({ x, y }: { x: number; y: number }) {
  return <g className="wire"><path d={`M${x} ${y}v10m-13 0h26m-9 6h-8m3 6h2`} /></g>;
}
function Resistor({ x, y }: { x: number; y: number }) {
  return <path className="wire" d={`M${x} ${y}v8l-7 5 14 10-14 10 14 10-14 10 7 5v8`} />;
}
export function Circuit({ type, config, model, supply, speed, playing }: { type: TransistorType; config: Configuration; model: Model; supply: number; speed: number; playing: boolean }) {
  const ref = useSvgPlayback(playing);
  const cc = config === 'collector'; const cb = config === 'base';
  const upper = 'M520 65H390V168L350 198';
  const lower = cc ? 'M350 222L390 255V340H520' : cb ? 'M350 222L390 255V320H150' : 'M350 222L390 255V320';
  const base = 'M150 210H330';
  const reverse = type === 'pnp';
  return <svg ref={ref} className="circuit-svg" viewBox="0 0 720 390" role="img" aria-label={`${type.toUpperCase()} ${configurations[config].name} circuit, ${model.state}`}>
    <defs><marker id="emitter-arrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="var(--foreground)" /></marker></defs>
    <g className="wire"><path d={upper} /><path d={lower} /><path d={base} /></g>
    {!cc && <><rect x="378" y="90" width="24" height="68" fill="var(--card)" /><Resistor x={390} y={88} /><text x="418" y="113">Rₗ</text><text x="418" y="130">1 kΩ</text></>}
    {cc && <><rect x="378" y="265" width="24" height="67" fill="var(--card)" /><Resistor x={390} y={266} /><text x="418" y="290">Rₗ</text><text x="418" y="307">1 kΩ</text></>}
    <circle cx="350" cy="210" r="54" className="symbol" /><path d="M330 181V239M330 210H350M350 198L390 168M350 222L390 255" className="symbol" />
    <path d={reverse ? 'M379 246L364 233' : 'M363 232L379 246'} className="symbol" markerEnd="url(#emitter-arrow)" />
    <text x="348" y="288" className="terminal-label">{type.toUpperCase()}</text>
    <text x="305" y="195" className="terminal-label">B</text><text x="396" y="175" className="terminal-label">C</text><text x="396" y="252" className="terminal-label">E</text>
    <circle cx="520" cy="65" r="5" fill="var(--card)" stroke="var(--wire)" strokeWidth="2" /><text x="537" y="69" className="terminal-label">{reverse ? '−' : '+'}{supply.toFixed(1)} V</text><text x="520" y="46">{cc ? 'COMMON · COLLECTOR' : 'SUPPLY'}</text>
    {cb ? <><Ground x={150} y={210} /><text x="80" y="183">COMMON · BASE</text><circle cx="150" cy="320" r="5" fill="var(--card)" stroke="var(--wire)" strokeWidth="2" /><text x="72" y="307" className="carrier-text">INPUT</text><text x="72" y="340">Iₑ · emitter drive</text></> : <><circle cx="150" cy="210" r="24" className="wire" fill="var(--card)" /><path d={reverse ? 'M150 198V222M146 203L150 197L154 203' : 'M150 198V222M146 216L150 222L154 216'} className="wire" /><path d="M150 234V265" className="wire" /><Ground x={150} y={265} /><text x="77" y="164" className="carrier-text">INPUT</text><text x="66" y="181">Iᵦ · base drive</text></>}
    {!cc && !cb && <><Ground x={390} y={320} /><text x="421" y="335">COMMON · EMITTER</text></>}
    {cc && <Ground x={520} y={340} />}
    <path d={cc ? 'M390 255H540' : 'M390 168H540'} className="wire" /><circle cx="390" cy={cc ? 255 : 168} r="3.5" className="node" /><circle cx="540" cy={cc ? 255 : 168} r="5" fill="var(--card)" stroke="var(--primary)" strokeWidth="2" />
    <text x="557" y={cc ? 249 : 162} className="current-text">OUTPUT</text><text x="557" y={cc ? 269 : 182}>{model.output.toFixed(2)} V</text>
    <text x="215" y="233" className="current-text">Iᵦ</text><text x="354" y="78" className="current-text">I꜀</text><text x="354" y={cb ? 313 : 313} className="current-text">Iₑ</text>
    <Flow path={upper} amount={model.ic} speed={speed} reverse={reverse} /><Flow path={lower} amount={model.ie} speed={speed} reverse={reverse} /><Flow path={base} amount={model.ib * 40} speed={speed} reverse={reverse} />
  </svg>;
}
export function Cutaway({ type, model, speed, playing }: { type: TransistorType; model: Model; speed: number; playing: boolean }) {
  const ref = useSvgPlayback(playing);
  const layers = type === 'npn' ? ['N', 'P', 'N'] : ['P', 'N', 'P'];
  const count = model.conducting ? Math.min(14, Math.max(4, Math.ceil(model.ic * 2))) : 0;
  return <svg ref={ref} viewBox="0 0 600 222" className="cutaway-svg" role="img" aria-label={`${type === 'npn' ? 'Electrons' : 'Holes'} move from emitter through the thin base to collector`}>
    <text x="60" y="31">EMITTER</text><text x="244" y="31">BASE</text><text x="360" y="31">COLLECTOR</text>
    <rect x="40" y="49" width="205" height="118" className={layers[0] === 'N' ? 'region-n' : 'region-p'} rx="3" /><rect x="245" y="49" width="53" height="118" className={layers[1] === 'N' ? 'region-n' : 'region-p'} /><rect x="298" y="49" width="262" height="118" className={layers[2] === 'N' ? 'region-n' : 'region-p'} rx="3" />
    <path d="M245 49V167M298 49V167" className="cutaway-boundary" />
    {[100, 271, 445].map((x, i) => <text key={x} x={x} y="116" textAnchor="middle" className="terminal-label" style={{ fontSize: 25 }}>{layers[i]}</text>)}
    {Array.from({ length: count }, (_, i) => <g key={i}><circle r="5" className="carrier" fill={type === 'pnp' ? 'var(--card)' : undefined} stroke="var(--coral)" strokeWidth="1.5" /><text x="0" y="3" textAnchor="middle" fill="var(--card)" style={{ fontSize: 9 }}>{type === 'npn' ? '−' : '+'}</text><animateMotion path={`M65 ${70 + (i % 5) * 18}H536`} dur={`${3 / speed}s`} begin={`${-i * 3 / speed / count}s`} repeatCount="indefinite" /></g>)}
    {model.conducting && <circle r="4" className="carrier"><animateMotion path="M65 128H271V185" dur={`${7 / speed}s`} repeatCount="indefinite" /></circle>}
    <path d="M271 167V186" className="wire" /><text x="290" y="189">small base contribution</text>
    <path d="M52 190H182m-7-4 7 4-7 4" stroke="var(--coral)" fill="none" /><text x="53" y="210" className="carrier-text">{type === 'npn' ? 'electron' : 'hole'} motion</text>
  </svg>;
}
export function ResponseTrace({ type, config, drive, supply, phase }: { type: TransistorType; config: Configuration; drive: number; supply: number; phase: number }) {
  const points = Array.from({ length: 120 }, (_, i) => {
    const wave = Math.sin(i / 119 * Math.PI * 4 + phase);
    const input = drive * (1 + wave * .24);
    const model = transistorModel(type, config, input, supply);
    const normalizedOutput = config === 'collector' ? Math.abs(model.ve) / Math.max(supply, 0.1) : Math.abs(model.vc) / Math.max(supply, .1);
    // CB uses emitter voltage direction, the inverse of an increasing emitter current.
    const inSignal = (config === 'base' ? -wave : wave) * typeSign(type);
    return { x: 44 + i * 3.38, input: 88 - (drive ? inSignal * 28 : 0), output: 128 - Math.max(0, Math.min(1, normalizedOutput)) * 85 };
  });
  return <svg className="trace-svg" viewBox="0 0 480 177" role="img" aria-label={`${configurations[config].response} input and output response, normalized scales`}>
    {[43, 88, 133].map(y => <path key={y} d={`M44 ${y}H450`} className="trace-grid" />)}{[44, 145, 246, 347, 450].map(x => <path key={x} d={`M${x} 30V139`} className="trace-grid" />)}
    <text x="15" y="46">1</text><text x="15" y="136">0</text><text x="44" y="158">normalized · independent scales</text><text x="422" y="158">time →</text>
    <path d={points.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.input}`).join(' ')} className="trace-input" /><path d={points.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.output}`).join(' ')} className="trace-output" />
  </svg>;
}
function typeSign(type: TransistorType) { return type === 'npn' ? 1 : -1; }
