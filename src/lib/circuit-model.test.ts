import { describe, expect, it } from 'vitest';
import { analyze, combination, defaultCircuitSettings as d, instant } from './circuit-model';

describe('circuit model', () => {
  it('pure R: impedance is R, current in phase, power factor 1', () => {
    const a = analyze({ ...d, useL: false, useC: false });
    expect(a.impedance).toBeCloseTo(20, 9);
    expect(a.phase).toBeCloseTo(0, 9);
    expect(a.powerFactor).toBeCloseTo(1, 9);
    expect(a.peakCurrent).toBeCloseTo(300, 6);
  });
  it('pure C at 1 Hz with 1000 µF: Xc = 1/(2πfC) ≈ 159 Ω, current leads by 90°', () => {
    const a = analyze({ ...d, useR: false, useL: false, frequency: 1 });
    expect(a.xC).toBeCloseTo(159.15, 1);
    expect(a.phase).toBeCloseTo(90, 6);
  });
  it('RLC at resonance (1.59 Hz): impedance equals R and current is in phase', () => {
    const a = analyze(d);
    expect(a.resonant).toBe(true);
    expect(a.impedance).toBeCloseTo(20, 6);
    expect(a.phase).toBeCloseTo(0, 6);
    expect(a.peakCurrent).toBeCloseTo(300, 6);
  });
  it('below resonance the capacitor dominates: current leads', () => {
    expect(analyze({ ...d, frequency: 0.5 }).phase).toBeGreaterThan(0);
    expect(analyze({ ...d, frequency: 5 }).phase).toBeLessThan(0);
  });
  it('component voltages: at resonance vL and vC cancel and can exceed the source', () => {
    const a = analyze(d);
    expect(a.vL).toBeCloseTo(a.vC, 6);
    expect(a.vL).toBeGreaterThan(d.voltage);
    expect(a.vR).toBeCloseTo(d.voltage, 6);
  });
  it('nothing switched in: no current', () => {
    expect(analyze({ ...d, useR: false, useL: false, useC: false }).peakCurrent).toBe(0);
  });
  it('combination names the active parts', () => {
    expect(combination(d)).toBe('RLC');
    expect(combination({ ...d, useL: false })).toBe('RC');
    expect(combination({ ...d, useR: false, useL: false, useC: false })).toBe('open');
  });
  it('instantaneous current peaks a quarter cycle before the source when purely capacitive', () => {
    const s = { ...d, useR: false, useL: false, frequency: 1 };
    const a = analyze(s);
    const t0 = 0.25; // source zero rising at t=0; peak at T/4
    expect(instant(s, a, t0).source).toBeCloseTo(d.voltage, 6);
    expect(instant(s, a, t0).current).toBeCloseTo(0, 4);
  });
});
