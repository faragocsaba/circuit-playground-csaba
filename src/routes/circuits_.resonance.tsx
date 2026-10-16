import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Activity, ChevronDown, Info, Pause, Play, RotateCcw, Target, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { InductorCircuit, InductorTrace, ResonanceCurve } from '@/components/inductor/diagrams';
import { acResponse, advance, defaultInductorSettings, initialState, qualityFactor, resonantFrequency, sample as read, type InductorSample, type InductorSettings, type InductorState } from '@/lib/inductor-model';

export const Route = createFileRoute('/circuits/resonance')({
  head: () => ({ meta: [
    { title: 'Resonance — Circuit Playground' },
    { name: 'description', content: 'Drive a series RLC circuit with AC and find the frequency where the coil and capacitor cancel: the resonance peak, live.' },
    { property: 'og:title', content: 'Resonance — Circuit Playground' },
    { property: 'og:description', content: 'Series RLC resonance: tune the frequency and watch the current peak.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: ResonanceLab,
});

interface Lab { settings: InductorSettings; state: InductorState; history: InductorSample[]; motion: number }
const start: InductorSettings = { ...defaultInductorSettings, mode: 'rlc' };
function fresh(settings: InductorSettings): Lab { const state = initialState(settings); return { settings, state, history: [read(settings, state)], motion: 0 }; }
const WINDOW = 6;
function step(lab: Lab, dt: number): Lab {
  let { state, motion } = lab; const added: InductorSample[] = [];
  for (let k = 0; k < 4; k++) {
    state = advance(lab.settings, state, dt / 4);
    const s = read(lab.settings, state); added.push(s);
    motion += Math.sign(s.current) * Math.min(3, Math.abs(s.current) / 80) * dt / 4;
  }
  return { ...lab, state, motion, history: [...lab.history.filter(s => s.time >= state.time - WINDOW), ...added] };
}
function RangeControl({ id, label, value, unit, min, max, step, onChange }: { id: string; label: string; value: number; unit: string; min: number; max: number; step: number; onChange: (n: number) => void }) {
  return <div className="control-group"><label htmlFor={id} className="control-label">{label}<output className="value-pill">{step < 1 ? value.toFixed(1) : value} {unit}</output></label><input id={id} className="range" type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} /><div className="range-ends"><span>{min} {unit}</span><span>{max} {unit}</span></div></div>;
}

const DEFAULT_SPEED = 0.5;

function ResonanceLab() {
  const [lab, setLab] = useState(() => fresh(start));
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const { settings, state, history, motion } = lab;
  const s = read(settings, state);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setLab(p => step(p, 0.04 * speed)), 40);
    return () => window.clearInterval(timer);
  }, [playing, speed]);
  const update = (patch: Partial<InductorSettings>) => setLab(p => ({ ...p, settings: { ...p.settings, ...patch } }));
  const ac = acResponse(settings); const f0 = resonantFrequency(settings);
  const fieldScale = Math.max(1, (settings.voltage / settings.resistance) * 1000);
  const status = Math.abs(settings.frequency - f0) < 0.08 ? 'At resonance' : 'Driven';
  const readouts: [string, string, string][] = [
    ['CURRENT', s.current.toFixed(1), 'mA'], ['IMPEDANCE', ac.impedance.toFixed(0), 'Ω'],
    ['COIL VOLTAGE', s.vL.toFixed(2), 'V'], ['CAPACITOR VOLTAGE', s.vC.toFixed(2), 'V'],
  ];
  return <>
    <SiteHeader />
    <main className="shell">
      <div className="lab-heading"><div className="eyebrow mb-3 flex items-center gap-2 text-muted-foreground"><span className="text-primary">06</span><span>/</span> CIRCUITS</div><h1>Resonance<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">The frequency where the coil and capacitor cancel.</p></div>
      <div className="lab-grid">
        <section className="workspace" aria-label="Resonance circuit workspace">
          <div className="workspace-head"><div className="flex items-center gap-2.5"><span className="eyebrow text-muted-foreground">LIVE CIRCUIT</span><span className="text-xs text-muted-foreground">/</span><span className="text-xs font-medium">Series RLC</span></div><span className="live-status"><span className="legend-dot" />{playing ? 'Running' : 'Paused'}</span></div>
          <div className="circuit-space"><div className="absolute left-5 top-4 status-badge"><span className="legend-dot" />{status.toUpperCase()}</div><InductorCircuit settings={settings} sample={s} motion={motion} fieldScale={fieldScale} /></div>
          <div className="circuit-footer"><div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground"><span className="flex items-center gap-2"><span className="legend-dot" />Conventional current</span><span className="flex items-center gap-2"><i className="capacitor-source-key inline-block h-0.5 w-3" />Magnetic field</span><output aria-label="Elapsed simulation time" className="font-mono">{s.time.toFixed(1)} s</output></div><div className="flex items-center gap-1"><Button variant="ghost" size="icon" title={playing ? 'Pause animation' : 'Play animation'} aria-label={playing ? 'Pause animation' : 'Play animation'} onClick={() => setPlaying(!playing)}>{playing ? <Pause /> : <Play />}</Button><div className="relative"><select aria-label="Animation speed" className="appearance-none rounded-md bg-secondary py-1.5 pl-3 pr-7 text-xs font-mono" value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value={0.25}>0.25×</option><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select><ChevronDown size={12} className="pointer-events-none absolute right-2 top-2 text-muted-foreground" /></div><Button variant="ghost" size="icon" title="Reset lab" aria-label="Reset lab" onClick={() => { setLab(fresh(start)); setSpeed(DEFAULT_SPEED); }}><RotateCcw /></Button></div></div>
          <div className="readouts readouts-led capacitor-readouts" aria-live="polite">{readouts.map(([l, v, u]) => <div className="readout" key={l}><div className="eyebrow text-muted-foreground">{l}</div><div className="readout-value">{v} <span className="readout-unit">{u}</span></div></div>)}</div>
        </section>
        <aside className="controls" aria-label="Resonance controls">
          <div className="eyebrow mb-6 text-muted-foreground">EXPERIMENT CONTROLS</div>
          <div className="control-group"><Button variant="outline" className="w-full" disabled={f0 > 5 || f0 < 0.2} onClick={() => update({ frequency: Math.round(f0 * 10) / 10 })}><Target /> Tune to resonance ({f0.toFixed(2)} Hz)</Button></div>
          <RangeControl id="res-voltage" label="Peak source voltage" unit="V" value={settings.voltage} min={1} max={12} step={0.5} onChange={voltage => update({ voltage })} />
          <RangeControl id="res-frequency" label="Frequency" unit="Hz" value={settings.frequency} min={0.2} max={5} step={0.1} onChange={frequency => update({ frequency })} />
          <RangeControl id="res-resistance" label="Series resistor" unit="Ω" value={settings.resistance} min={5} max={100} step={1} onChange={resistance => update({ resistance })} />
          <RangeControl id="res-inductance" label="Inductance" unit="H" value={settings.inductance} min={1} max={20} step={1} onChange={inductance => update({ inductance })} />
          <RangeControl id="res-capacitance" label="Capacitance" unit="µF" value={settings.capacitance} min={100} max={5000} step={100} onChange={capacitance => update({ capacitance })} />
          <div className="control-divider" /><div className="info-note flex gap-2"><Info size={14} className="mt-0.5 shrink-0 text-primary" /><span>f₀ = 1 ÷ (2π√LC) = {f0.toFixed(2)} Hz. Quality factor Q = {qualityFactor(settings).toFixed(1)}: higher Q, sharper peak.</span></div>
        </aside>
      </div>
      <div className="lower-grid">
        <section><div className="section-top"><h2 className="flex items-center gap-2"><Activity size={16} className="text-muted-foreground" /> Voltage &amp; current</h2><span className="text-[10px] text-muted-foreground font-mono">LAST {WINDOW} s</span></div><div className="figure-panel"><div className="capacitor-trace-legend"><span><i className="capacitor-source-key" />Source</span><span><i className="capacitor-voltage-key" />Capacitor</span><span><i className="capacitor-current-key" />Current</span></div><InductorTrace history={history} window={WINDOW} showCap /><div className="panel-note"><Info size={13} className="shrink-0" /><span>X_L = {ac.xL.toFixed(0)} Ω · X_C = {ac.xC.toFixed(0)} Ω · current {ac.phase >= 0 ? 'leads' : 'lags'} source by {Math.abs(ac.phase).toFixed(0)}° once settled.</span></div></div></section>
        <section><div className="section-top"><h2 className="flex items-center gap-2"><Waves size={16} className="text-muted-foreground" /> Resonance curve</h2><span className="text-[10px] text-muted-foreground font-mono">PEAK CURRENT vs FREQUENCY</span></div><div className="figure-panel"><ResonanceCurve settings={settings} /><div className="panel-note"><Info size={13} className="shrink-0" /><span>Settled peak current {ac.peakCurrent.toFixed(1)} mA at {settings.frequency.toFixed(1)} Hz. Lower the resistor to make the peak taller and narrower. After a change, give the swing a few seconds to settle.</span></div></div></section>
      </div>
      <footer className="footer"><span className="flex items-center gap-1.5"><Info size={12} /> Ideal coil · no core losses · large values chosen so motion is visible</span><span><Link to="/theory" hash="inductor-energy" className="mr-3 text-primary hover:underline">Theory →</Link>circuit.playground / 06</span></footer>
    </main>
  </>;
}
