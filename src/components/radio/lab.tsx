import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Info, Pause, Play, RotateCcw, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { RadioAudio } from './audio';
import { RadioChain, RadioCircuit, SignalPlot, stageNames } from './diagrams';
import { defaultRadioSettings, formatRadioFrequency, modeSettings, radioAnalysis, radioSamples, stations, type Modulation, type RadioLabKind, type RadioSettings } from '@/lib/radio-model';

const descriptions = {
  modulation: { n: '14', title: 'Signal modulation', subtitle: 'One message. Two ways to carry it.' },
  receiver: { n: '15', title: 'Radio receiver', subtitle: 'From a tiny antenna voltage to sound.' },
  transmitter: { n: '16', title: 'Radio transmitter', subtitle: 'From a microphone to a traveling wave.' },
};
function Range({ id, label, value, min, max, step, display, change }: { id: string; label: string; value: number; min: number; max: number; step: number; display: string; change: (v: number) => void }) {
  return <div className="control-group"><label htmlFor={id} className="control-label">{label}<output className="value-pill">{display}</output></label><input id={id} type="range" className="range" value={value} min={min} max={max} step={step} onChange={e => change(Number(e.target.value))} /></div>;
}
const stageNotes = {
  receiver: [
    'The incoming electric field moves charge in the antenna. Many signals can coexist; the antenna alone does not recover the sound.',
    'An LC resonator favors a band of frequencies. Changing its capacitance changes resonance. The gain curve here is an approximate bandpass response, not a solved RF amplifier.',
    'A mixer combines the received carrier with a local oscillator. Sum and difference frequencies appear; the receiver keeps the difference at a fixed intermediate frequency (IF).',
    'Filtering and amplification at a fixed IF give useful selectivity. The tuning knob moves the local oscillator while the IF filter stays fixed.',
    'AM uses a rectifier and RC envelope detector. FM first removes amplitude variation, then a discriminator converts frequency deviation into audio voltage. The graph uses an ideal phase-derivative FM detector.',
    'Remove the DC offset, amplify the recovered audio and drive a speaker. Its cone follows the audio-frequency voltage, not the megahertz carrier.',
  ],
  transmitter: [
    'A microphone converts changing air pressure into a small audio-frequency voltage. This experiment substitutes a single adjustable test tone.',
    'A preamplifier brings the message to a usable level. The transmitter must preserve that waveform rather than simply broadcast the audio frequency.',
    'An oscillator creates a steady radio-frequency carrier. It establishes which channel the transmitter occupies.',
    'AM multiplies the carrier by a varying envelope. FM varies oscillator frequency around the carrier; the integral of that frequency determines phase.',
    'An RF power stage supplies energy from a power source. An LC output network suppresses harmonics and matches the antenna impedance. AM needs a linear amplitude path; constant-envelope FM allows efficient nonlinear amplifiers.',
    'Alternating antenna current creates outgoing electromagnetic fields. This page generates a mathematical waveform only; no radio signal is transmitted by your device.',
  ],
  modulation: [
    'The message is a 300–1000 Hz audio tone. It is much slower than a real broadcast carrier.',
    'A carrier is a steady high-frequency oscillation. Without modulation it carries no changing audio message.',
    'AM changes amplitude; FM changes frequency while keeping amplitude constant. Both encode the message into a radio-frequency signal.',
    'The receiver reverses modulation to recover audio. The trace translates the carrier down to 24 cycles per message cycle so you can inspect it.',
  ],
};

export function RadioLab({ kind }: { kind: RadioLabKind }) {
  const [s, setS] = useState<RadioSettings>(defaultRadioSettings);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(0.5);
  const [phase, setPhase] = useState(0);
  const [selected, setSelected] = useState(0);
  const receiving = kind === 'receiver';
  const a = radioAnalysis(s);
  const samples = useMemo(() => radioSamples(s, receiving), [s, receiving]);
  const desc = descriptions[kind];
  const names = stageNames(kind, s.mode === 'fm');
  const update = (patch: Partial<RadioSettings>) => setS(previous => ({ ...previous, ...patch }));
  useEffect(() => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false); }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setPhase(p => p + 0.04 * speed), 40);
    return () => window.clearInterval(timer);
  }, [playing, speed]);
  const readouts = receiving ? [
    ['TUNED FREQUENCY', formatRadioFrequency(s.tuneHz)], ['SIGNAL AFTER TUNING', `${(a.gain * 100).toFixed(1)} %`], ['LOCAL OSCILLATOR', formatRadioFrequency(a.loHz)], ['FIXED IF', formatRadioFrequency(a.ifHz)],
  ] : kind === 'transmitter' ? [
    ['CARRIER', formatRadioFrequency(s.carrierHz)], ['MESSAGE', `${s.audioHz} Hz`], ['AVERAGE RF POWER', `${a.averagePower.toFixed(2)} W`], ['EST. BANDWIDTH', formatRadioFrequency(a.bandwidth)],
  ] : [
    ['CARRIER', formatRadioFrequency(s.carrierHz)], ['MESSAGE', `${s.audioHz} Hz`], [s.mode === 'am' ? 'MODULATION DEPTH' : 'FM INDEX β', s.mode === 'am' ? `${Math.round(s.depth * 100)} %` : a.index.toFixed(2)], ['EST. BANDWIDTH', formatRadioFrequency(a.bandwidth)],
  ];
  return <>
    <SiteHeader />
    <main className="shell">
      <div className="lab-heading flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow mb-3 text-muted-foreground"><span className="text-primary">{desc.n}</span> / RADIO</div><h1>{desc.title}<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">{desc.subtitle}</p></div><div className="segment" aria-label="Modulation mode">{(['am', 'fm'] as Modulation[]).map(mode => <Button key={mode} variant="ghost" size="sm" aria-pressed={s.mode === mode} onClick={() => { setS(modeSettings(mode)); setSelected(0); }}>{mode.toUpperCase()}</Button>)}</div></div>
      <div className="lab-grid">
        <section className="workspace" aria-label="Radio signal workspace">
          <div className="workspace-head"><span className="eyebrow text-muted-foreground">{s.mode.toUpperCase()} SIGNAL PATH</span><span className="live-status"><span className="legend-dot" />{playing ? 'Running' : 'Paused'}</span></div>
          <RadioChain kind={kind} settings={s} selected={selected} phase={phase} />
          <div className="radio-stage-controls" aria-label="Signal stages">{names.map((name, index) => <Button key={name} variant="ghost" size="sm" aria-pressed={index === selected} onClick={() => setSelected(index)}><span className="font-mono text-primary">{index + 1}</span>{name}</Button>)}</div>
          <p className="min-h-24 px-5 py-4 text-sm leading-relaxed text-muted-foreground">{stageNotes[kind][selected]}</p>
          <div className="circuit-footer"><span className="text-xs text-muted-foreground">Illustrative signal flow · {phase.toFixed(1)} s</span><div className="flex items-center gap-1"><Button variant="ghost" size="icon" aria-label={playing ? 'Pause animation' : 'Play animation'} title={playing ? 'Pause animation' : 'Play animation'} onClick={() => setPlaying(p => !p)}>{playing ? <Pause /> : <Play />}</Button><select aria-label="Animation speed" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="rounded-md bg-secondary p-2 text-xs"><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1">1×</option><option value="2">2×</option></select><Button variant="ghost" size="icon" aria-label="Reset lab" title="Reset lab" onClick={() => { setS(modeSettings(s.mode)); setPhase(0); setSpeed(0.5); setSelected(0); }}><RotateCcw /></Button></div></div>
          <div className="readouts readouts-led capacitor-readouts">{readouts.map(([label, value]) => <div className="readout" key={label}><div className="eyebrow text-muted-foreground">{label}</div><output className="readout-value radio-readout">{value}</output></div>)}</div>
        </section>
        <aside className="controls" aria-label="Radio controls">
          <div className="eyebrow mb-6 text-muted-foreground">EXPERIMENT CONTROLS</div>
          {receiving && <>
            <div className="control-group"><label className="control-label" htmlFor="radio-station">Simulated station</label><select id="radio-station" className="w-full rounded-md border border-border bg-card p-2 text-sm" value={s.carrierHz} onChange={e => { const hz = Number(e.target.value); const station = stations[s.mode].find(st => st.hz === hz); update({ carrierHz: hz, audioHz: station?.tone ?? 500 }); }}>{stations[s.mode].map(st => <option key={st.hz} value={st.hz}>{formatRadioFrequency(st.hz)} · {st.tone} Hz tone</option>)}</select></div>
            <Range id="radio-tune" label="Receiver tuning" value={s.tuneHz} min={s.mode === 'am' ? 850000 : 97500000} max={s.mode === 'am' ? 1150000 : 102500000} step={s.mode === 'am' ? 1000 : 10000} display={formatRadioFrequency(s.tuneHz)} change={tuneHz => update({ tuneHz })} />
            <Button variant="outline" className="mb-5 w-full" onClick={() => update({ tuneHz: s.carrierHz })}><Radio /> Tune to station</Button>
            <Range id="radio-bandwidth" label="Tuning bandwidth" value={s.bandwidthHz} min={s.mode === 'am' ? 2000 : 20000} max={s.mode === 'am' ? 30000 : 300000} step={s.mode === 'am' ? 1000 : 10000} display={formatRadioFrequency(s.bandwidthHz)} change={bandwidthHz => update({ bandwidthHz })} />
            <Range id="radio-strength" label="Antenna signal" value={s.strength} min={0} max={1} step={0.05} display={`${Math.round(s.strength * 100)} %`} change={strength => update({ strength })} />
          </>}
          {!receiving && <Range id="radio-audio" label="Audio tone" value={s.audioHz} min={300} max={1000} step={50} display={`${s.audioHz} Hz`} change={audioHz => update({ audioHz })} />}
          {s.mode === 'am' ? <Range id="radio-depth" label="AM depth" value={s.depth} min={0} max={1.2} step={0.05} display={`${Math.round(s.depth * 100)} %`} change={depth => update({ depth })} /> : <Range id="radio-deviation" label="FM deviation" value={s.deviationHz} min={0} max={7500} step={250} display={formatRadioFrequency(s.deviationHz)} change={deviationHz => update({ deviationHz })} />}
          {receiving && s.mode === 'am' && <Range id="radio-detector" label="Detector RC" value={s.detectorMs} min={0.05} max={2} step={0.05} display={`${s.detectorMs.toFixed(2)} ms`} change={detectorMs => update({ detectorMs })} />}
          {kind === 'transmitter' && <Range id="radio-power" label={s.mode === 'am' ? 'Carrier power' : 'RF power'} value={s.powerW} min={0.1} max={5} step={0.1} display={`${s.powerW.toFixed(1)} W`} change={powerW => update({ powerW })} />}
          <Range id="radio-volume" label="Listening volume" value={s.volume} min={0} max={1} step={0.05} display={`${Math.round(s.volume * 100)} %`} change={volume => update({ volume })} />
          <RadioAudio settings={s} receiving={receiving} />
          <div className="control-divider" /><p className="info-note">Synthetic audio only. No microphone access, live station reception or RF transmission.</p>
        </aside>
      </div>
      {a.overmodulated && <div role="alert" className="mt-5 border-l-2 border-destructive bg-secondary p-4 text-sm text-destructive">Overmodulation: above 100%, the AM envelope crosses zero. A diode envelope detector folds it and distorts the audio.</div>}
      {receiving && s.bandwidthHz < a.bandwidth && <p className="mt-5 text-sm text-destructive">The tuning bandwidth is narrower than the estimated signal bandwidth. A real receiver would distort or attenuate sidebands; this simplified tuning model applies only carrier gain.</p>}
      <div className="lower-grid">
        <section><div className="section-top"><h2>{receiving ? 'Selected RF signal' : 'Modulated carrier'}</h2><span className="text-xs text-muted-foreground">{s.mode === 'am' ? 'Envelope in amber' : 'Constant amplitude'}</span></div><div className="figure-panel"><SignalPlot samples={samples} field="rf" title={`${s.mode.toUpperCase()} modulated radio signal`} {...(s.mode === 'am' ? { secondary: 'envelope' as const } : {})} /><p className="panel-note">Carrier translated down to 24× the audio frequency for inspection. Actual carrier: {formatRadioFrequency(s.carrierHz)}.</p></div></section>
        <section><div className="section-top"><h2>{receiving ? 'Recovered audio' : 'Original audio message'}</h2><span className="text-xs text-muted-foreground">{s.audioHz} Hz</span></div><div className="figure-panel"><SignalPlot samples={samples} field={receiving ? 'audio' : 'message'} title={receiving ? 'Recovered audio compared with original message' : 'Original audio message'} {...(receiving ? { secondary: 'message' as const } : {})} /><p className="panel-note">{receiving ? s.mode === 'am' ? 'Teal: diode/RC recovery. Amber: original message. Longer RC holds peaks too long and distorts the falling envelope.' : 'Teal: recovered phase derivative. Amber: original tone. Ideal limiter/discriminator; no noise or FM capture-effect simulation.' : 'The message controls the AM envelope or the instantaneous FM frequency. Audio is a synthetic recovered test tone.'}</p></div></section>
      </div>
      <section className="mt-8"><div className="section-top"><h2>{kind === 'modulation' ? 'AM versus FM' : 'Inside the circuit'}</h2><span className="eyebrow text-muted-foreground">{kind === 'modulation' ? 'INFORMATION ON A CARRIER' : 'REAL RADIO TOPOLOGY'}</span></div>
        {kind === 'modulation' ? <div className="grid gap-6 border-t border-border py-5 sm:grid-cols-2"><div><h3 className="font-semibold">AM · amplitude modulation</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">s(t) = [1 + μ cos(2πfₘt)] cos(2πf꜀t). Carrier plus two sidebands at f꜀ ± fₘ. At 100% depth, the minimum envelope touches zero. AM bandwidth for this single tone is 2fₘ.</p></div><div><h3 className="font-semibold">FM · frequency modulation</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">s(t) = cos[2πf꜀t + β sin(2πfₘt)], β = Δf/fₘ. Frequency ranges from {formatRadioFrequency(a.minFrequency)} to {formatRadioFrequency(a.maxFrequency)}. Carson’s estimate is 2(Δf + fₘ); FM has many sidebands, not just two.</p></div></div> : <><RadioCircuit settings={s} kind={kind} /><div className="grid gap-5 border-t border-border py-5 sm:grid-cols-2"><p className="text-sm leading-relaxed text-muted-foreground">{receiving ? `The AM schematic is a simpler tuned envelope receiver. The signal path above is a superheterodyne architecture: LO ${formatRadioFrequency(a.loHz)} − tuned RF ${formatRadioFrequency(s.tuneHz)} = IF ${formatRadioFrequency(a.ifHz)}. Changing a station without retuning misses that IF.` : 'Power is supplied by the transmitter, not created by modulation. For AM, average power = carrier power × (1 + μ²/2). For ideal constant-envelope FM it equals the selected RF power.'}</p><p className="text-sm leading-relaxed text-muted-foreground">{receiving ? `Tuned input: ${s.mode === 'am' ? '250 µH' : '100 nH'} with approximately ${a.tankCapPf.toFixed(1)} pF resonates at ${formatRadioFrequency(s.tuneHz)}. The model represents one selected station, a steady-state tuning response, and ideal demodulation; it does not solve mixer transients or interference.` : 'The oscillator and matching network use inductors and capacitors; the power stage uses RF transistors. The diagram shows practical functional stages, not a buildable circuit with bias, supply, protection and filtering values.'}</p></div></>}
      </section>
      <nav aria-label="Related radio labs" className="flex flex-wrap gap-5 border-t border-border py-6 text-sm text-primary"><Link to="/antennas">Antennas <ArrowRight size={14} className="inline" /></Link>{kind !== 'modulation' && <Link to="/radio/modulation">AM &amp; FM modulation <ArrowRight size={14} className="inline" /></Link>}{kind !== 'receiver' && <Link to="/radio/receiver">Receiver <ArrowRight size={14} className="inline" /></Link>}{kind !== 'transmitter' && <Link to="/radio/transmitter">Transmitter <ArrowRight size={14} className="inline" /></Link>}</nav>
      <footer className="footer"><span className="flex items-center gap-2"><Info size={12} /> Ideal signals · no real RF · single-tone teaching model</span><Link to="/theory/radio" hash={kind === "modulation" ? "modulation" : kind === "receiver" ? "receiver" : "transmitter"} className="text-primary">Theory →</Link></footer>
    </main>
  </>;
}