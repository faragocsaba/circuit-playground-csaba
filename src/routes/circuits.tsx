import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ChevronDown, Info, Pause, Play, RotateCcw, Sigma } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { CombinedCircuit, PhasorDiagram } from '@/components/circuits/diagrams';
import { analyze, combination, defaultCircuitSettings, instant, type CircuitSettings } from '@/lib/circuit-model';

export const Route = createFileRoute('/circuits')({
  head: () => ({ meta: [
    { title: 'Circuits Lab — Circuit Playground' },
    { name: 'description', content: 'Combine R, L and C in one series AC circuit: switch each in or out and meet impedance, reactance, phase and the phasor diagram.' },
    { property: 'og:title', content: 'Circuits Lab — Circuit Playground' },
    { property: 'og:description', content: 'R, L and C together: impedance, reactance, phase and phasors.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: CircuitsLab,
});

function RangeControl({ id, label, value, unit, min, max, step, onChange }: { id: string; label: string; value: number; unit: string; min: number; max: number; step: number; onChange: (n: number) => void }) {
  return <div className="control-group"><label htmlFor={id} className="control-label">{label}<output className="value-pill">{step < 1 ? value.toFixed(1) : value} {unit}</output></label><input id={id} className="range" type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} /><div className="range-ends"><span>{min} {unit}</span><span>{max} {unit}</span></div></div>;
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (b: boolean) => void }) {
  return <Button variant="outline" className="layout-option" aria-pressed={on} onClick={() => onChange(!on)}><span className="radio" />{label}</Button>;
}

const DEFAULT_SPEED = 0.5;

function CircuitsLab() {
  const [settings, setSettings] = useState<CircuitSettings>(defaultCircuitSettings);
  const [time, setTime] = useState(0);
  const [motion, setMotion] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const update = (patch: Partial<CircuitSettings>) => setSettings(s => ({ ...s, ...patch }));
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const dt = 0.04 * speed;
      setTime(t => t + dt);
      setMotion(m => m + Math.sign(instant(settings, analyze(settings), time).current || 1) * dt);
    }, 40);
    return () => window.clearInterval(timer);
  }, [playing, speed, settings, time]);
  const a = analyze(settings);
  const now = instant(settings, a, time);
  const combo = combination(settings);
  const status = combo === 'open' ? 'Open circuit' : a.resonant ? 'At resonance' : a.phase > 2 ? 'Capacitive' : a.phase < -2 ? 'Inductive' : 'Resistive';
  const note = combo === 'open' ? 'Nothing is switched in, so no current can flow. Switch in at least one component.'
    : a.resonant ? 'X_L and X_C are equal and cancel: only R limits the current, and it flows in phase with the source. The coil and capacitor voltages can each be larger than the source — they cancel each other.'
    : a.phase > 2 ? 'The capacitor dominates: current leads the source voltage. Lower the frequency and the lead grows toward 90°.'
    : a.phase < -2 ? 'The coil dominates: current lags the source voltage. Raise the frequency and the lag grows toward 90°.'
    : 'Reactances are small or absent: the circuit behaves almost like a plain resistor, current in phase with the source.';
  const readouts: [string, string, string][] = [
    ['IMPEDANCE |Z|', a.impedance.toFixed(1), 'Ω'], ['PEAK CURRENT', a.peakCurrent.toFixed(1), 'mA'],
    ['PHASE SHIFT', a.phase.toFixed(1), '°'], ['POWER FACTOR', a.powerFactor.toFixed(2), 'cos φ'],
  ];
  return <>
    <SiteHeader />
    <main className="shell">
      <div className="lab-heading"><div className="eyebrow mb-3 flex items-center gap-2 text-muted-foreground"><span className="text-primary">06</span><span>/</span> CIRCUITS</div><h1>Circuits lab<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">R, L and C together. Meet impedance.</p></div>
      <div className="lab-grid">
        <section className="workspace" aria-label="Combined circuit workspace">
          <div className="workspace-head"><div className="flex items-center gap-2.5"><span className="eyebrow text-muted-foreground">LIVE CIRCUIT</span><span className="text-xs text-muted-foreground">/</span><span className="text-xs font-medium">Series {combo.toUpperCase()}</span></div><span className="live-status"><span className="legend-dot" />{playing ? 'Running' : 'Paused'}</span></div>
          <div className="circuit-space"><div className="absolute left-5 top-4 status-badge"><span className="legend-dot" />{status.toUpperCase()}</div><CombinedCircuit settings={settings} time={time} motion={motion} /></div>
          <div className="circuit-footer"><div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground"><span className="flex items-center gap-2"><span className="legend-dot" />Conventional current</span><span className="flex items-center gap-2"><i className="capacitor-source-key inline-block h-0.5 w-3" />Magnetic field</span><output aria-label="Elapsed simulation time" className="font-mono">{time.toFixed(1)} s</output></div><div className="flex items-center gap-1"><Button variant="ghost" size="icon" title={playing ? 'Pause animation' : 'Play animation'} aria-label={playing ? 'Pause animation' : 'Play animation'} onClick={() => setPlaying(!playing)}>{playing ? <Pause /> : <Play />}</Button><div className="relative"><select aria-label="Animation speed" className="appearance-none rounded-md bg-secondary py-1.5 pl-3 pr-7 text-xs font-mono" value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value={0.25}>0.25×</option><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select><ChevronDown size={12} className="pointer-events-none absolute right-2 top-2 text-muted-foreground" /></div><Button variant="ghost" size="icon" title="Reset lab" aria-label="Reset lab" onClick={() => { setSettings(defaultCircuitSettings); setTime(0); setMotion(0); setSpeed(DEFAULT_SPEED); }}><RotateCcw /></Button></div></div>
          <div className="readouts readouts-led capacitor-readouts" aria-live="polite">{readouts.map(([l, v, u]) => <div className="readout" key={l}><div className="eyebrow text-muted-foreground">{l}</div><div className="readout-value">{v} <span className="readout-unit">{u}</span></div></div>)}</div>
        </section>
        <aside className="controls" aria-label="Circuit controls">
          <div className="eyebrow mb-6 text-muted-foreground">EXPERIMENT CONTROLS</div>
          <div className="control-group"><div className="control-label">Switch components in or out</div><div className="layout-options">
            <Toggle label="Resistor R" on={settings.useR} onChange={useR => update({ useR })} />
            <Toggle label="Inductor L" on={settings.useL} onChange={useL => update({ useL })} />
            <Toggle label="Capacitor C" on={settings.useC} onChange={useC => update({ useC })} />
          </div></div>
          <div className="control-divider" />
          <RangeControl id="circuit-voltage" label="Peak source voltage" unit="V" value={settings.voltage} min={1} max={12} step={0.5} onChange={voltage => update({ voltage })} />
          <RangeControl id="circuit-frequency" label="Frequency" unit="Hz" value={settings.frequency} min={0.2} max={5} step={0.1} onChange={frequency => update({ frequency })} />
          <RangeControl id="circuit-resistance" label="Resistance" unit="Ω" value={settings.resistance} min={5} max={100} step={1} onChange={resistance => update({ resistance })} />
          <RangeControl id="circuit-inductance" label="Inductance" unit="H" value={settings.inductance} min={1} max={20} step={1} onChange={inductance => update({ inductance })} />
          <RangeControl id="circuit-capacitance" label="Capacitance" unit="µF" value={settings.capacitance} min={100} max={5000} step={100} onChange={capacitance => update({ capacitance })} />
          <div className="control-divider" /><div className="info-note flex gap-2"><Info size={14} className="mt-0.5 shrink-0 text-primary" /><span>Impedance Z = √(R² + (X_L − X_C)²) plays the role of resistance for AC. X_L = 2πfL grows with frequency; X_C = 1 ÷ (2πfC) shrinks. Right now X_L = {a.xL.toFixed(0)} Ω and X_C = {a.xC.toFixed(0)} Ω.</span></div>
        </aside>
      </div>
      <div className="lower-grid">
        <section><div className="section-top"><h2 className="flex items-center gap-2"><Sigma size={16} className="text-muted-foreground" /> Phasor diagram</h2><span className="text-[10px] text-muted-foreground font-mono">ROTATING WITH THE SOURCE</span></div><div className="figure-panel"><PhasorDiagram settings={settings} time={time} /><div className="panel-note"><Info size={13} className="shrink-0" /><span>Each voltage is an arrow rotating at the source frequency; their lengths are the peak values. V_L and V_C point in opposite directions — when they are equal they cancel and the source arrow lines up with the current.</span></div></div></section>
        <section><div className="section-top"><h2 className="flex items-center gap-2"><Info size={16} className="text-muted-foreground" /> What is impedance?</h2><span className="text-[10px] text-muted-foreground font-mono">Z = V / I</span></div><div className="figure-panel"><div className="p-5 text-sm leading-7 text-muted-foreground">
          <p>A resistor opposes current the same way at any frequency. A coil and a capacitor oppose <em className="text-foreground not-italic font-medium">change</em>: their opposition — reactance — depends on frequency and shifts the timing between voltage and current.</p>
          <p className="mt-3">Impedance bundles both effects into one number with a magnitude and an angle. Here |Z| = <span className="font-mono text-foreground">{a.impedance.toFixed(1)} Ω</span> and the current {a.phase >= 0 ? 'leads' : 'lags'} by <span className="font-mono text-foreground">{Math.abs(a.phase).toFixed(1)}°</span>.</p>
          <p className="mt-3">{note}</p>
        </div><div className="panel-note"><Info size={13} className="shrink-0" /><span>Try switching out L or C to build RC and RL circuits, or lower the resistor toward 5 Ω and watch the phase swing widen.</span></div></div></section>
      </div>
      <footer className="footer"><span className="flex items-center gap-1.5"><Info size={12} /> Ideal components · steady-state phasor analysis · large values so motion is visible</span><span><Link to="/theory" hash="inductor-energy" className="mr-3 text-primary hover:underline">Theory →</Link>circuit.playground / 06</span></footer>
    </main>
  </>;
}
