import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Activity, ChevronDown, Info, Pause, Play, RotateCcw, SkipForward, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { CapacitorCircuit, CapacitorPlates, CapacitorTrace } from '@/components/capacitor/diagrams';
import { CapacitorHelper } from '@/components/capacitor/helper';
import { snapshotCapacitor } from '@/lib/capacitor-context';
import { acResponse, advanceCapacitor, capacitorSample, defaultCapacitorSettings, timeConstant, type CapacitorSettings } from '@/lib/capacitor-model';

export const Route = createFileRoute('/capacitors')({
  head: () => ({ meta: [
    { title: 'Capacitor Lab — Circuit Playground' },
    { name: 'description', content: 'Explore capacitor charging and discharging with DC and AC sources, animated plates and live RC voltage and current graphs.' },
    { property: 'og:title', content: 'Capacitor Lab — Circuit Playground' },
    { property: 'og:description', content: 'Experiment with stored charge, RC timing and alternating current in an interactive capacitor circuit.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: CapacitorLab,
});

function initialLab() {
  const sample = capacitorSample(defaultCapacitorSettings, 0, 0);
  return { settings: { ...defaultCapacitorSettings }, sample, history: [sample], motion: 0 };
}
type Lab = ReturnType<typeof initialLab>;
function stepLab(lab: Lab, dt: number): Lab {
  const sample = advanceCapacitor(lab.settings, lab.sample.time, lab.sample.voltage, dt);
  const average = (sample.current + lab.sample.current) / 2;
  return { ...lab, sample, history: [...lab.history.filter(s => s.time >= sample.time - 12), sample],
    motion: lab.motion + Math.sign(average) * Math.min(3, Math.abs(average)) * dt };
}
function RangeControl({ id, label, value, unit, min, max, step, onChange }: { id: string; label: string; value: number; unit: string; min: number; max: number; step: number; onChange: (n: number) => void }) {
  return <div className="control-group"><label htmlFor={id} className="control-label">{label}<output className="value-pill">{step < 1 ? value.toFixed(1) : value} {unit}</output></label><input id={id} className="range" type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} /><div className="range-ends"><span>{min} {unit}</span><span>{max} {unit}</span></div></div>;
}

function CapacitorLab() {
  const [lab, setLab] = useState(initialLab);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const { settings, sample, history, motion } = lab;
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => { if (media.matches) setPlaying(false); };
    sync(); media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setLab(previous => stepLab(previous, 0.04 * speed)), 40);
    return () => window.clearInterval(timer);
  }, [playing, speed]);
  function update(patch: Partial<CapacitorSettings>) {
    setLab(previous => {
      const next = { ...previous.settings, ...patch };
      const sample = capacitorSample(next, previous.sample.time, previous.sample.voltage);
      return { ...previous, settings: next, sample, history: [...previous.history, sample] };
    });
  }
  const state = settings.mode === 'ac' ? 'Alternating' : Math.abs(sample.current) < 0.02 ? settings.connected ? 'Charged' : 'Discharged' : settings.connected ? 'Charging' : 'Discharging';
  const response = acResponse(settings);
  const note = settings.mode === 'ac'
    ? 'The source reverses every half-cycle. The plates swap polarity; charge moves in the wires, not through the dielectric. Current leads capacitor voltage.'
    : settings.connected ? 'Charge accumulates on opposite plates. As capacitor voltage approaches the source, current falls toward zero: a charged ideal capacitor blocks steady DC.'
      : 'The source is replaced by a wire. Stored energy leaves through the resistor, so current reverses while the capacitor voltage decays.';
  return <>
    <SiteHeader />
    <main className="shell">
      <div className="lab-heading flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow mb-3 flex items-center gap-2 text-muted-foreground"><span className="text-primary">03</span><span>/</span> THE BUILDING BLOCKS</div><h1>Capacitor lab<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">Store charge. Watch it change.</p></div><div className="segment" aria-label="Source mode"><Button variant="ghost" size="sm" aria-pressed={settings.mode === 'dc'} onClick={() => update({ mode: 'dc' })}>DC</Button><Button variant="ghost" size="sm" aria-pressed={settings.mode === 'ac'} onClick={() => update({ mode: 'ac', voltage: Math.max(0.5, Math.abs(settings.voltage)) })}>AC</Button></div></div>
      <div className="lab-grid">
        <section className="workspace" aria-label="Capacitor circuit workspace">
          <div className="workspace-head"><div className="flex items-center gap-2.5"><span className="eyebrow text-muted-foreground">LIVE CIRCUIT</span><span className="text-xs text-muted-foreground">/</span><span className="text-xs font-medium">Series RC</span></div><span className="live-status"><span className="legend-dot" />{playing ? 'Running' : 'Paused'}</span></div>
          <div className="circuit-space"><div className="absolute left-5 top-4 status-badge"><span className="legend-dot" />{state.toUpperCase()}</div><CapacitorCircuit settings={settings} sample={sample} motion={motion} /></div>
          <div className="circuit-footer"><div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground"><span className="flex items-center gap-2"><span className="legend-dot" />Conventional current</span><output aria-label="Elapsed simulation time" className="font-mono">{sample.time.toFixed(1)} s</output></div><div className="flex items-center gap-1"><Button variant="ghost" size="icon" title={playing ? 'Pause animation' : 'Play animation'} aria-label={playing ? 'Pause animation' : 'Play animation'} onClick={() => setPlaying(!playing)}>{playing ? <Pause /> : <Play />}</Button><Button variant="ghost" size="icon" title="Advance 0.1 seconds" aria-label="Advance 0.1 seconds" disabled={playing} onClick={() => setLab(previous => stepLab(previous, 0.1))}><SkipForward /></Button><div className="relative"><select aria-label="Animation speed" className="appearance-none rounded-md bg-secondary py-1.5 pl-3 pr-7 text-xs font-mono" value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select><ChevronDown size={12} className="pointer-events-none absolute right-2 top-2 text-muted-foreground" /></div><Button variant="ghost" size="icon" title="Reset lab" aria-label="Reset lab" onClick={() => { setLab(initialLab()); setSpeed(1); }}><RotateCcw /></Button></div></div>
          <div className="readouts readouts-led capacitor-readouts">
            {([['CAPACITOR VOLTAGE', sample.voltage.toFixed(2), 'V'], ['CURRENT', sample.current.toFixed(2), 'mA'], ['STORED CHARGE', sample.charge.toFixed(0), 'µC'], ['STORED ENERGY', sample.energy.toFixed(2), 'mJ']] as [string, string, string][]).map(([label, value, unit]) => <div className="readout" key={label} data-testid={`readout-${label.toLowerCase().replaceAll(' ', '-')}`}><div className="eyebrow text-muted-foreground">{label}</div><div className="readout-value">{value} <span className="readout-unit">{unit}</span></div></div>)}
          </div>
        </section>
        <aside className="controls" aria-label="Capacitor controls">
          <div className="eyebrow mb-6 text-muted-foreground">EXPERIMENT CONTROLS</div>
          {settings.mode === 'dc' && <div className="control-group"><div className="control-label">DC circuit</div><div className="segment"><Button variant="ghost" size="sm" aria-pressed={settings.connected} onClick={() => update({ connected: true })}>Charge</Button><Button variant="ghost" size="sm" aria-pressed={!settings.connected} onClick={() => update({ connected: false })}>Discharge</Button></div></div>}
          <RangeControl id="capacitor-source" label={settings.mode === 'dc' ? 'Source voltage' : 'Peak source voltage'} unit="V" value={settings.voltage} min={settings.mode === 'dc' ? -12 : 0.5} max={12} step={0.1} onChange={voltage => update({ voltage })} />
          {settings.mode === 'ac' && <RangeControl id="capacitor-frequency" label="Frequency" unit="Hz" value={settings.frequency} min={0.1} max={2} step={0.1} onChange={frequency => update({ frequency })} />}
          <RangeControl id="capacitor-resistance" label="Series resistor" unit="kΩ" value={settings.resistance} min={0.2} max={5} step={0.1} onChange={resistance => update({ resistance })} />
          <RangeControl id="capacitor-capacitance" label="Capacitance" unit="µF" value={settings.capacitance} min={100} max={2000} step={100} onChange={capacitance => update({ capacitance })} />
          <div className="control-divider" /><div className="info-note flex gap-2"><Info size={14} className="mt-0.5 shrink-0 text-primary" /><span>{settings.mode === 'dc' ? 'One time constant reaches 63% of the voltage change. About five time constants gets within 1%.' : 'Higher frequency means less time to charge each half-cycle, reducing the voltage swing across the capacitor.'}</span></div>
        </aside>
      </div>
      <div className="lower-grid">
        <section><div className="section-top"><h2 className="flex items-center gap-2"><Zap size={16} className="text-muted-foreground" /> Inside the capacitor</h2><span className="text-[10px] text-muted-foreground font-mono">OPPOSITE CHARGES</span></div><div className="figure-panel"><CapacitorPlates sample={sample} /><div className="panel-note"><Info size={13} className="shrink-0" /><span>{note}</span></div></div></section>
        <section><div className="section-top"><h2 className="flex items-center gap-2"><Activity size={16} className="text-muted-foreground" /> Voltage &amp; current</h2><span className="text-[10px] text-muted-foreground font-mono">LAST 12 s</span></div><div className="figure-panel"><div className="capacitor-trace-legend"><span><i className="capacitor-source-key" />Source</span><span><i className="capacitor-voltage-key" />Capacitor</span><span><i className="capacitor-current-key" />Current</span></div><CapacitorTrace history={history} voltageScale={Math.max(1, Math.abs(settings.voltage), ...history.map(s => Math.abs(s.voltage)), ...history.map(s => Math.abs(s.source)))} /><div className="panel-note"><Info size={13} className="shrink-0" /><span>τ = R × C = {timeConstant(settings).toFixed(2)} s{settings.mode === 'ac' ? ` · Steady-state capacitor peak ${response.amplitude.toFixed(2)} V · voltage lags source ${response.lag.toFixed(1)}°` : ' · Capacitor voltage changes smoothly; current responds immediately.'}</span></div></div></section>
      </div>
      <CapacitorHelper setup={snapshotCapacitor(settings, sample, history, playing)} />
      <footer className="footer"><span className="flex items-center gap-1.5"><Info size={12} /> Ideal RC model · no leakage or ESR · charge symbols and motion not to scale</span><span>circuit.playground / 03</span></footer>
    </main>
  </>;
}