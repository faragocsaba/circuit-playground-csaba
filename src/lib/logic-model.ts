// Pure digital-logic model: gates, flip-flops and adders.
// Browser-safe, no side effects; every lab diagram consumes these results.

export type Bit = 0 | 1;

export type GateType = 'and' | 'or' | 'not' | 'nand' | 'nor' | 'xor' | 'xnor';

export const GATE_ORDER: GateType[] = ['and', 'or', 'not', 'nand', 'nor', 'xor', 'xnor'];

export const GATE_INFO: Record<GateType, { name: string; inputs: 1 | 2; blurb: string }> = {
  and: { name: 'AND', inputs: 2, blurb: 'Output is 1 only when both inputs are 1. Think of two switches in series: both must be closed for the lamp to light.' },
  or: { name: 'OR', inputs: 2, blurb: 'Output is 1 when at least one input is 1. Two switches in parallel: either one lights the lamp.' },
  not: { name: 'NOT', inputs: 1, blurb: 'The inverter: output is always the opposite of the input. One transistor is enough to build one.' },
  nand: { name: 'NAND', inputs: 2, blurb: 'AND followed by NOT: output is 0 only when both inputs are 1. The universal gate — every other gate, and whole computers, can be built from NAND alone.' },
  nor: { name: 'NOR', inputs: 2, blurb: 'OR followed by NOT: output is 1 only when both inputs are 0. Also universal, like NAND.' },
  xor: { name: 'XOR', inputs: 2, blurb: 'Exclusive OR: output is 1 when the inputs differ. This is exactly the sum bit of binary addition.' },
  xnor: { name: 'XNOR', inputs: 2, blurb: 'XOR followed by NOT: output is 1 when the inputs are equal — an equality detector.' },
};

export function gate(type: GateType, a: Bit, b: Bit = 0): Bit {
  switch (type) {
    case 'and': return a & b as Bit;
    case 'or': return a | b as Bit;
    case 'not': return a ? 0 : 1;
    case 'nand': return a & b ? 0 : 1;
    case 'nor': return a | b ? 0 : 1;
    case 'xor': return (a ^ b) as Bit;
    case 'xnor': return a ^ b ? 0 : 1;
  }
}

export interface TruthRow { a: Bit; b: Bit | null; out: Bit }

export function truthTable(type: GateType): TruthRow[] {
  if (GATE_INFO[type].inputs === 1) return ([0, 1] as Bit[]).map(a => ({ a, b: null, out: gate(type, a) }));
  const rows: TruthRow[] = [];
  for (const a of [0, 1] as Bit[]) for (const b of [0, 1] as Bit[]) rows.push({ a, b, out: gate(type, a, b) });
  return rows;
}

// ---------- Flip-flops ----------

export type FFType = 'sr' | 'd' | 'jk' | 't';

export const FF_ORDER: FFType[] = ['sr', 'd', 'jk', 't'];

export const FF_INFO: Record<FFType, { name: string; blurb: string }> = {
  sr: { name: 'SR latch (NAND)', blurb: 'Two cross-coupled NAND gates remember one bit. S̄ and R̄ are active-low: pull S̄ to 0 to set Q=1, R̄ to 0 to reset. Both at 0 is forbidden — both outputs go to 1 and the final state is a race.' },
  d: { name: 'D flip-flop', blurb: 'Data or delay flip-flop. On the rising clock edge Q takes the value of D. The workhorse of registers and memory.' },
  jk: { name: 'JK flip-flop', blurb: 'An SR flip-flop with the forbidden state removed: J=1 sets, K=1 resets, and J=K=1 toggles Q on each clock edge.' },
  t: { name: 'T flip-flop', blurb: 'Toggle flip-flop: when T=1, Q flips on every clock edge; when T=0 it holds. Chain them and you get a binary counter.' },
};

/** NAND SR latch: inputs are active-low (sBar, rBar). Returns new Q. */
export function srLatch(sBar: Bit, rBar: Bit, q: Bit): Bit {
  // Cross-coupled NAND: Q = NAND(S̄, Q̄), Q̄ = NAND(R̄, Q). One step of settling.
  const qBar = gate('nand', rBar, q);
  return gate('nand', sBar, qBar);
}

export function srLatchQBar(sBar: Bit, rBar: Bit, q: Bit): Bit {
  return gate('nand', rBar, q);
}

/** Edge-triggered next state. `type` d/jk/t; for sr use srLatch. */
export function ffNext(type: Exclude<FFType, 'sr'>, inputs: { d?: Bit; j?: Bit; k?: Bit; t?: Bit }, q: Bit): Bit {
  switch (type) {
    case 'd': return inputs.d ?? 0;
    case 'jk': {
      const j = inputs.j ?? 0, k = inputs.k ?? 0;
      if (j && k) return q ? 0 : 1;
      if (j) return 1;
      if (k) return 0;
      return q;
    }
    case 't': return inputs.t ? (q ? 0 : 1) : q;
  }
}

/** Characteristic table rows for display. */
export function ffRows(type: FFType): { inputs: [string, string][]; qNext: string; note: string }[] {
  switch (type) {
    case 'sr': return [
      { inputs: [['S̄', '0'], ['R̄', '1']], qNext: '1', note: 'Set' },
      { inputs: [['S̄', '1'], ['R̄', '0']], qNext: '0', note: 'Reset' },
      { inputs: [['S̄', '1'], ['R̄', '1']], qNext: 'Q', note: 'Hold' },
      { inputs: [['S̄', '0'], ['R̄', '0']], qNext: '1*', note: 'Forbidden' },
    ];
    case 'd': return [
      { inputs: [['D', '0']], qNext: '0', note: 'Reset on clock ↑' },
      { inputs: [['D', '1']], qNext: '1', note: 'Set on clock ↑' },
    ];
    case 'jk': return [
      { inputs: [['J', '0'], ['K', '0']], qNext: 'Q', note: 'Hold' },
      { inputs: [['J', '1'], ['K', '0']], qNext: '1', note: 'Set' },
      { inputs: [['J', '0'], ['K', '1']], qNext: '0', note: 'Reset' },
      { inputs: [['J', '1'], ['K', '1']], qNext: 'Q̄', note: 'Toggle' },
    ];
    case 't': return [
      { inputs: [['T', '0']], qNext: 'Q', note: 'Hold' },
      { inputs: [['T', '1']], qNext: 'Q̄', note: 'Toggle' },
    ];
  }
}

// ---------- Adders ----------

export function halfAdder(a: Bit, b: Bit): { sum: Bit; carry: Bit } {
  return { sum: gate('xor', a, b), carry: gate('and', a, b) };
}

export function fullAdder(a: Bit, b: Bit, cin: Bit): { sum: Bit; carry: Bit } {
  const h1 = halfAdder(a, b);
  const h2 = halfAdder(h1.sum, cin);
  return { sum: h2.sum, carry: gate('or', h1.carry, h2.carry) };
}

export interface RippleResult {
  bits: { a: Bit; b: Bit; cin: Bit; sum: Bit; cout: Bit }[];
  sum: Bit[];          // least-significant first
  overflow: Bit;
  decimal: { a: number; b: number; sum: number };
}

export function rippleAdd(a: Bit[], b: Bit[], cin: Bit = 0): RippleResult {
  const bits: RippleResult['bits'] = [];
  let carry = cin;
  for (let i = 0; i < a.length; i++) {
    const r = fullAdder(a[i], b[i], carry);
    bits.push({ a: a[i], b: b[i], cin: carry, sum: r.sum, cout: r.carry });
    carry = r.carry;
  }
  const toDec = (bs: Bit[]) => bs.reduce((n, bit, i) => n + bit * 2 ** i, 0);
  return { bits, sum: bits.map(x => x.sum), overflow: carry, decimal: { a: toDec(a), b: toDec(b), sum: toDec(bits.map(x => x.sum)) + carry * 2 ** a.length } };
}

export function toBits(n: number, width: number): Bit[] {
  return Array.from({ length: width }, (_, i) => ((n >> i) & 1) as Bit);
}
