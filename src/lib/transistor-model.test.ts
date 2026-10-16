import { describe, expect, it } from 'vitest';
import { transistorModel, transistorFlow, BETA, type Configuration, type TransistorType } from './transistor-model';
const configs: Configuration[] = ['emitter', 'base', 'collector'];
describe('Educational BJT model', () => {
  for (const config of configs) for (const type of ['npn', 'pnp'] as TransistorType[]) {
    it(`${type} ${config} illustrates one base plus ten collector dots as eleven emitter dots`, () => {
      const model = transistorModel(type, config, config === 'base' ? 4.04 : 40, 12);
      const flow = transistorFlow(model);
      expect(flow.base).toBe(1);
      expect(flow.collector).toBe(10);
      expect(flow.emitter).toBe(11);
      expect(model.ic / model.ib).toBeCloseTo(100);
    });
    it(`${type} ${config} conserves current and respects the load`, () => {
      for (const supply of [0, .5, 1, 5, 12]) for (const drive of [0, 1, 4, 40, 150]) {
        const m = transistorModel(type, config, drive, supply);
        expect(m.ie).toBeCloseTo(m.ib + m.ic);
        expect(m.ic).toBeGreaterThanOrEqual(0);
        expect(Math.abs(m.output)).toBeLessThanOrEqual(supply);
        if (config === 'collector') expect(m.ie).toBeCloseTo(Math.abs(m.ve));
        if (config === 'base' && supply > .7) expect(m.ie).toBeCloseTo(drive);
      }
    });
    it(`${type} ${config} has cutoff and saturation`, () => {
      expect(transistorModel(type, config, 0, 5).state).toBe('Cutoff');
      expect(transistorModel(type, config, 40, .5).ic).toBe(0);
      expect(transistorModel(type, config, 150, 5).state).toBe('Saturation');
    });
  }
  it('mirrors voltage polarity, not current magnitudes', () => {
    for (const config of configs) {
      const n = transistorModel('npn', config, 2, 12), p = transistorModel('pnp', config, 2, 12);
      expect(n.ic).toBe(p.ic); expect(n.ib).toBe(p.ib);
      expect(n.output).toBe(-p.output); expect(n.vb).toBe(-p.vb);
    }
  });
  it('preserves dot contributions in saturation and stops all dots at cutoff', () => {
    for (const config of configs) {
      const saturated = transistorFlow(transistorModel('npn', config, 150, 5));
      expect(saturated.collector).toBeLessThan(10);
      expect(saturated.emitter).toBe(saturated.base + saturated.collector);
      const cutoff = transistorFlow(transistorModel('npn', config, 0, 5));
      expect([cutoff.base, cutoff.collector, cutoff.emitter]).toEqual([0, 0, 0]);
    }
  });
  it('increases dot rate when current increases', () => {
    const low = transistorFlow(transistorModel('npn', 'emitter', 10, 12));
    const high = transistorFlow(transistorModel('npn', 'emitter', 40, 12));
    expect(high.period).toBeLessThan(low.period);
  });
  it('follows active gain and response directions', () => {
    const a = transistorModel('npn', 'emitter', 20, 12), b = transistorModel('npn', 'emitter', 40, 12);
    expect(a.ic).toBeCloseTo(a.ib * BETA); expect(b.ic).toBeCloseTo(a.ic * 2); expect(b.output).toBeLessThan(a.output);
    const ca = transistorModel('npn', 'collector', 20, 12), cb = transistorModel('npn', 'collector', 40, 12);
    expect(cb.output).toBeGreaterThan(ca.output); expect(ca.vb - ca.ve).toBeCloseTo(.7);
    const ba = transistorModel('npn', 'base', 2, 12), bb = transistorModel('npn', 'base', 4, 12);
    expect(ba.ic / ba.ie).toBeCloseTo(100 / 101); expect(bb.output).toBeLessThan(ba.output);
  });
});
