import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowDownUp, ArrowLeftRight, ArrowUpRight, Check, ChevronDown, CircleHelp, Cpu, Info, Pause, Play, RotateCcw, Waves, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { Circuit, Cutaway, ResponseTrace } from '@/components/transistor/diagrams';
import { FetLab } from '@/components/transistor/fet-lab';
import { TransistorBuilder } from '@/components/transistor/builder';
import { TEMPLATE_ORDER, type TemplateId } from '@/lib/transistor-builder';
import { configurations, formatCurrent, transistorFlow, transistorModel, type Configuration, type TransistorType } from '@/lib/transistor-model';

export const Route = createFileRoute('/transistors')({
  head: () => ({ meta: [
    { title: 'Transistor Lab — Circuit Playground' },
    { name: 'description', content: 'Explore current-controlled BJTs and voltage-controlled MOSFETs and JFETs with interactive circuits and animated carrier flow.' },
    { property: 'og:title', content: 'Transistor Lab — Circuit Playground' },
    { property: 'og:description', content: 'Compare BJT, MOSFET and JFET operation with adjustable current, gate voltage and animated circuits.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  validateSearch: (s: Record<string, unknown>): TransistorSearch => {
    const out: TransistorSearch = {};
    if (s['view'] === 'bjt' || s['view'] === 'fet' || s['view'] === 'builder') out.view = s['view'];
    if (typeof s['template'] === 'string' && (TEMPLATE_ORDER as string[]).includes(s['template'])) out.template = s['template'] as TemplateId;
    const a = Number(s['a']), b = Number(s['b']);
    if (a === 0 || a === 1) out.a = a;
    if (b === 0 || b === 1) out.b = b;
    return out;
  },
  component: TransistorLab,
});

type TransistorSearch = { view?: 'bjt' | 'fet' | 'builder'; template?: TemplateId; a?: number; b?: number };

function TransistorLab() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const family = search.view ?? 'bjt';
  const setFamily = (view: 'bjt' | 'fet' | 'builder') => { void navigate({ search: view === 'bjt' ? {} : { view }, replace: true }); };
  const [type, setType] = useState<TransistorType>('npn');
  const [config, setConfig] = useState<Configuration>('emitter');
  const [drive, setDrive] = useState(40);
  const [supply, setSupply] = useState(5);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [phase, setPhase] = useState(0);
  const [help, setHelp] = useState(false);
  const model = transistorModel(type, config, drive, supply);
  const flow = transistorFlow(model);
  const selected = configurations[config];
  useEffect(() => {
    if (family !== 'bjt' || !playing || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setPhase(p => p + .075 * speed), 80);
    return () => window.clearInterval(timer);
  }, [family, playing, speed]);
  function changeConfig(next: Configuration) {
    setDrive(value => next === 'base' && config !== 'base' ? value * .101 : next !== 'base' && config === 'base' ? value / .101 : value);
    setConfig(next);
  }
  function reset() { setType('npn'); setConfig('emitter'); setDrive(40); setSupply(5); setSpeed(1); setPlaying(true); setPhase(0); }
  return <>
    <SiteHeader><Button variant="ghost" size="icon" title="About this model" aria-label="About this model" onClick={() => setHelp(!help)}><CircleHelp size={19} /></Button></SiteHeader>
    <main className="shell">
      <div className="lab-heading flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow mb-3 flex items-center gap-2 text-muted-foreground"><span className="text-primary">05</span><span>/</span> THE BUILDING BLOCKS</div><h1>Transistor lab<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">{family === 'builder' ? 'Real parts. Real equations. Your circuit.' : family === 'bjt' ? 'Small current. Big possibilities.' : 'An electric field. A controlled channel.'}</p></div><div className="family-selector" role="group" aria-label="Transistor family"><Button variant="outline" className="layout-option" aria-pressed={family === 'bjt'} onClick={() => setFamily('bjt')}><Cpu size={14} /><span>Bipolar junction transistor</span><span className="ml-auto font-mono text-[10px]">BJT</span></Button><Button variant="outline" className="layout-option" aria-pressed={family === 'fet'} onClick={() => setFamily('fet')}><Waves size={14} /><span>Field-effect transistor</span><span className="ml-auto font-mono text-[10px]">FET</span></Button><Button variant="outline" className="layout-option" aria-pressed={family === 'builder'} onClick={() => setFamily('builder')}><Wrench size={14} /><span>Circuit builder · real parts</span><span className="ml-auto font-mono text-[10px]">BUILD</span></Button></div></div>
      {help && <div className="info-note mb-5" role="note"><strong className="text-foreground">A simplified transistor model.</strong> {family === 'builder' ? 'The builder solves each circuit with real device equations (Ebers–Moll with Early effect for BJTs, square law with channel-length modulation for MOSFETs) using rounded datasheet values for each part.' : family === 'bjt' ? 'Fixed gain β = 100, a 0.7 V junction drop, and a 1 kΩ load. NPN electrons move against conventional current; PNP holes move with it. The waveforms show a small illustrative input variation around the selected drive.' : 'MOSFET and JFET both control drain current using gate–source voltage. This enhancement MOSFET starts off (threshold magnitude 2 V); the JFET starts on (cutoff magnitude 4 V). MOSFETs have insulated gates; JFETs use reverse-biased junction gates. Depletion MOSFETs also exist. Square-law channels and a 1 kΩ load are illustrative; real devices differ.'} The common terminal is the input/output reference. Carrier count and speed are illustrative, not to scale.</div>}
      {family === 'builder' ? <><TransistorBuilder key={`${search.template ?? ''}-${search.a ?? ''}-${search.b ?? ''}`} initialTemplate={search.template ?? 'bjt-switch'} initialA={search.a} initialB={search.b} /><footer className="footer"><span className="flex items-center gap-1.5"><Info size={12} /> Ebers–Moll BJT and square-law MOSFET models · datasheet-typical part values</span><span><Link to="/logic-gates" className="mr-3 text-primary hover:underline">Logic gates →</Link>circuit.playground / 05</span></footer></> : family === 'fet' ? <FetLab /> : <><div className="lab-grid">
        <section className="workspace" aria-label="Circuit workspace">
          <div className="workspace-head"><div className="flex items-center gap-2.5"><span className="eyebrow text-muted-foreground">LIVE CIRCUIT</span><span className="text-xs text-muted-foreground">/</span><span className="text-xs font-medium">{selected.name}</span></div><span className="live-status"><span className="legend-dot" />{playing ? 'Running' : 'Paused'}</span></div>
          <div className="circuit-space"><div className="absolute left-5 top-4 status-badge"><span className="legend-dot" />{model.state === 'Active' ? 'ACTIVE REGION' : model.state.toUpperCase()}</div><Circuit type={type} config={config} model={model} supply={supply} speed={speed} playing={playing} /></div>
          <div className="circuit-footer"><div className="flex items-center gap-2 text-[11px] text-muted-foreground"><span className="legend-dot flow-collector" />I꜀<span className="legend-dot flow-base ml-2" />Iᵦ<span className="ml-2 inline-flex gap-0.5"><span className="legend-dot flow-collector" /><span className="legend-dot flow-base" /></span>Iₑ = I꜀ + Iᵦ<span className="ml-2">Conventional current</span> <ArrowUpRight size={12} /><span className="ml-1 font-mono text-[10px]">{type.toUpperCase()}</span></div><div className="flex items-center gap-1"><Button size="icon" variant="ghost" title={playing ? 'Pause animation' : 'Play animation'} aria-label={playing ? 'Pause animation' : 'Play animation'} onClick={() => setPlaying(!playing)}>{playing ? <Pause /> : <Play />}</Button><div className="relative flex items-center"><select aria-label="Animation speed" className="appearance-none rounded-md bg-secondary py-1.5 pl-3 pr-7 text-xs font-mono" value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select><ChevronDown size={12} className="pointer-events-none absolute right-2 text-muted-foreground" /></div><Button size="icon" variant="ghost" title="Reset lab" aria-label="Reset lab" onClick={reset}><RotateCcw /></Button></div></div>
          <div className="panel-note"><Info size={13} className="shrink-0" /><span>Illustrative dot ratio: {flow.base} base + {flow.collector} collector = {flow.emitter} emitter. Active-region gain β = 100 is compressed to 10:1; saturation reduces the collector share.</span></div>
          <div className="readouts" aria-live="polite">{[{ name: 'BASE CURRENT', symbol: 'Iᵦ', amount: model.ib }, { name: 'COLLECTOR CURRENT', symbol: 'I꜀', amount: model.ic }, { name: 'EMITTER CURRENT', symbol: 'Iₑ', amount: model.ie }].map(item => { const formatted = formatCurrent(item.amount); return <div className="readout" key={item.symbol}><div className="eyebrow text-muted-foreground" style={{ letterSpacing: .6, fontSize: 9 }}>{item.name}</div><div className="readout-value"><span className="mr-2 text-xs text-muted-foreground">{item.symbol}</span>{formatted.value} <span className="readout-unit">{formatted.unit}</span></div></div>; })}</div>
        </section>
        <aside className="controls" aria-label="Transistor controls">
          <div className="eyebrow mb-6 flex items-center gap-2 text-muted-foreground"><SlidersIcon /> EXPERIMENT CONTROLS</div>
          <div className="control-group"><div className="control-label">Transistor type <span className="font-mono text-[10px] text-muted-foreground">01</span></div><div className="segment">{(['npn','pnp'] as const).map(t => <Button key={t} variant="ghost" size="sm" aria-pressed={type === t} onClick={() => setType(t)}><ArrowDownUp size={12} />{t.toUpperCase()}</Button>)}</div></div>
          <div className="control-group"><div className="control-label">Circuit arrangement <span className="font-mono text-[10px] text-muted-foreground">02</span></div><div className="layout-options">{(Object.keys(configurations) as Configuration[]).map(c => <Button key={c} variant="outline" className="layout-option" aria-pressed={config === c} onClick={() => changeConfig(c)}><span className="radio" />{configurations[c].name}<span className="ml-auto font-mono text-[10px] opacity-60">{configurations[c].abbreviation}</span></Button>)}</div></div>
          <div className="control-divider" />
          <div className="control-group"><label htmlFor="input-drive" className="control-label">{selected.input}<output className="value-pill">{drive.toFixed(config === 'base' ? 2 : 0)} {selected.unit}</output></label><input id="input-drive" className="range" type="range" min="0" max={selected.maxDrive} step={config === 'base' ? .01 : 1} value={drive} onChange={e => setDrive(Number(e.target.value))} /><div className="range-ends"><span>0 {selected.unit}</span><span>{selected.maxDrive} {selected.unit}</span></div></div>
          <div className="control-group"><label htmlFor="supply-voltage" className="control-label">Supply voltage<output className="value-pill">{type === 'pnp' ? '−' : '+'}{supply.toFixed(1)} V</output></label><input id="supply-voltage" className="range" type="range" min="0" max="12" step="0.1" value={supply} onChange={e => setSupply(Number(e.target.value))} /><div className="range-ends"><span>0 V</span><span>12 V</span></div></div>
          <div className="control-divider" /><div className="info-note flex gap-2"><Info size={14} className="mt-0.5 shrink-0 text-primary" /><span>{selected.observation}</span></div>
        </aside>
      </div>
      <div className="lower-grid">
        <section><div className="section-top"><h2 className="flex items-center gap-2"><Cpu size={16} className="text-muted-foreground" /> Inside the transistor</h2><span className="text-[10px] text-muted-foreground font-mono">{type.toUpperCase()} STRUCTURE</span></div><div className="figure-panel"><Cutaway type={type} model={model} playing={playing} speed={speed} /><div className="panel-note"><span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-carrier" /><span>{type === 'npn' ? 'Electrons travel from emitter to collector, opposite to conventional current.' : 'Holes travel from emitter to collector, in the same direction as conventional current.'} The base is deliberately thin.</span></div></div></section>
        <section><div className="section-top"><h2 className="flex items-center gap-2"><Waves size={16} className="text-muted-foreground" /> Signal response</h2><div className="flex gap-3 text-[10px] text-muted-foreground"><span className="flex items-center gap-1.5"><span className="h-1 w-3 bg-carrier" />Input</span><span className="flex items-center gap-1.5"><span className="h-1 w-3 bg-primary" />Output</span></div></div><div className="figure-panel"><div className="flex items-center justify-between px-5 pt-4 text-[11px]"><span className="text-muted-foreground">{config === 'base' ? 'Emitter voltage → collector voltage' : config === 'collector' ? 'Base voltage → emitter voltage' : 'Base drive → collector voltage'}</span><span className="text-primary font-mono">{selected.response}</span></div><ResponseTrace type={type} config={config} drive={drive} supply={supply} phase={phase} /><div className="response-footer"><span className="flex items-center gap-1.5 text-muted-foreground"><ArrowLeftRight size={13} /> {selected.shared} is the common terminal</span><span className="font-mono text-primary">{config === 'base' ? 'α ≈ 0.99' : 'β = 100'}</span></div><div className="panel-note"><Info size={13} className="shrink-0" /><span>{model.saturated ? 'Supply and load limit the output. More input drive no longer gives proportional amplification.' : model.state === 'Cutoff' ? 'No conduction: increase the input drive and use a supply above 0.7 V.' : config === 'emitter' ? 'As base drive rises, collector voltage falls: the output is inverted.' : config === 'base' ? 'A rising emitter voltage reduces current and raises collector voltage.' : 'The emitter follows the base voltage, approximately 0.7 V behind it.'}</span></div></div></section>
      </div>
      <footer className="footer"><span className="flex items-center gap-1.5"><Info size={12} /> Simplified educational model · β = 100 · 1 kΩ load · carrier motion not to scale</span><span className="flex items-center gap-1.5"><Check size={12} className="text-primary" /> Iₑ = Iᵦ + I꜀ <span className="mx-2 text-border">|</span> <Link to="/theory" className="mr-3 text-primary hover:underline">Theory →</Link>circuit.playground / 05</span></footer>
      </>}
    </main>
  </>;
}
function SlidersIcon() { return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="M3 2v12M8 2v12M13 2v12M1 5h4M6 11h4M11 6h4" /></svg>; }
