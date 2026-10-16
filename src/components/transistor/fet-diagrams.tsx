import { useEffect, useRef } from 'react';
import { fetConfigurations, fetModel, type FetChannel, type FetConfiguration, type FetKind, type FetModel } from '@/lib/fet-model';

function usePlayback(playing: boolean) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => { if (playing && !media.matches) ref.current?.unpauseAnimations(); else ref.current?.pauseAnimations(); };
    sync(); media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, [playing]);
  return ref;
}
function Ground({ x, y }: { x: number; y: number }) {
  return <path className="wire" d={`M${x} ${y}v10m-12 0h24m-18 5h12m-9 5h6`} />;
}
function Load({ y }: { y: number }) {
  return <><rect x="378" y={y} width="24" height="65" fill="var(--card)" /><path className="wire" d={`M390 ${y}v7l-7 5 14 10-14 10 14 10-14 10 7 5v8`} /><text x="417" y={y + 28}>Rₗ · 1 kΩ</text></>;
}
function Dots({ path, model, speed, branch }: { path: string; model: FetModel; speed: number; branch: string }) {
  const period = model.period / speed;
  return <g data-fet-flow={branch}>{Array.from({ length: model.dots }, (_, i) => <circle key={i} r="3.5" className="current-particle flow-collector"><animateMotion path={path} dur={`${period}s`} begin={`${-i * period / model.dots}s`} keyPoints={model.sign < 0 ? '1;0' : '0;1'} keyTimes="0;1" calcMode="linear" repeatCount="indefinite" /></circle>)}</g>;
}
export function FetCircuit({ kind, channel, config, model, supply, playing, speed }: { kind: FetKind; channel: FetChannel; config: FetConfiguration; model: FetModel; supply: number; playing: boolean; speed: number }) {
  const ref = usePlayback(playing);
  const upper = 'M520 65H390V185';
  const lower = config === 'drain' ? 'M390 235V340H520' : config === 'gate' ? 'M390 235V320H150' : 'M390 235V320';
  return <svg ref={ref} className="circuit-svg" viewBox="0 0 720 390" role="img" aria-label={`${channel}-channel ${kind.toUpperCase()} ${fetConfigurations[config].name} circuit, ${model.state}`}>
    <g className="wire"><path d={upper} /><path d={lower} /><path d="M150 210H322" /></g>
    <Load y={config === 'drain' ? 266 : 90} />
    <circle cx="355" cy="210" r="54" className="symbol" />
    <path d="M365 182V238M365 185H390M365 235H390M322 186V234" className="symbol" />
    {kind === 'mosfet' ? <path d="M346 182V195M346 202V218M346 225V238" className="symbol" /> : <path d={channel === 'n' ? 'M322 210H365m-9-5 9 5-9 5' : 'M365 210H322m9-5-9 5 9 5'} className="symbol" />}
    <text x="301" y="192" className="terminal-label">G</text><text x="397" y="179" className="terminal-label">D</text><text x="397" y="250" className="terminal-label">S</text>
    <text x="320" y="285" className="terminal-label">{channel.toUpperCase()} · {kind.toUpperCase()}</text>
    <circle cx="520" cy="65" r="5" className="symbol" /><text x="538" y="69">{model.sign < 0 ? '−' : '+'}{supply.toFixed(1)} V</text><text x="460" y="46">{config === 'drain' ? 'COMMON · DRAIN' : 'SUPPLY'}</text>
    {config === 'gate' ? <><Ground x={150} y={210} /><text x="72" y="183">COMMON · GATE</text><circle cx="150" cy="320" r="5" className="symbol" /><text x="72" y="350">SOURCE INPUT · {model.vs.toFixed(2)} V</text></> : <><circle cx="150" cy="210" r="24" className="wire" /><text x="145" y="205">+</text><text x="145" y="224">−</text><path d="M150 234V265" className="wire" /><Ground x={150} y={265} /><text x="75" y="164">GATE INPUT</text><text x="75" y="183">{model.vg.toFixed(2)} V</text></>}
    {config === 'source' && <><Ground x={390} y={320} /><text x="421" y="335">COMMON · SOURCE</text></>}
    {config === 'drain' && <Ground x={520} y={340} />}
    <path d={config === 'drain' ? 'M390 235H540' : 'M390 185H540'} className="wire" /><circle cx="540" cy={config === 'drain' ? 235 : 185} r="5" className="symbol" /><text x="555" y={config === 'drain' ? 230 : 180} className="current-text">OUTPUT</text><text x="555" y={config === 'drain' ? 249 : 199}>{model.output.toFixed(2)} V</text>
    <text x="218" y="232">Iɢ ≈ 0</text><text x="353" y="78" className="flow-text-collector">Iᴅ</text><text x="340" y="310" className="flow-text-collector">Iѕ = Iᴅ</text>
    <Dots path={upper} model={model} speed={speed} branch="drain" /><Dots path="M390 185H365V235H390" model={model} speed={speed} branch="channel" /><Dots path={lower} model={model} speed={speed} branch="source" />
  </svg>;
}
export function FetCutaway({ kind, channel, model, playing, speed }: { kind: FetKind; channel: FetChannel; model: FetModel; playing: boolean; speed: number }) {
  const ref = usePlayback(playing);
  const width = 4 + 30 * model.channelFraction;
  return <svg ref={ref} viewBox="0 0 600 222" className="cutaway-svg" role="img" aria-label={kind === 'mosfet' ? 'Insulated gate creates a conducting channel' : 'Reverse-biased junction gate narrows the conducting channel'}>
    <text x="50" y="30">SOURCE</text><text x="252" y="30">GATE</text><text x="490" y="30">DRAIN</text>
    <rect x="40" y="103" width="520" height="64" className={channel === 'n' ? 'region-p' : 'region-n'} />
    <rect x="40" y="89" width="95" height="57" className={channel === 'n' ? 'region-n' : 'region-p'} /><rect x="465" y="89" width="95" height="57" className={channel === 'n' ? 'region-n' : 'region-p'} />
    <rect x="135" y={122 - width / 2} width="330" height={width} className={channel === 'n' ? 'region-n' : 'region-p'} />
    <rect x="155" y="53" width="290" height="22" className="region-metal" />
    {kind === 'mosfet' ? <><rect x="155" y="77" width="290" height="13" className="depletion" /><path d="M155 90H445" className="cutaway-boundary" /><text x="258" y="87">OXIDE</text></> : <><rect x="155" y="78" width="290" height={35 - 25 * model.channelFraction} className={channel === 'n' ? 'region-p' : 'region-n'} /><path d={`M155 ${113 - 25 * model.channelFraction}H445`} className="cutaway-boundary" /></>}
    <text x="251" y="69">{model.vgs.toFixed(2)} V · Vɢѕ</text>
    {Array.from({ length: model.dots }, (_, i) => <circle key={i} r="4" className={channel === 'n' ? 'carrier' : 'hole-carrier'} stroke="var(--coral)"><animateMotion path="M60 122H540" dur={`${model.period / speed}s`} begin={`${-i * model.period / speed / model.dots}s`} repeatCount="indefinite" /></circle>)}
    <text x="45" y="195">{channel === 'n' ? 'Electrons' : 'Holes'}: source → drain</text><text x="356" y="195">Gate: field, not a flow</text>
  </svg>;
}
export function FetTransfer({ kind, channel, config, drive, supply }: { kind: FetKind; channel: FetChannel; config: FetConfiguration; drive: number; supply: number }) {
  const min = kind === 'mosfet' ? 0 : -4;
  const max = kind === 'mosfet' ? 5 : 0;
  const points = Array.from({ length: 100 }, (_, i) => {
    const v = min + (max - min) * i / 99;
    const m = fetModel(kind, channel, config, v, supply);
    return `${44 + i * 4.1},${139 - m.id / 16 * 105}`;
  });
  const m = fetModel(kind, channel, config, drive, supply);
  return <svg viewBox="0 0 480 177" className="trace-svg" role="img" aria-label="Drain current versus control voltage with the current operating point">
    {[34, 86, 139].map(y => <path key={y} d={`M44 ${y}H450`} className="trace-grid" />)}
    <text x="6" y="38">16</text><text x="18" y="142">0</text><text x="44" y="20">Iᴅ · mA</text>
    <path d={`M${points.join(' L')}`} className="trace-output" />
    <circle cx={44 + (drive - min) / (max - min) * 405.9} cy={139 - m.id / 16 * 105} r="5" fill="var(--card)" stroke="var(--primary)" strokeWidth="2" />
    <text x="44" y="160">{(min * m.sign).toFixed(0)} V</text><text x="420" y="160">{(max * m.sign).toFixed(0)} V</text><text x="157" y="160">{config === 'gate' ? '−Vѕ (gate = 0)' : 'Gate voltage'} →</text>
  </svg>;
}