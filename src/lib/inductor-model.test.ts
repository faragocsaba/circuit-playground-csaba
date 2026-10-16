import { describe, expect, it } from 'vitest';
import { acResponse, advance, defaultInductorSettings as d, initialState, qualityFactor, resonantFrequency, sample } from './inductor-model';

describe('inductor model', () => {
  it('RL: after one time constant (10 H / 20 Ω = 0.5 s) current reaches 63% of 6 V / 20 Ω', () => {
    const st = advance(d, initialState(d), 0.5);
    expect(sample(d, st).current).toBeCloseTo(300 * (1 - Math.exp(-1)), 6);
  });
  it('RL: at switch-on the whole source voltage appears across the inductor', () => {
    expect(sample(d, initialState(d)).vL).toBe(6);
  });
  it('resonance: 10 H with 1000 µF resonates at 1.59 Hz', () => {
    expect(resonantFrequency(d)).toBeCloseTo(1.5915, 3);
  });
  it('series RLC at resonance: impedance equals R and current is in phase', () => {
    const r = acResponse({ ...d, mode: 'rlc' }, resonantFrequency(d));
    expect(r.impedance).toBeCloseTo(20, 6); expect(r.phase).toBeCloseTo(0, 6); expect(r.peakCurrent).toBeCloseTo(300, 6);
  });
  it('LC tank conserves energy over one period when R is tiny', () => {
    const s = { ...d, mode: 'lc' as const, resistance: 1e-6 };
    const e0 = sample(s, initialState(s)); const after = sample(s, advance(s, initialState(s), 1 / resonantFrequency(s)));
    expect(after.energyL + after.energyC).toBeCloseTo(e0.energyC, 3);
    expect(after.vC).toBeCloseTo(6, 3);
  });
  it('quality factor √(L/C)/R = 100/20 = 5', () => { expect(qualityFactor(d)).toBeCloseTo(5, 9); });
});
