import { describe, expect, it } from 'vitest';
import { fetChannelCurrent, fetModel, type FetConfiguration, type FetKind } from './fet-model';

describe('Voltage-controlled FET model', () => {
  it('enhancement MOSFET is off at zero gate bias and below its 2 V threshold', () => {
    expect(fetChannelCurrent('mosfet', 0, 5)).toBe(0);
    expect(fetChannelCurrent('mosfet', 2, 5)).toBe(0);
    expect(fetChannelCurrent('mosfet', 3, 5)).toBe(1);
  });
  it('JFET conducts at zero bias and pinches off at −4 V', () => {
    expect(fetChannelCurrent('jfet', 0, 5)).toBe(10);
    expect(fetChannelCurrent('jfet', -4, 5)).toBe(0);
    expect(fetChannelCurrent('jfet', -2, 5)).toBe(2.5);
  });
  for (const kind of ['mosfet', 'jfet'] as FetKind[]) {
    for (const config of ['source', 'gate', 'drain'] as FetConfiguration[]) {
      it(`${kind} ${config} has no steady gate current and conserves channel current`, () => {
        for (const supply of [0, 1, 5, 12]) for (const drive of kind === 'mosfet' ? [0, 2, 3, 5] : [-4, -2, 0]) {
          const m = fetModel(kind, 'n', config, drive, supply);
          expect(m.ig).toBe(0);
          expect(m.is).toBe(m.id);
          expect(m.id).toBeCloseTo(fetChannelCurrent(kind, m.vgs, m.vds), 7);
          expect(m.id).toBeCloseTo(config === 'drain' ? m.vs : supply - m.vd, 7);
          if (kind === 'jfet') expect(m.vgs).toBeLessThanOrEqual(0);
        }
      });
      it(`${kind} ${config} mirrors n/p voltages, not current magnitudes`, () => {
        const n = fetModel(kind, 'n', config, kind === 'mosfet' ? 3 : -1, 5);
        const p = fetModel(kind, 'p', config, kind === 'mosfet' ? 3 : -1, 5);
        expect(p.id).toBe(n.id);
        expect(p.vgs).toBe(-n.vgs);
        expect(p.output).toBe(-n.output);
      });
    }
  }
  it('common source inverts and common drain follows increased gate voltage', () => {
    expect(fetModel('mosfet', 'n', 'source', 4, 5).output).toBeLessThan(fetModel('mosfet', 'n', 'source', 3, 5).output);
    expect(fetModel('mosfet', 'n', 'drain', 4, 5).output).toBeGreaterThan(fetModel('mosfet', 'n', 'drain', 3, 5).output);
  });
  it('FET saturation is an amplifying region, distinct from the ohmic region', () => {
    expect(fetModel('mosfet', 'n', 'source', 3, 5).state).toBe('Saturation');
    expect(fetModel('mosfet', 'n', 'source', 5, 1).state).toBe('Ohmic');
  });
});