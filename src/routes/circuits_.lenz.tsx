import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ChevronDown, Info, Magnet, Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { LenzDiagram, LenzTrace } from '@/components/circuits/diagrams';
import { coilFace, defaultLenzSettings, inducedCurrent, oscillation, type LenzSettings, type Pole } from '@/lib/lenz-model';

export const Route = createFileRoute('/circuits_/lenz')({
  head: () => ({ meta: [
    { title: 'Lenz’s Law — Circuit Playground' },
    { name: 'description', content: 'Move a magnet toward and away from a coil and watch the induced current always fight the motion — Lenz’s law made visible.' },
    { property: 'og:title', content: 'Lenz’s Law — Circuit Playground' },
    { property: 'og:description', content: 'The induced current always opposes the change that creates it.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: LenzLab,
});

const WINDOW = 12;
const DEFAULT_SPEED = 0.5;

function LenzLab() {
  const [settings, setSettings] = useState<LenzSettings>(defaultLenzSettings);
  const [time, setTime] = useState(0);
  const [auto, setAuto] = useState(true);
  const [manual, setManual] = useState(4); // magnet distance when dragging by hand
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [history, setHistory] = useState<{ time: number; current: number }[]>([{ time: 0, current: 0 }]);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false);
  }, []);
  useEffect(() => {
    if (!playing || !auto) return;
    const timer = window.setInterval(() => {
      setTime(t => {
        const nt = t + 0.04 * speed;
        const { distance, velocity } = oscillation(nt);
        setHistory(h => [...h.filter(s => s.time >= nt - WINDOW), { time: nt, current: inducedCurrent(settings, distance, velocity) }]);
        return nt;
      });
    }, 40);
    return () => window.clearInterval(timer);
  }, [playing, speed, auto, settings]);
  const motion = auto ? oscillation(time) : { distance: manual, velocity: 0 };
  const current = inducedCurrent(settings, motion.distance, motion.velocity);
  const face = coilFace(settings, motion.velocity);
  const readouts: [string, string, string][] = [
    ['MAGNET DISTANCE', motion.distance.toFixed(2), 'radii'],
    ['INDUCED CURRENT', (current * 1000).toFixed(0), 'mU'],
    ['COIL FACE', face === 'none' ? '—' : face.toUpperCase(), ''],
  ];
  return <>
    <SiteHeader />
    <main className="shell">
      <div className="lab-heading"><div className="eyebrow mb-3 flex items-center gap-2 text-muted-foreground"><span className="text-primary">06</span><span>/</span> CIRCUITS</div><h1>Lenz’s law<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">The induced current always fights the change.</p></div>
      <div className="lab-grid">
        <section className="workspace" aria-label="Lenz's law workspace">
          <div className="workspace-head"><div className="flex items-center gap-2.5"><span className="eyebrow text-muted-foreground">LIVE EXPERIMENT</span><span className="text-xs text-muted-foreground">/</span><span className="text-xs font-medium">Magnet &amp; coil</span></div><span className="live-status"><span className="legend-dot" />{playing && auto ? 'Running' : 'Paused'}</span></div>
          <div className="circuit-space"><LenzDiagram settings={settings} distance={motion.distance} velocity={motion.velocity} /></div>
          <div className="circuit-footer"><div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground"><span className="flex items-center gap-2"><i className="capacitor-source-key inline-block h-0.5 w-3" />Induced field</span><span className="flex items-center gap-2"><i className="capacitor-current-key inline-block h-0.5 w-3" />Motion</span><output aria-label="Elapsed simulation time" className="font-mono">{time.toFixed(1)} s</output></div><div className="flex items-center gap-1"><Button variant="ghost" size="icon" title={playing ? 'Pause animation' : 'Play animation'} aria-label={playing ? 'Pause animation' : 'Play animation'} onClick={() => setPlaying(!playing)}>{playing ? <Pause /> : <Play />}</Button><div className="relative"><select aria-label="Animation speed" className="appearance-none rounded-md bg-secondary py-1.5 pl-3 pr-7 text-xs font-mono" value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value={0.25}>0.25×</option><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select><ChevronDown size={12} className="pointer-events-none absolute right-2 top-2 text-muted-foreground" /></div><Button variant="ghost" size="icon" title="Reset lab" aria-label="Reset lab" onClick={() => { setTime(0); setManual(4); setHistory([{ time: 0, current: 0 }]); setSpeed(DEFAULT_SPEED); }}><RotateCcw /></Button></div></div>
          <div className="readouts" aria-live="polite">{readouts.map(([l, v, u]) => <div className="readout" key={l}><div className="eyebrow text-muted-foreground">{l}</div><div className="readout-value">{v} <span className="readout-unit">{u}</span></div></div>)}</div>
        </section>
        <aside className="controls" aria-label="Lenz's law controls">
          <div className="eyebrow mb-6 text-muted-foreground">EXPERIMENT CONTROLS</div>
          <div className="control-group"><div className="control-label">Magnet motion</div><div className="segment"><Button variant="ghost" size="sm" aria-pressed={auto} onClick={() => setAuto(true)}>Automatic</Button><Button variant="ghost" size="sm" aria-pressed={!auto} onClick={() => setAuto(false)}>By hand</Button></div></div>
          {!auto && <div className="control-group"><label htmlFor="lenz-distance" className="control-label">Magnet distance<output className="value-pill">{manual.toFixed(1)} radii</output></label><input id="lenz-distance" className="range" type="range" min={1.2} max={4} step={0.05} value={manual} onChange={e => { const d = Number(e.target.value); const v = (d - manual) / 0.05; setManual(d); setHistory(h => [...h.filter(s => s.time >= time - WINDOW), { time, current: inducedCurrent(settings, d, v * 0.2) }]); }} /><div className="range-ends"><span>touching</span><span>far</span></div></div>}
          <div className="control-group"><div className="control-label">Pole facing the coil</div><div className="segment">{(['north', 'south'] as Pole[]).map(p => <Button key={p} variant="ghost" size="sm" aria-pressed={settings.pole === p} onClick={() => setSettings(s => ({ ...s, pole: p }))}>{p === 'north' ? 'North' : 'South'}</Button>)}</div></div>
          <div className="control-divider" /><div className="info-note flex gap-2"><Info size={14} className="mt-0.5 shrink-0 text-primary" /><span>An approaching north pole makes the near face of the coil a north pole too — like repels like, so the coil pushes back. When the magnet retreats, the coil flips and pulls it back. Flip the pole and every direction reverses.</span></div>
        </aside>
      </div>
      <div className="lower-grid">
        <section><div className="section-top"><h2 className="flex items-center gap-2"><Magnet size={16} className="text-muted-foreground" /> Induced current</h2><span className="text-[10px] text-muted-foreground font-mono">LAST {WINDOW} s</span></div><div className="figure-panel"><LenzTrace history={history} window={WINDOW} /><div className="panel-note"><Info size={13} className="shrink-0" /><span>The current is strongest when the magnet moves fastest — near the middle of its swing — and passes through zero at the turning points. Its sign flips with the direction of motion.</span></div></div></section>
        <section><div className="section-top"><h2 className="flex items-center gap-2"><Info size={16} className="text-muted-foreground" /> Why it must oppose</h2><span className="text-[10px] text-muted-foreground font-mono">ENERGY CONSERVATION</span></div><div className="figure-panel"><div className="p-5 text-sm leading-7 text-muted-foreground">
          <p>If the coil <em className="text-foreground not-italic font-medium">helped</em> the motion instead of fighting it, the magnet would speed up, induce more current, speed up more — free energy from nothing. Nature forbids it.</p>
          <p className="mt-3">So the induced current always flows in the direction whose magnetic field opposes the change in flux. That is Lenz’s law: the minus sign in ε = −dΦ/dt.</p>
          <p className="mt-3">You have already met it: an inductor resisting a change in its own current is Lenz’s law applied to one coil — self-induction.</p>
        </div><div className="panel-note"><Info size={13} className="shrink-0" /><span>Switch to “By hand” and drag the magnet slowly, then quickly: faster motion, stronger current.</span></div></div></section>
      </div>
      <footer className="footer"><span className="flex items-center gap-1.5"><Info size={12} /> Simplified dipole flux · teaching units · motion slowed to stay visible</span><span><Link to="/theory" hash="inductor-energy" className="mr-3 text-primary hover:underline">Theory →</Link>circuit.playground / 06</span></footer>
    </main>
  </>;
}
