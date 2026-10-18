import { describe, expect, it } from 'vitest';
import { parallelResistorFlow } from './resistor-flow-model';

describe('parallel resistor current streams', () => {
  it('carries two blue charges per orange charge for a 2:1 branch current', () => {
    const [blue, orange] = parallelResistorFlow({ arrangement: 'parallel', voltage: 9, r1: 500, r2: 1000 }, 0);
    expect(blue?.current).toBe(18);
    expect(orange?.current).toBe(9);
    expect((blue?.rate ?? 0) / (orange?.rate ?? 1)).toBeCloseTo(2, 12);
  });
  it('keeps the current ratio when high currents require a slower shared scale', () => {
    const [blue, orange] = parallelResistorFlow({ arrangement: 'parallel', voltage: 12, r1: 100, r2: 300 }, 0);
    expect((blue?.rate ?? 0) / (orange?.rate ?? 1)).toBeCloseTo(3, 12);
  });
  it('routes orange charges across the lower R2 wire and both common wires', () => {
    const orange = parallelResistorFlow({ arrangement: 'parallel', voltage: 9, r1: 470, r2: 1000 }, 1)[1];
    expect(orange?.dots.some(dot => dot.y === 300 && dot.x > 260 && dot.x < 380)).toBe(true);
    expect(orange?.dots.some(dot => dot.y === 300 && dot.x > 120 && dot.x < 260)).toBe(true);
    expect(orange?.dots.some(dot => dot.y === 90 && dot.x > 120 && dot.x < 260)).toBe(true);
  });
  it('stops all charge flow at zero volts', () => {
    const streams = parallelResistorFlow({ arrangement: 'parallel', voltage: 0, r1: 470, r2: 1000 }, 10);
    expect(streams.map(stream => stream.rate)).toEqual([0, 0]);
    expect(streams.map(stream => stream.dots.length)).toEqual([0, 0]);
  });
});