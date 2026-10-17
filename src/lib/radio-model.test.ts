import { describe, expect, it } from 'vitest';
import { amEnvelope, defaultRadioSettings as d, detectorStep, discriminate, fmPhase, instantaneousFrequency, modeSettings, radioAnalysis, radioSamples, rfSignal, tuningGain } from './radio-model';

describe('radio signals', () => {
  it('AM changes amplitude between 0.4 and 1.6 at 60 percent depth', () => {
    expect(amEnvelope(d, 0)).toBeCloseTo(1.6, 10);
    expect(amEnvelope(d, 1 / (2 * d.audioHz))).toBeCloseTo(0.4, 10);
  });
  it('zero AM depth leaves the carrier unchanged', () => {
    const s = { ...d, depth: 0 };
    expect(rfSignal(s, 0.000123)).toBeCloseTo(Math.cos(2 * Math.PI * s.carrierHz * 0.000123), 10);
    expect(radioSamples(s, true).every(p => p.audio === 0)).toBe(true);
  });
  it('AM above 100 percent inverts the envelope and is flagged', () => {
    const s = { ...d, depth: 1.2 };
    expect(amEnvelope(s, 1 / (2 * s.audioHz))).toBeCloseTo(-0.2, 10);
    expect(radioAnalysis(s).overmodulated).toBe(true);
  });
  it('FM deviates 2.5 kHz around the carrier and has index five', () => {
    const s = modeSettings('fm');
    expect(instantaneousFrequency(s, 0)).toBe(100_002_500);
    expect(instantaneousFrequency(s, 1 / (2 * s.audioHz))).toBe(99_997_500);
    expect(radioAnalysis(s).index).toBe(5);
  });
  it('phase differentiation recovers the FM message', () => {
    const s = modeSettings('fm'), t = 0.0004, dt = 1e-8;
    expect(discriminate(fmPhase(s, t - dt), fmPhase(s, t), dt, s.carrierHz, s.deviationHz)).toBeCloseTo(Math.cos(2 * Math.PI * s.audioHz * (t - dt / 2)), 4);
  });
  it('the tuner is unity on station and -3 dB at a half-bandwidth offset', () => {
    expect(tuningGain(1e6, 1e6, 12000)).toBe(1);
    expect(tuningGain(1e6, 1e6 + 6000, 12000)).toBeCloseTo(Math.SQRT1_2, 10);
    expect(tuningGain(1e6, 1.1e6, 6000)).toBeLessThan(tuningGain(1e6, 1.1e6, 12000));
  });
  it('the diode charges instantly and RC decay follows its time constant', () => {
    expect(detectorStep(0, 1.5, 0.001, 0.001)).toBe(1.5);
    expect(detectorStep(1, 0, 0.001, 0.001)).toBeCloseTo(Math.exp(-1), 10);
  });
  it('an absent signal produces no recovered audio', () => {
    for (const mode of ['am', 'fm'] as const) expect(radioSamples({ ...modeSettings(mode), strength: 0 }, true).every(p => p.audio === 0)).toBe(true);
  });
  it('AM sidebands and FM Carson bandwidth depend on the message', () => {
    expect(radioAnalysis(d).bandwidth).toBe(1000);
    expect(radioAnalysis(modeSettings('fm')).bandwidth).toBe(6000);
  });
  it('transmitter average AM power includes two sidebands', () => {
    expect(radioAnalysis(d).averagePower).toBeCloseTo(1.18, 10);
    expect(radioAnalysis(modeSettings('fm')).averagePower).toBe(1);
  });
  it('superheterodyne local oscillator keeps the documented IF', () => {
    expect(radioAnalysis(d).loHz - d.tuneHz).toBe(455000);
    const s = modeSettings('fm');
    expect(radioAnalysis(s).loHz - s.tuneHz).toBe(10700000);
  });
  it('AM and FM plots are finite and carrier rate is inspection-scaled', () => {
    for (const mode of ['am', 'fm'] as const) {
      const samples = radioSamples({ ...modeSettings(mode), depth: 1.2 }, true);
      expect(samples).toHaveLength(1200);
      expect(samples.every(s => Object.values(s).every(Number.isFinite))).toBe(true);
    }
  });
});