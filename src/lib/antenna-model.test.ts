import { describe, expect, it } from 'vitest';
import { antennaModel, patternRaw, resonantLength, wavelength } from './antenna-model';

describe('antenna model', () => {
  it('wavelength at 100 MHz is about 3 m', () => expect(wavelength(100)).toBeCloseTo(2.998, 2));
  it('half-wave dipole is resonant near half a wavelength', () => {
    expect(resonantLength('dipole', 100)).toBeCloseTo(1.44, 1);
    const m = antennaModel({ type: 'dipole', frequencyMHz: 100, lengthM: resonantLength('dipole', 100), mode: 'transmit' });
    expect(m.match).toBeCloseTo(1, 5);
    expect(m.radiationResistance).toBeGreaterThan(60);
    expect(m.radiationResistance).toBeLessThan(80);
  });
  it('a detuned dipole accepts much less power', () => {
    const m = antennaModel({ type: 'dipole', frequencyMHz: 100, lengthM: 0.7, mode: 'transmit' });
    expect(m.match).toBeLessThan(0.1);
  });
  it('dipole has nulls along its rods and a maximum broadside', () => {
    expect(patternRaw('dipole', 1.44, 100, Math.PI / 2)).toBeCloseTo(0, 5);
    expect(patternRaw('dipole', 1.44, 100, 0)).toBeGreaterThan(0.9);
  });
  it('monopole radiates only above the ground plane', () => expect(patternRaw('monopole', 0.72, 100, -Math.PI / 4)).toBe(0));
  it('yagi beams forward with a strong front-to-back ratio', () => {
    const m = antennaModel({ type: 'yagi', frequencyMHz: 100, lengthM: 1.44, mode: 'transmit' });
    expect(m.frontToBack).toBeGreaterThan(10);
  });
});
