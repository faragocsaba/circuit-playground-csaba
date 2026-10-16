import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Activity, GitFork, Info, Repeat, Palette, Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { ColorCode, OhmPlot, ResistorCircuit } from '@/components/resistor/diagrams';
import { defaultResistorSettings, formatOhms, kirchhoff, resistorModel, type Arrangement, type ResistorSettings } from '@/lib/resistor-model';

export const Route = createFileRoute('/resistors')({
  head: () => ({ meta: [
    { title: 'Resistor Lab — Circuit Playground' },
    { name: 'description', content: 'Explore Ohm\'s law with single, series and parallel resistors, animated current, color codes and a live V–I graph.' },
    { property: 'og:title', content: 'Resistor Lab — Circuit Playground' },
    { property: 'og:description', content: 'See how resistors share voltage and current in an interactive circuit.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: ResistorLab,
});

const arrangements: Record<Arrangement, string> = { single: 'Single resistor', series: 'Series', parallel: 'Parallel' };
function RangeControl({ id, label, value, display, min, max, step, onChange }: { id: string; label: string; value: number; display: string; min: number; max: number; step: number; onChange: (n: number) => void }) {
  return <div className="control-group"><label htmlFor={id} className="control-label">{label}<output className="value-pill">{display}</output></label><input id={id} className="range" type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} /></div>;
}

function ResistorLab() {
  const [settings, setSettings] = useState<ResistorSettings>(defaultResistorSettings);
  const [playing, setPlaying] = useState(true);
  const [phase, setPhase] = useState(0);
  const m = resistorModel(settings);
  const k = kirchhoff(settings);
  const update = (patch: Partial<ResistorSettings>) => setSettings(s => ({ ...s, ...patch }));
  useEffect(() => {
    if (!playing || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setPhase(p => p + 0.08), 50);
    return () => window.clearInterval(timer);
  }, [playing]);
  const two = settings.arrangement !== 'single';
  const note = settings.arrangement === 'series' ? 'Series: the same current flows through both resistors, and the source voltage is shared in proportion to resistance.'
    : settings.arrangement === 'parallel' ? 'Parallel: both resistors see the full voltage. Current splits, and more flows through the smaller resistor. The total is always smaller than either one.'
      : 'Ohm\'s law: current equals voltage divided by resistance. Double the voltage and the current doubles.';
  const readouts: [string, string, string][] = [['TOTAL RESISTANCE', formatOhms(m.total), ''], ['CURRENT', m.current.toFixed(2), 'mA'], ['POWER', m.power.toFixed(1), 'mW'],
    ...(two ? [[settings.arrangement === 'series' ? 'V₁ / V₂' : 'I₁ / I₂', settings.arrangement === 'series' ? `${m.v1.toFixed(2)} / ${m.v2.toFixed(2)}` : `${m.i1.toFixed(1)} / ${m.i2.toFixed(1)}`, settings.arrangement === 'series' ? 'V' : 'mA'] as [string, string, string]] : [])];
  return <>
    <SiteHeader />
    <main className="shell">
      <div className="lab-heading"><div className="eyebrow mb-3 flex items-center gap-2 text-muted-foreground"><span className="text-primary">01</span><span>/</span> THE BUILDING BLOCKS</div><h1>Resistor lab<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">Limit the flow. Share the voltage.</p></div>
      <div className="lab-grid">
        <section className="workspace" aria-label="Resistor circuit workspace">
          <div className="workspace-head"><div className="flex items-center gap-2.5"><span className="eyebrow text-muted-foreground">LIVE CIRCUIT</span><span className="text-xs text-muted-foreground">/</span><span className="text-xs font-medium">{arrangements[settings.arrangement]}</span></div><span className="live-status"><span className="legend-dot" />{playing ? 'Running' : 'Paused'}</span></div>
          <div className="circuit-space"><ResistorCircuit settings={settings} phase={phase} /></div>
          <div className="circuit-footer"><div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground"><span className="legend-dot" />I total{settings.arrangement === 'parallel' && <><span className="legend-dot flow-collector ml-2" />I₁<span className="legend-dot flow-base ml-2" />I₂</>}<span className="ml-2">Conventional current</span></div><div className="flex items-center gap-1"><Button variant="ghost" size="icon" aria-label={playing ? 'Pause animation' : 'Play animation'} title={playing ? 'Pause animation' : 'Play animation'} onClick={() => setPlaying(!playing)}>{playing ? <Pause /> : <Play />}</Button><Button variant="ghost" size="icon" aria-label="Reset lab" title="Reset lab" onClick={() => setSettings(defaultResistorSettings)}><RotateCcw /></Button></div></div>
          <div className={`readouts ${two ? 'readouts-led capacitor-readouts' : ''}`} aria-live="polite">{readouts.map(([l, v, u]) => <div className="readout" key={l}><div className="eyebrow text-muted-foreground" style={{ fontSize: 9, letterSpacing: 0.6 }}>{l}</div><div className="readout-value">{v} <span className="readout-unit">{u}</span></div></div>)}</div>
        </section>
        <aside className="controls" aria-label="Resistor controls">
          <div className="eyebrow mb-6 text-muted-foreground">EXPERIMENT CONTROLS</div>
          <div className="control-group"><div className="control-label">Arrangement</div><div className="layout-options">{(Object.keys(arrangements) as Arrangement[]).map(a => <Button key={a} variant="outline" className="layout-option" aria-pressed={settings.arrangement === a} onClick={() => update({ arrangement: a })}><span className="radio" />{arrangements[a]}</Button>)}</div></div>
          <div className="control-divider" />
          <RangeControl id="resistor-voltage" label="Source voltage" value={settings.voltage} display={`${settings.voltage.toFixed(1)} V`} min={0} max={12} step={0.1} onChange={voltage => update({ voltage })} />
          <RangeControl id="resistor-r1" label="Resistor R₁" value={settings.r1} display={formatOhms(settings.r1)} min={100} max={4700} step={10} onChange={r1 => update({ r1 })} />
          {two && <RangeControl id="resistor-r2" label="Resistor R₂" value={settings.r2} display={formatOhms(settings.r2)} min={100} max={4700} step={10} onChange={r2 => update({ r2 })} />}
          <div className="control-divider" /><div className="info-note flex gap-2"><Info size={14} className="mt-0.5 shrink-0 text-primary" /><span>{note}</span></div>
        </aside>
      </div>
      <div className="lower-grid">
        <section><div className="section-top"><h2 className="flex items-center gap-2"><Palette size={16} className="text-muted-foreground" /> Color code</h2><span className="text-[10px] text-muted-foreground font-mono">4-BAND</span></div><div className="figure-panel"><div className="p-4"><ColorCode ohms={settings.r1} label={`R₁ ${formatOhms(settings.r1)}`} />{two && <ColorCode ohms={settings.r2} label={`R₂ ${formatOhms(settings.r2)}`} />}</div><div className="panel-note"><Info size={13} className="shrink-0" /><span>First two bands are digits, the third is the number of zeros, gold means ±5% tolerance.</span></div></div></section>
        <section><div className="section-top"><h2 className="flex items-center gap-2"><Activity size={16} className="text-muted-foreground" /> Current vs. voltage</h2><span className="text-[10px] text-muted-foreground font-mono">I = V / R</span></div><div className="figure-panel"><OhmPlot settings={settings} /><div className="panel-note"><Info size={13} className="shrink-0" /><span>A resistor gives a straight line: steeper means less resistance. The dot is your working point.</span></div></div></section>
      </div>
      <div className="lower-grid">
        <section><div className="section-top"><h2 className="flex items-center gap-2"><GitFork size={16} className="text-muted-foreground" /> Kirchhoff 1 · junction rule</h2><span className="text-[10px] text-muted-foreground font-mono">ΣI in = ΣI out</span></div><div className="figure-panel"><div className="p-5 font-mono text-sm leading-7">{settings.arrangement === 'parallel'
          ? <><div>I = I₁ + I₂</div><div className="text-primary">{k.kcl.into.toFixed(2)} mA = {k.kcl.out[0]!.toFixed(2)} + {k.kcl.out[1]!.toFixed(2)} mA</div></>
          : <><div>I in = I out</div><div className="text-primary">{k.kcl.into.toFixed(2)} mA = {k.kcl.out[0]!.toFixed(2)} mA</div></>}</div><div className="panel-note"><Info size={13} className="shrink-0" /><span>{settings.arrangement === 'parallel' ? 'Charge is never lost: the current arriving at the junction splits, and the branch dots add back up to the total.' : 'With no junction, there is nowhere else to go: the same current flows everywhere in the loop. Choose Parallel to see a real split.'}</span></div></div></section>
        <section><div className="section-top"><h2 className="flex items-center gap-2"><Repeat size={16} className="text-muted-foreground" /> Kirchhoff 2 · loop rule</h2><span className="text-[10px] text-muted-foreground font-mono">ΣV around a loop = 0</span></div><div className="figure-panel"><div className="p-5 font-mono text-sm leading-7">{k.loops.map((l, i) => <div key={i}><span className="text-muted-foreground">{k.loops.length > 1 ? `Loop ${i + 1}: ` : ''}</span>{l.source.toFixed(2)} V − {l.drops.map((d, j) => `${d.toFixed(2)} V`).join(' − ')} = <span className="text-primary">{(l.source - l.drops.reduce((a, b) => a + b, 0)).toFixed(2)} V</span><span className="text-muted-foreground text-xs"> ({k.loops.length > 1 ? `through R${i + 1}` : settings.arrangement === 'series' ? 'V₁ + V₂' : 'V₁'})</span></div>)}</div><div className="panel-note"><Info size={13} className="shrink-0" /><span>{settings.arrangement === 'parallel' ? 'Each branch forms its own loop, so each resistor drops the full source voltage.' : 'Energy is conserved: walk once around the loop and the voltage the source gives is used up exactly by the resistors.'}</span></div></div></section>
      </div>
      <footer className="footer"><span className="flex items-center gap-1.5"><Info size={12} /> Ideal resistors · no temperature effects · motion not to scale</span><span>circuit.playground / 01</span></footer>
    </main>
  </>;
}
