import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ChevronDown, Cpu, Info, Pause, Play, RotateCcw, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { DiodeCircuit, IVPlot, Junction } from '@/components/diode/diagrams';
import { DiodeComparison } from '@/components/diode/comparison';
import { diodeModel, diodes, ledForward, type DiodeKind, type LedColor } from '@/lib/diode-model';

export const Route = createFileRoute('/diodes')({
  head: () => ({ meta: [
    { title: 'Diode Lab — Circuit Playground' },
    { name: 'description', content: 'Explore rectifier, Schottky, LED and Zener diodes with interactive circuits, animated junctions and overlaid current–voltage comparisons.' },
    { property: 'og:title', content: 'Diode Lab — Circuit Playground' },
    { property: 'og:description', content: 'Compare diode current–voltage curves and see how rectifier, Schottky, LED and Zener diodes behave.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: DiodeLab,
});

function DiodeLab() {
  const [view, setView] = useState<'lab' | 'comparison'>('lab');
  const [kind, setKind] = useState<DiodeKind>('rectifier');
  const [color, setColor] = useState<LedColor>('red');
  const [source, setSource] = useState(5);
  const [resistance, setResistance] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const model = diodeModel(kind, source, resistance, color);
  function reset() { setKind('rectifier'); setColor('red'); setSource(5); setResistance(1); setSpeed(1); setPlaying(true); }
  const note = model.state === 'Forward' ? `Forward biased: the diode keeps about ${model.vf.toFixed(1)} V; the resistor takes the rest and sets the current.`
    : model.state === 'Breakdown' ? 'Reverse breakdown: the Zener holds its voltage while extra current flows backwards.'
    : model.state === 'Blocking' ? 'Reverse biased: the depletion zone widens and blocks current.'
    : `Not enough voltage yet: raise the source above ${model.vf.toFixed(1)} V.`;
  return <>
    <SiteHeader />
    <main className="shell">
      <div className="lab-heading flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow mb-3 flex items-center gap-2 text-muted-foreground"><span className="text-primary">04</span><span>/</span> THE BUILDING BLOCKS</div><h1>Diode lab<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">Current that only goes one way — mostly.</p></div><div className="segment" aria-label="Diode view"><Button variant="ghost" size="sm" aria-pressed={view === 'lab'} onClick={() => setView('lab')}>Circuit lab</Button><Button variant="ghost" size="sm" aria-pressed={view === 'comparison'} onClick={() => setView('comparison')}>Compare curves</Button></div></div>
      {view === 'comparison' ? <DiodeComparison /> : <>
      <div className="lab-grid">
        <section className="workspace" aria-label="Circuit workspace">
          <div className="workspace-head"><div className="flex items-center gap-2.5"><span className="eyebrow text-muted-foreground">LIVE CIRCUIT</span><span className="text-xs text-muted-foreground">/</span><span className="text-xs font-medium">{diodes[kind].name}</span></div><span className="live-status"><span className="legend-dot" />{playing ? 'Running' : 'Paused'}</span></div>
          <div className="circuit-space"><div className="absolute left-5 top-4 status-badge"><span className="legend-dot" />{model.state.toUpperCase()}</div><DiodeCircuit kind={kind} model={model} color={color} source={source} resistance={resistance} speed={speed} playing={playing} /></div>
          <div className="circuit-footer"><div className="flex items-center gap-2 text-[11px] text-muted-foreground"><span className="legend-dot" />Conventional current</div><div className="flex items-center gap-1"><Button size="icon" variant="ghost" aria-label={playing ? 'Pause animation' : 'Play animation'} onClick={() => setPlaying(!playing)}>{playing ? <Pause /> : <Play />}</Button><div className="relative flex items-center"><select aria-label="Animation speed" className="appearance-none rounded-md bg-secondary py-1.5 pl-3 pr-7 text-xs font-mono" value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select><ChevronDown size={12} className="pointer-events-none absolute right-2 text-muted-foreground" /></div><Button size="icon" variant="ghost" aria-label="Reset lab" onClick={reset}><RotateCcw /></Button></div></div>
          <div className={kind === 'led' ? 'readouts readouts-led' : 'readouts'} aria-live="polite">
            <div className="readout"><div className="eyebrow text-muted-foreground" style={{ fontSize: 9 }}>CURRENT</div><div className="readout-value">{model.current.toFixed(2)} <span className="readout-unit">mA</span></div></div>
            <div className="readout"><div className="eyebrow text-muted-foreground" style={{ fontSize: 9 }}>DIODE VOLTAGE</div><div className="readout-value">{model.vd.toFixed(2)} <span className="readout-unit">V</span></div></div>
            <div className="readout"><div className="eyebrow text-muted-foreground" style={{ fontSize: 9 }}>DIODE POWER</div><div className="readout-value">{model.power.toFixed(1)} <span className="readout-unit">mW</span></div></div>
            {kind === 'led' && <div className="readout"><div className="eyebrow text-muted-foreground" style={{ fontSize: 9 }}>BRIGHTNESS</div><div className="readout-value">{Math.round(model.brightness * 100)} <span className="readout-unit">%</span></div><div className="brightness-bar" aria-hidden="true"><span style={{ width: `${Math.round(model.brightness * 100)}%`, background: `var(--led-${color})` }} /></div></div>}
          </div>
        </section>
        <aside className="controls" aria-label="Diode controls">
          <div className="eyebrow mb-6 text-muted-foreground">EXPERIMENT CONTROLS</div>
          <div className="control-group"><div className="control-label">Diode type</div><div className="layout-options">{(Object.keys(diodes) as DiodeKind[]).map(k => <Button key={k} variant="outline" className="layout-option" aria-pressed={kind === k} onClick={() => setKind(k)}><span className="radio" />{diodes[k].name}<span className="ml-auto font-mono text-[10px] opacity-60">{diodes[k].abbreviation}</span></Button>)}</div></div>
          {kind === 'led' && <div className="control-group"><div className="control-label">LED color</div><div className="segment led-color-segment" aria-label="LED color">{(Object.keys(ledForward) as LedColor[]).map(c => <Button key={c} variant="ghost" size="sm" aria-label={`${c} · ${ledForward[c]} V`} aria-pressed={color === c} onClick={() => setColor(c)}><span className="flex items-center gap-1.5"><span className="legend-dot shrink-0" style={{ background: `var(--led-${c})` }} />{c}</span><span className="font-mono text-[10px] text-muted-foreground">{ledForward[c]} V</span></Button>)}</div></div>}
          <div className="control-divider" />
          <div className="control-group"><label htmlFor="source-voltage" className="control-label">Source voltage<output className="value-pill">{source > 0 ? '+' : ''}{source.toFixed(1)} V</output></label><input id="source-voltage" className="range" type="range" min="-12" max="12" step="0.1" value={source} onChange={e => setSource(Number(e.target.value))} /><div className="range-ends"><span>−12 V reverse</span><span>+12 V forward</span></div></div>
          <div className="control-group"><label htmlFor="resistance" className="control-label">Series resistor<output className="value-pill">{resistance.toFixed(1)} kΩ</output></label><input id="resistance" className="range" type="range" min="0.2" max="5" step="0.1" value={resistance} onChange={e => setResistance(Number(e.target.value))} /><div className="range-ends"><span>0.2 kΩ</span><span>5 kΩ</span></div></div>
          <div className="control-divider" /><div className="info-note flex gap-2"><Info size={14} className="mt-0.5 shrink-0 text-primary" /><span>{diodes[kind].observation}</span></div>
        </aside>
      </div>
      <div className="lower-grid">
        <section><div className="section-top"><h2 className="flex items-center gap-2"><Cpu size={16} className="text-muted-foreground" /> Inside the junction</h2><span className="text-[10px] text-muted-foreground font-mono">{kind === 'schottky' ? 'METAL–N' : 'P–N'} JUNCTION</span></div><div className="figure-panel"><Junction kind={kind} model={model} color={color} speed={speed} playing={playing} /><div className="panel-note"><Info size={13} className="shrink-0" /><span>{note}</span></div></div></section>
        <section><div className="section-top"><h2 className="flex items-center gap-2"><Activity size={16} className="text-muted-foreground" /> Current vs. voltage</h2><span className="text-[10px] text-muted-foreground font-mono">● operating point</span></div><div className="figure-panel"><IVPlot kind={kind} model={model} color={color} /><div className="panel-note"><Info size={13} className="shrink-0" /><span>{kind === 'zener' ? 'Flat in reverse until −5.1 V, then a sharp downward knee: the breakdown region.' : 'Almost no current until the knee, then current rises steeply. In reverse it stays near zero.'}</span></div></div></section>
      </div>
      </>}
      <footer className="footer"><span className="flex items-center gap-1.5"><Info size={12} /> Simplified educational model · ideal knee voltage · carrier motion not to scale</span><span><Link to="/theory" className="mr-3 text-primary hover:underline">Theory →</Link>circuit.playground / 04</span></footer>
    </main>
  </>;
}
