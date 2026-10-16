import { describe, expect, it } from 'vitest';
import { coilFace, defaultLenzSettings as d, flux, fluxRate, inducedCurrent, inducedEmf, oscillation } from './lenz-model';

describe('lenz model', () => {
  it('flux falls off with distance squared', () => {
    expect(flux(2)).toBeCloseTo(flux(1) / 4, 9);
  });
  it('an approaching north pole induces current that makes the near face a north pole (repels)', () => {
    expect(inducedEmf(d, 2, 1)).toBeLessThan(0);
    expect(coilFace(d, 1)).toBe('north');
  });
  it('a receding north pole flips the current: the coil attracts the magnet back', () => {
    expect(inducedEmf(d, 2, -1)).toBeGreaterThan(0);
    expect(coilFace(d, -1)).toBe('south');
  });
  it('a stationary magnet induces nothing', () => {
    expect(inducedEmf(d, 2, 0)).toBe(0);
    expect(inducedCurrent(d, 2, 0)).toBe(0);
    expect(coilFace(d, 0)).toBe('none');
  });
  it('south pole reverses every sign', () => {
    const s = { ...d, pole: 'south' as const };
    expect(inducedEmf(s, 2, 1)).toBeCloseTo(-inducedEmf(d, 2, 1), 12);
    expect(coilFace(s, 1)).toBe('south');
  });
  it('closer magnet at the same speed induces a stronger EMF', () => {
    expect(Math.abs(inducedEmf(d, 1.2, 1))).toBeGreaterThan(Math.abs(inducedEmf(d, 3, 1)));
  });
  it('oscillation stays within bounds and velocity peaks at the midpoint', () => {
    const at = (t: number) => oscillation(t);
    expect(at(0).distance).toBeCloseTo(4, 9);
    expect(at(3).distance).toBeCloseTo(1.2, 9);
    expect(Math.abs(at(1.5).velocity)).toBeGreaterThan(Math.abs(at(0.1).velocity));
  });
});
