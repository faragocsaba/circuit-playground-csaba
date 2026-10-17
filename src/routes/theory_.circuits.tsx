import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TheoryChapter, TheorySection, WorkedExample } from '@/components/theory/chapter';
import { TheoryPhasors } from '@/components/theory/phasors';
import { analyze, defaultCircuitSettings } from '@/lib/circuit-model';
import { resistorModel, defaultResistorSettings } from '@/lib/resistor-model';
import { resonantFrequency, qualityFactor, defaultInductorSettings } from '@/lib/inductor-model';

export const Route = createFileRoute('/theory_/circuits')({
  head: () => ({ meta: [
    { title: 'Circuits Theory — Impedance, Phasors & Resonance | Circuit Playground' },
    { name: 'description', content: 'Understand Kirchhoff’s laws, complex impedance, phasor addition, RMS power and series RLC resonance with equations and a live worked example.' },
    { property: 'og:title', content: 'Circuits Theory — Circuit Playground' },
    { property: 'og:description', content: 'From junctions and loops to impedance, phasors and resonant circuits.' },
    { property: 'og:type', content: 'article' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: CircuitsTheory,
});

function CircuitsTheory() {
  const [frequency, setFrequency] = useState(defaultCircuitSettings.frequency);
  const s = { ...defaultCircuitSettings, frequency };
  const ac = analyze(s);
  const inductor = { ...defaultInductorSettings, inductance: s.inductance, capacitance: s.capacitance, resistance: s.resistance };
  const f0 = resonantFrequency(inductor);
  const resonant = analyze({ ...s, frequency: f0 });
  const q = qualityFactor(inductor);
  const parallel = resistorModel({ ...defaultResistorSettings, arrangement: 'parallel' });
  const series = resistorModel({ ...defaultResistorSettings, arrangement: 'series' });
  return <TheoryChapter title="Circuits theory" description="From charge conservation to the timing, power and resonance of alternating current." contents={[
    ['kirchhoff', 'Junctions & loops'], ['impedance', 'Complex impedance'], ['phasors', 'Phasors'], ['power', 'RMS & power'], ['resonance', 'Resonance'],
  ]}>
    <TheorySection id="kirchhoff" title="Kirchhoff: charge and energy balance" equations={['Σ I at a junction = 0', 'Σ v around a closed loop = 0', 'Series RLC: vs(t) = R i(t) + L di/dt + vC(t); i(t) = C dvC/dt']}>
      <p>Choose positive directions first. Currents entering a junction can be positive and those leaving negative. For a loop, add voltage rises and subtract drops. KCL follows conservation of charge; KVL balances energy per charge in a lumped circuit.</p>
      <svg className="theory-diagram" viewBox="0 0 600 160" role="img" aria-label="Current entering a junction divides into two outgoing branch currents"><path d="M45 80H270M270 80L420 35H555M270 80L420 125H555" className="wire" /><circle cx="270" cy="80" r="5" className="current-particle" /><path d="M180 74l10 6-10 6M470 29l10 6-10 6M470 119l10 6-10 6" className="symbol" /><text x="75" y="60">I in = I₁ + I₂</text><text x="435" y="22">I₁</text><text x="435" y="152">I₂</text></svg>
      <WorkedExample><p>At 9 V, parallel 470 Ω and 1 kΩ branches draw {parallel.i1.toFixed(2)} + {parallel.i2.toFixed(2)} = <b>{parallel.current.toFixed(2)} mA</b>. In series, the current is {series.current.toFixed(2)} mA and the drops are {series.v1.toFixed(2)} V + {series.v2.toFixed(2)} V = 9 V.</p></WorkedExample>
      <p>KVL uses instantaneous voltages, including during charging and switching. At radio frequencies, a large loop can intercept changing magnetic flux; the induced EMF must then be included. The simple lab circuits assume electrically short wires and lumped components.</p><Link to="/circuits/kirchhoff" className="text-primary">Open the Kirchhoff lab →</Link>
    </TheorySection>
    <TheorySection id="impedance" title="Impedance: magnitude and timing" equations={['ω = 2πf; ZR = R; ZL = jωL; ZC = 1/(jωC) = −j/(ωC)', 'Zseries = R + j(XL − XC); XL = ωL; XC = 1/(ωC)', '|Z| = √(R² + (XL − XC)²); θZ = atan2(XL − XC, R)', 'Î = V̂ / Z; current phase φI = −θZ']}>
      <p>The imaginary unit j satisfies j² = −1. Multiplication by j rotates an arrow 90°. It is bookkeeping for phase, not an imaginary physical component. A phasor V̂ represents the amplitude and phase of a sinusoid at one frequency; it is not its instantaneous voltage.</p>
      <p>Impedances in series add. Parallel branches add admittances: 1/Ztotal = Σ(1/Zbranch). Use complex numbers before taking the magnitude; adding the magnitudes alone loses cancellation and phase.</p>
      <p>R turns energy into heat. L and C temporarily store it. High frequency increases inductive reactance but decreases capacitive reactance. These formulas describe sinusoidal steady state after transients decay.</p>
    </TheorySection>
    <TheorySection id="phasors" title="Phasors: adding voltages as arrows" equations={['V̂source = V̂R + V̂L + V̂C', 'With current as reference: V̂R = Ipeak R; V̂L = j Ipeak XL; V̂C = −j Ipeak XC', 'i(t) = Ipeak sin(ωt + φI)']}>
      <p>Use current as the horizontal reference. The resistor voltage points right, the coil voltage up, and the capacitor voltage down. Their vector sum is the source. All arrows would rotate together at the same rate; this diagram holds the reference still.</p>
      <div className="figure-panel"><TheoryPhasors settings={s} /></div>
      <div className="max-w-lg"><label htmlFor="theory-frequency" className="control-label">Example frequency <output>{frequency.toFixed(3)} Hz</output></label><input id="theory-frequency" aria-label="Example frequency" className="range" type="range" min="0.2" max="5" step="0.01" value={frequency} onChange={e => setFrequency(Number(e.target.value))} /><Button variant="outline" onClick={() => setFrequency(f0)}><Target /> At resonance</Button></div>
      <WorkedExample><output aria-label="Circuit example result">6 V peak, 20 Ω, 10 H, 1000 µF: XL = {ac.xL.toFixed(2)} Ω; XC = {ac.xC.toFixed(2)} Ω; |Z| = {ac.impedance.toFixed(2)} Ω. Ipeak = {ac.peakCurrent.toFixed(2)} mA; current {Math.abs(ac.phase) < 0.001 ? 'is in phase (0.00°)' : `${ac.phase < 0 ? 'lags' : 'leads'} by ${Math.abs(ac.phase).toFixed(2)}°`}.</output></WorkedExample><Link to="/circuits" className="text-primary">Open the combined R/L/C lab →</Link>
    </TheorySection>
    <TheorySection id="power" title="RMS, real power and power factor" equations={['Vrms = Vpeak/√2; Irms = Ipeak/√2 (sine waves)', 'P = Vrms Irms cos θZ = Irms² R (watts)', 'S = Vrms Irms (VA); Qreactive = Vrms Irms sin θZ (var)', 'Power factor = cos θZ = R/|Z| (series RLC)']}>
      <p>RMS is the DC-equivalent heating value. Real power P is the average energy converted each second. Apparent power S includes energy that travels back and forth; reactive power is positive for a net inductive load and negative for a capacitive one. Reactive power Q is not the quality factor Q below.</p><WorkedExample><p>For the current example, Vrms = {(s.voltage / Math.SQRT2).toFixed(2)} V, Irms = {(ac.peakCurrent / Math.SQRT2).toFixed(2)} mA, power factor = {ac.powerFactor.toFixed(3)}, and real power = {((ac.peakCurrent / 1000) ** 2 / 2 * s.resistance).toFixed(3)} W.</p></WorkedExample>
    </TheorySection>
    <TheorySection id="resonance" title="Resonance: equal and opposite reactances" equations={['f₀ = 1/(2π√LC); at f₀: XL = XC, Z = R', 'Qseries = ω₀L/R = (1/R)√(L/C)', 'Half-power bandwidth Δf = R/(2πL) = f₀/Qseries', 'At resonance: VL,peak = VC,peak = Qseries Vsource,peak']}>
      <p>Energy cycles between the coil’s magnetic field and the capacitor’s electric field. In a driven series circuit, current peaks at f₀. Resistance supplies damping: less R means a taller, narrower peak. At the half-power frequencies current is 1/√2 of its peak; power in R is half.</p><WorkedExample><p>For 10 H, 1000 µF and 20 Ω, f₀ = {f0.toFixed(3)} Hz and Q = {q.toFixed(2)}. At resonance Ipeak = {resonant.peakCurrent.toFixed(1)} mA, while VL and VC each reach {resonant.vL.toFixed(1)} V peak despite the 6 V source. Their phases oppose, so they cancel rather than adding arithmetically.</p></WorkedExample>
      <p>Voltage magnification is not free energy: the source replaces resistive losses while stored energy circulates. These are series-circuit formulas; a parallel resonator behaves differently. Ideal lossless LC oscillates indefinitely; real coils and capacitors add losses.</p><Link to="/circuits/resonance" className="text-primary">Open the resonance lab →</Link>
    </TheorySection>
  </TheoryChapter>;
}