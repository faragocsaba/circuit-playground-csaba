import { describe, expect, it } from 'vitest';
import { cmosNetworks, ffNext, fullAdder, gate, GATE_BUILD, halfAdder, mosConducts, rippleAdd, srLatch, toBits, truthTable, type PrimitiveGate } from './logic-model';

describe('gates', () => {
  it('AND is 1 only when both inputs are 1', () => {
    expect(gate('and', 0, 0)).toBe(0);
    expect(gate('and', 0, 1)).toBe(0);
    expect(gate('and', 1, 0)).toBe(0);
    expect(gate('and', 1, 1)).toBe(1);
  });
  it('NAND is the exact inverse of AND', () => {
    for (const a of [0, 1] as const) for (const b of [0, 1] as const)
      expect(gate('nand', a, b)).toBe(gate('and', a, b) ? 0 : 1);
  });
  it('XOR is 1 exactly when the inputs differ', () => {
    expect(gate('xor', 0, 0)).toBe(0);
    expect(gate('xor', 1, 1)).toBe(0);
    expect(gate('xor', 0, 1)).toBe(1);
    expect(gate('xor', 1, 0)).toBe(1);
  });
  it('NOT inverts', () => {
    expect(gate('not', 0)).toBe(1);
    expect(gate('not', 1)).toBe(0);
  });
  it('truth tables have 4 rows for 2-input gates and 2 for NOT', () => {
    expect(truthTable('and')).toHaveLength(4);
    expect(truthTable('not')).toHaveLength(2);
  });
});

describe('SR latch (NAND, active-low)', () => {
  it('sets Q to 1 when S̄ is pulled low', () => {
    expect(srLatch(0, 1, 0)).toBe(1);
  });
  it('resets Q to 0 when R̄ is pulled low', () => {
    expect(srLatch(1, 0, 1)).toBe(0);
  });
  it('holds its state when both inputs stay high', () => {
    expect(srLatch(1, 1, 1)).toBe(1);
    expect(srLatch(1, 1, 0)).toBe(0);
  });
  it('both-low is forbidden: Q goes to 1 regardless of prior state', () => {
    expect(srLatch(0, 0, 0)).toBe(1);
    expect(srLatch(0, 0, 1)).toBe(1);
  });
});

describe('edge-triggered flip-flops', () => {
  it('D copies the input', () => {
    expect(ffNext('d', { d: 1 }, 0)).toBe(1);
    expect(ffNext('d', { d: 0 }, 1)).toBe(0);
  });
  it('JK toggles when J=K=1', () => {
    expect(ffNext('jk', { j: 1, k: 1 }, 0)).toBe(1);
    expect(ffNext('jk', { j: 1, k: 1 }, 1)).toBe(0);
  });
  it('JK holds when J=K=0', () => {
    expect(ffNext('jk', { j: 0, k: 0 }, 1)).toBe(1);
  });
  it('T toggles only when T=1', () => {
    expect(ffNext('t', { t: 1 }, 0)).toBe(1);
    expect(ffNext('t', { t: 0 }, 0)).toBe(0);
  });
});

describe('adders', () => {
  it('half adder: 1 + 1 = 0 carry 1', () => {
    expect(halfAdder(1, 1)).toEqual({ sum: 0, carry: 1 });
    expect(halfAdder(1, 0)).toEqual({ sum: 1, carry: 0 });
  });
  it('full adder: 1 + 1 + 1 = 1 carry 1', () => {
    expect(fullAdder(1, 1, 1)).toEqual({ sum: 1, carry: 1 });
    expect(fullAdder(1, 0, 1)).toEqual({ sum: 0, carry: 1 });
  });
  it('4-bit ripple adder computes 7 + 5 = 12', () => {
    const r = rippleAdd(toBits(7, 4), toBits(5, 4));
    expect(r.decimal).toEqual({ a: 7, b: 5, sum: 12 });
    expect(r.overflow).toBe(0);
  });
  it('4-bit ripple adder flags overflow on 9 + 8 = 17', () => {
    const r = rippleAdd(toBits(9, 4), toBits(8, 4));
    expect(r.overflow).toBe(1);
    expect(r.decimal.sum).toBe(17);
  });
  it('carry ripples: 15 + 1 sets the carry out of every stage', () => {
    const r = rippleAdd(toBits(15, 4), toBits(1, 4));
    expect(r.bits.every(b => b.cout === 1)).toBe(true);
  });
});

describe('CMOS transistor implementation', () => {
  it('a PMOS conducts on gate 0, an NMOS on gate 1', () => {
    expect(mosConducts('pmos', 0)).toBe(true);
    expect(mosConducts('pmos', 1)).toBe(false);
    expect(mosConducts('nmos', 1)).toBe(true);
    expect(mosConducts('nmos', 0)).toBe(false);
  });
  it('exactly one network conducts for every input of every primitive gate', () => {
    for (const type of ['not', 'nand', 'nor'] as PrimitiveGate[]) {
      for (const a of [0, 1] as const) for (const b of [0, 1] as const) {
        const { pullUp, pullDown } = cmosNetworks(type, a, b);
        expect(pullUp).not.toBe(pullDown);
        // the conducting network sets the output: up = 1, down = 0
        expect(pullUp ? 1 : 0).toBe(gate(type, a, b));
      }
    }
  });
  it('NAND pulls down only when both inputs are 1', () => {
    expect(cmosNetworks('nand', 1, 1).pullDown).toBe(true);
    expect(cmosNetworks('nand', 1, 0).pullUp).toBe(true);
  });
  it('transistor counts: NOT 2, NAND/NOR 4, AND/OR 6', () => {
    expect(GATE_BUILD.not.transistors).toBe(2);
    expect(GATE_BUILD.nand.transistors).toBe(4);
    expect(GATE_BUILD.nor.transistors).toBe(4);
    expect(GATE_BUILD.and.transistors).toBe(6);
    expect(GATE_BUILD.or.transistors).toBe(6);
  });
});
