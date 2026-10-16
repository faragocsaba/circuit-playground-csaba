import { describe, expect, it } from 'vitest';
import { colorBands, resistorModel } from './resistor-model';

describe('resistor model', () => {
  it('follows Ohm\'s law for one resistor', () => {
    const m = resistorModel({ arrangement: 'single', voltage: 10, r1: 1000, r2: 500 });
    expect(m.current).toBeCloseTo(10);
    expect(m.power).toBeCloseTo(100);
  });
  it('adds series resistances and splits voltage', () => {
    const m = resistorModel({ arrangement: 'series', voltage: 9, r1: 1000, r2: 2000 });
    expect(m.total).toBe(3000);
    expect(m.v1 + m.v2).toBeCloseTo(9);
    expect(m.v2).toBeCloseTo(6);
  });
  it('splits parallel current and conserves it', () => {
    const m = resistorModel({ arrangement: 'parallel', voltage: 6, r1: 1000, r2: 1000 });
    expect(m.total).toBe(500);
    expect(m.i1 + m.i2).toBeCloseTo(m.current);
  });
  it('encodes color bands', () => {
    expect(colorBands(470)).toEqual(['yellow', 'violet', 'brown', 'gold']);
    expect(colorBands(1000)).toEqual(['brown', 'black', 'red', 'gold']);
    expect(colorBands(10)).toEqual(['brown', 'black', 'black', 'gold']);
  });
});
