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

import { kirchhoff } from './resistor-model';
describe('kirchhoff', () => {
  it('parallel junction: 9 V across 470 Ω and 1 kΩ splits 28.15 mA into 19.15 + 9 mA', () => {
    const { kcl } = kirchhoff({ arrangement: 'parallel', voltage: 9, r1: 470, r2: 1000 });
    expect(kcl.out[0]).toBeCloseTo(19.149, 2); expect(kcl.out[1]).toBeCloseTo(9, 5);
    expect(kcl.into).toBeCloseTo(kcl.out[0]! + kcl.out[1]!, 9);
  });
  it('series loop: drops add up to the 9 V source', () => {
    const { loops } = kirchhoff({ arrangement: 'series', voltage: 9, r1: 470, r2: 1000 });
    expect(loops).toHaveLength(1); expect(loops[0]!.drops[0]! + loops[0]!.drops[1]!).toBeCloseTo(9, 9);
  });
  it('parallel has two loops, each dropping the full source voltage', () => {
    const { loops } = kirchhoff({ arrangement: 'parallel', voltage: 6, r1: 330, r2: 2200 });
    expect(loops.map(l => l.drops[0])).toEqual([expect.closeTo(6, 9), expect.closeTo(6, 9)]);
  });
});
