import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronDown, Info, Magnet, Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LenzDiagram, LenzTrace } from '@/components/circuits/diagrams';
import { coilFace, defaultLenzSettings, inducedCurrent, manualMotion, oscillation, type LenzSettings, type Pole } from '@/lib/lenz-model';

const WINDOW = 12;
const DEFAULT_SPEED = 0.5;
interface Experiment { time: number; distance: number; velocity: number; history: { time: number; current: number }[] }
function initialExperiment(): Experiment { return { time: 0, ...oscillation(0), history: [{ time: 0, current: 0 }] }; }

/** One magnet experiment shared by the component and circuit labs. */
export function LenzExperiment() {
  const [settings, setSettings] = useState<LenzSettings>(defaultLenzSettings);
  const [experiment, setExperiment] = useState(initialExperiment);
  const [auto, setAuto] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const lastMove = useRef(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false);
  }, []);
  useEffect(() => {
    if (auto && !playing) return;
    const timer = window.setInterval(() => {
      const stopped = !auto && performance.now() - lastMove.current > 140;
      setExperiment(previous => {
        const time = previous.time + 0.04 * speed;
        const motion = auto ? oscillation(time) : { distance: previous.distance, velocity: stopped ? 0 : previous.velocity };
        return { time, ...motion, history: [...previous.history.filter(s => s.time >= time - WINDOW), { time, current: inducedCurrent(settings, motion.distance, motion.velocity) }] };
      });
    }, 40);
    return () => window.clearInterval(timer);
  }, [playing, speed, auto, settings]);
  function setAutomatic(value: boolean) {
    setAuto(value);
    setExperiment(p => ({ ...p, velocity: 0 }));
    lastMove.current = 0;
  }
  function moveByHand(distance: number) {
    const now = performance.now();
    const elapsed = lastMove.current > 0 ? Math.max(0.04, Math.min(1, (now - lastMove.current) / 1000)) : 0.1;
    lastMove.current = now;
    setExperiment(previous => {
      const motion = manualMotion(previous.distance, distance, elapsed);
      return { ...previous, ...motion, history: [...previous.history, { time: previous.time, current: inducedCurrent(settings, distance, motion.velocity) }] };
    });
  }
  function reset() {
    setExperiment(initialExperiment()); setSettings(defaultLenzSettings); setAuto(true); setSpeed(DEFAULT_SPEED); lastMove.current = 0;
  }
  const { time, history } = experiment;
  const manual = experiment.distance;
  const motion = { distance: experiment.distance, velocity: experiment.velocity };
  const current = inducedCurrent(settings, motion.distance, motion.velocity);
  const face = coilFace(settings, motion.velocity);
  const readouts: [string, string, string][] = [
    ['MAGNET DISTANCE', motion.distance.toFixed(2), 'radii'],
    ['INDUCED CURRENT', (current * 1000).toFixed(0), 'mU'],
    ['COIL FACE', face === 'none' ? '—' : face.toUpperCase(), ''],
  ];
  return <>
      <div className="lab-grid">
        <section className="workspace" aria-label="Lenz's law workspace">
          <div className="workspace-head"><div className="flex items-center gap-2.5"><span className="eyebrow text-muted-foreground">LIVE EXPERIMENT</span><span className="text-xs text-muted-foreground">/</span><span className="text-xs font-medium">Magnet &amp; coil</span></div><span className="live-status"><span className="legend-dot" />{auto ? playing ? 'Running' : 'Paused' : 'By hand'}</span></div>
          <div className="circuit-space"><LenzDiagram settings={settings} distance={motion.distance} velocity={motion.velocity} /></div>
          <div className="circuit-footer"><div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground"><span className="flex items-center gap-2"><i className="capacitor-source-key inline-block h-0.5 w-3" />Induced field</span><span className="flex items-center gap-2"><i className="capacitor-current-key inline-block h-0.5 w-3" />Motion</span><output aria-label="Elapsed simulation time" className="font-mono">{time.toFixed(1)} s</output></div><div className="flex items-center gap-1"><Button variant="ghost" size="icon" title={playing ? 'Pause animation' : 'Play animation'} aria-label={playing ? 'Pause animation' : 'Play animation'} onClick={() => setPlaying(!playing)}>{playing ? <Pause /> : <Play />}</Button><div className="relative"><select aria-label="Animation speed" className="appearance-none rounded-md bg-secondary py-1.5 pl-3 pr-7 text-xs font-mono" value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value={0.25}>0.25×</option><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select><ChevronDown size={12} className="pointer-events-none absolute right-2 top-2 text-muted-foreground" /></div><Button variant="ghost" size="icon" title="Reset lab" aria-label="Reset lab" onClick={() => { reset(); }}><RotateCcw /></Button></div></div>
          <div className="readouts" aria-live="polite">{readouts.map(([l, v, u]) => <div className="readout" key={l}><div className="eyebrow text-muted-foreground">{l}</div><div className="readout-value">{v} <span className="readout-unit">{u}</span></div></div>)}</div>
        </section>
        <aside className="controls" aria-label="Lenz's law controls">
          <div className="eyebrow mb-6 text-muted-foreground">EXPERIMENT CONTROLS</div>
          <div className="control-group"><div className="control-label">Magnet motion</div><div className="segment"><Button variant="ghost" size="sm" aria-pressed={auto} onClick={() => setAutomatic(true)}>Automatic</Button><Button variant="ghost" size="sm" aria-pressed={!auto} onClick={() => setAutomatic(false)}>By hand</Button></div></div>
          {!auto && <div className="control-group"><label htmlFor="lenz-distance" className="control-label">Magnet distance<output className="value-pill">{manual.toFixed(1)} radii</output></label><input id="lenz-distance" className="range" type="range" min={1.2} max={4} step={0.05} value={manual} onChange={e => { moveByHand(Number(e.target.value)); }} /><div className="range-ends"><span>touching</span><span>far</span></div></div>}
          <div className="control-group"><div className="control-label">Pole facing the coil</div><div className="segment">{(['north', 'south'] as Pole[]).map(p => <Button key={p} variant="ghost" size="sm" aria-pressed={settings.pole === p} onClick={() => setSettings(s => ({ ...s, pole: p }))}>{p === 'north' ? 'North' : 'South'}</Button>)}</div></div>
          <div className="control-divider" /><div className="info-note flex gap-2"><Info size={14} className="mt-0.5 shrink-0 text-primary" /><span>An approaching north pole makes the near face of the coil a north pole too — like repels like, so the coil pushes back. When the magnet retreats, the coil flips and pulls it back. Flip the pole and every direction reverses.</span></div>
        </aside>
      </div>
      <div className="lower-grid">
        <section><div className="section-top"><h2 className="flex items-center gap-2"><Magnet size={16} className="text-muted-foreground" /> Induced current</h2><span className="text-[10px] text-muted-foreground font-mono">LAST {WINDOW} s</span></div><div className="figure-panel"><LenzTrace history={history} window={WINDOW} /><div className="panel-note"><Info size={13} className="shrink-0" /><span>Current depends on both speed and distance: closer or faster motion changes the flux more strongly. It reaches zero when the magnet stops and reverses when the motion reverses.</span></div></div></section>
        <section><div className="section-top"><h2 className="flex items-center gap-2"><Info size={16} className="text-muted-foreground" /> Why it must oppose</h2><span className="text-[10px] text-muted-foreground font-mono">ENERGY CONSERVATION</span></div><div className="figure-panel"><div className="p-5 text-sm leading-7 text-muted-foreground">
          <p>If the coil <em className="text-foreground not-italic font-medium">helped</em> the motion instead of fighting it, the magnet would speed up, induce more current, speed up more — free energy from nothing. Nature forbids it.</p>
          <p className="mt-3">So the induced current always flows in the direction whose magnetic field opposes the change in flux. That is Lenz’s law: the minus sign in ε = −N · dΦ/dt, where N is the number of turns.</p>
          <p className="mt-3">You have already met it: an inductor resisting a change in its own current is Lenz’s law applied to one coil — self-induction.</p>
        </div><div className="panel-note"><Info size={13} className="shrink-0" /><span>Switch to “By hand” and drag the magnet slowly, then quickly: faster motion, stronger current.</span></div></div></section>
      </div>
      <p className="mt-5 text-xs text-muted-foreground">Normalized dipole flux · current in teaching units (mU), not milliamps · coil resistance fixed at 10 teaching units. <Link to="/theory" hash="lenz" className="text-primary hover:underline">Lenz’s law theory →</Link></p>
    </>;
}
