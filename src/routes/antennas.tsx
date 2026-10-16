import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Info, Pause, Play, RotateCcw, Radio, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { AntennaScene, PatternPlot } from '@/components/antenna/diagrams';
import { antennaInfo, antennaModel, defaultAntennaSettings, formatLength, resonantLength, type AntennaSettings, type AntennaType, type RadioMode } from '@/lib/antenna-model';

export const Route = createFileRoute('/antennas')({
  head: () => ({ meta: [
    { title: 'Antenna Lab — Circuit Playground' },
    { name: 'description', content: 'See how dipole, monopole, loop and Yagi antennas transmit and receive radio waves, with live radiation patterns and resonance.' },
    { property: 'og:title', content: 'Antenna Lab — Circuit Playground' },
    { property: 'og:description', content: 'Interactive antennas: wavelength, resonance, radiation patterns, transmit and receive.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: AntennaLab,
});

const types = Object.keys(antennaInfo) as AntennaType[];
const physics: Record<AntennaType, string> = {
  dipole: 'Two rods fed in the middle. The alternating current sloshes back and forth; when each rod is a quarter wavelength, the charge reflected from the tips arrives back in step — a standing wave, like a plucked string. The accelerating charges shake the electric field, and the ripple travels away at the speed of light. Nothing radiates along the rods themselves.',
  monopole: 'Half a dipole standing on a metal ground plane. The ground acts as a mirror, supplying the missing half as a reflection, so a quarter-wave whip behaves like a half-wave dipole — but only radiates into the space above the ground.',
  loop: 'A small loop is mostly a magnetic antenna: the circulating current makes a magnetic field through the loop that changes in time. It is much smaller than the wavelength, so it is tuned with a capacitor, and it hears nothing along its axis — turning an AM radio finds that null.',
  yagi: 'Only the middle element is connected. The slightly longer reflector and shorter director pick up the wave and re-radiate it with shifted timing, so the waves add up forwards and cancel backwards. The result is a beam: more range in one direction, less noise from behind.',
};

function Range({ id, label, value, display, min, max, step, onChange }: { id: string; label: string; value: number; display: string; min: number; max: number; step: number; onChange: (n: number) => void }) {
  return <div className="control-group"><label htmlFor={id} className="control-label">{label}<output className="value-pill">{display}</output></label><input id={id} className="range" type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} /></div>;
}

function AntennaLab() {
  const [s, setS] = useState<AntennaSettings>(defaultAntennaSettings);
  const [playing, setPlaying] = useState(true);
  const [phase, setPhase] = useState(0);
  const m = antennaModel(s);
  const update = (p: Partial<AntennaSettings>) => setS(o => ({ ...o, ...p }));
  useEffect(() => {
    if (!playing || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => setPhase(p => p + 0.012), 40);
    return () => window.clearInterval(t);
  }, [playing]);
  const tune = (type = s.type, f = s.frequencyMHz) => Math.round(resonantLength(type, f) * 100) / 100;
  const maxLen = Math.max(0.2, tune(s.type, s.frequencyMHz) * 2.2);
  const tx = s.mode === 'transmit';
  const pct = (x: number) => `${Math.round(x * 100)}`;
  const status = m.match > 0.9 ? 'Resonant' : m.match > 0.4 ? 'Slightly detuned' : 'Detuned';
  const readouts: [string, string, string][] = [
    ['WAVELENGTH λ', m.lambda >= 1 ? m.lambda.toFixed(2) : (m.lambda * 100).toFixed(1), m.lambda >= 1 ? 'm' : 'cm'],
    ['LENGTH', (m.lengthInWavelengths).toFixed(2), 'λ'],
    ['RADIATION R', m.radiationResistance.toFixed(m.radiationResistance < 10 ? 1 : 0), 'Ω'],
    [tx ? 'POWER RADIATED' : 'SIGNAL CAPTURED', pct(m.delivered), '%'],
  ];
  return <>
    <SiteHeader />
    <main className="shell">
      <div className="lab-heading"><div className="eyebrow mb-3 flex items-center gap-2 text-muted-foreground"><span className="text-primary">10</span><span>/</span> RADIO</div><h1>Antenna lab<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">Current that shakes the field — and fields that push current.</p></div>
      <div className="lab-grid">
        <section className="workspace" aria-label="Antenna workspace">
          <div className="workspace-head"><div className="flex items-center gap-2.5"><span className="eyebrow text-muted-foreground">LIVE ANTENNA</span><span className="text-xs text-muted-foreground">/</span><span className="text-xs font-medium">{antennaInfo[s.type].name}</span></div><span className="live-status"><span className="legend-dot" />{status}</span></div>
          <div className="circuit-space"><AntennaScene s={s} phase={phase} scale={s.lengthM / resonantLength(s.type, s.frequencyMHz)} /></div>
          <div className="circuit-footer"><div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground"><span className="legend-dot" />Current (bigger = stronger)<span className="ml-2">Lines = electric-field wavefronts · slowed ~10⁸×</span></div><div className="flex items-center gap-1"><Button variant="ghost" size="icon" aria-label={playing ? 'Pause animation' : 'Play animation'} onClick={() => setPlaying(!playing)}>{playing ? <Pause /> : <Play />}</Button><Button variant="ghost" size="icon" aria-label="Reset lab" onClick={() => setS(defaultAntennaSettings)}><RotateCcw /></Button></div></div>
          <div className="readouts readouts-led capacitor-readouts" aria-live="polite">{readouts.map(([l, v, u]) => <div className="readout" key={l}><div className="eyebrow text-muted-foreground">{l}</div><div className="readout-value">{v} <span className="readout-unit">{u}</span></div></div>)}</div>
        </section>
        <aside className="controls" aria-label="Antenna controls">
          <div className="eyebrow mb-6 text-muted-foreground">EXPERIMENT CONTROLS</div>
          <div className="control-group"><div className="control-label">Antenna type</div><div className="layout-options">{types.map(t => <Button key={t} variant="outline" className="layout-option" aria-pressed={s.type === t} onClick={() => update({ type: t, lengthM: tune(t) })}><span className="radio" />{antennaInfo[t].name}</Button>)}</div></div>
          <div className="control-group"><div className="control-label">Direction</div><div className="layout-options">{(['transmit', 'receive'] as RadioMode[]).map(md => <Button key={md} variant="outline" className="layout-option" aria-pressed={s.mode === md} onClick={() => update({ mode: md })}><span className="radio" />{md === 'transmit' ? 'Transmit' : 'Receive'}</Button>)}</div></div>
          <div className="control-divider" />
          <Range id="ant-f" label="Frequency" value={s.frequencyMHz} display={`${s.frequencyMHz} MHz`} min={30} max={1000} step={1} onChange={frequencyMHz => update({ frequencyMHz })} />
          <Range id="ant-l" label={s.type === 'loop' ? 'Loop circumference' : s.type === 'monopole' ? 'Whip height' : 'Element length'} value={Math.min(s.lengthM, maxLen)} display={formatLength(s.lengthM)} min={0.02} max={Math.round(maxLen * 100) / 100} step={0.01} onChange={lengthM => update({ lengthM })} />
          {s.type !== 'loop' && <Button variant="outline" className="mb-5 w-full" onClick={() => update({ lengthM: tune() })}><Wand2 /> Cut to resonance ({formatLength(m.resonantLength)})</Button>}
          <div className="control-divider" /><div className="info-note flex gap-2"><Info size={14} className="mt-0.5 shrink-0 text-primary" /><span>{tx ? 'Transmit: the radio drives current into the antenna, and the antenna turns it into a radio wave.' : 'Receive: the passing wave pushes electrons along the metal, making a tiny current the radio amplifies. Same antenna, same pattern — this is reciprocity.'}</span></div>
        </aside>
      </div>
      <div className="lower-grid">
        <section>
          <div className="section-top"><h2>How it works</h2><span className="text-xs text-muted-foreground">{antennaInfo[s.type].example}</span></div>
          <div className="figure-panel p-5 text-sm leading-relaxed text-muted-foreground">
            <p>{physics[s.type]}</p>
            <ul className="mt-4 grid gap-2">
              <li><b className="text-foreground">Wavelength:</b> λ = c / f = 300 000 km/s ÷ {s.frequencyMHz} MHz = {formatLength(m.lambda)}.</li>
              <li><b className="text-foreground">Resonance:</b> best length is about {antennaInfo[s.type].resonantFraction} λ = {formatLength(m.resonantLength)}. Yours accepts {pct(m.match)}% of the power{s.type === 'loop' ? ' (tuned by a capacitor)' : ''}; the rest bounces back to the radio.</li>
              <li><b className="text-foreground">Efficiency:</b> radiation resistance {m.radiationResistance.toFixed(1)} Ω vs ≈2 Ω of losses → {pct(m.efficiency)}% becomes waves, the rest heat.</li>
              <li><b className="text-foreground">Polarization:</b> {antennaInfo[s.type].polarization}. Tilt the receiver 90° and the signal nearly vanishes.</li>
            </ul>
          </div>
        </section>
        <section>
          <div className="section-top"><h2>Radiation pattern</h2><span className="text-xs text-muted-foreground">Gain ≈ {m.gainDbi} dBi{s.type === 'yagi' ? ` · front/back ${m.frontToBack.toFixed(0)} dB` : ''}</span></div>
          <div className="figure-panel p-4"><PatternPlot pattern={m.pattern} title={`Radiation pattern of ${antennaInfo[s.type].name}`} />
            <p className="mt-2 text-xs text-muted-foreground">{s.type === 'yagi' ? 'Seen from above: the beam points toward the director (right).' : s.type === 'loop' ? 'Side view: strongest in the plane of the loop, silent along its axis.' : 'Side view of the antenna as drawn: a doughnut around the element, nothing off its ends.'} Make a dipole longer than 1 λ and watch the pattern split into lobes.</p>
          </div>
        </section>
      </div>
      <footer className="footer"><span className="flex items-center gap-2"><Radio size={14} /> Simplified textbook formulas; animation slowed enormously.</span><Link to="/theory" className="text-primary">Theory →</Link></footer>
    </main>
  </>;
}
