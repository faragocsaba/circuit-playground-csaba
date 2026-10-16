// SVG diagrams for the digital labs: gate symbols, flip-flops, adders, transistor-level gates.
// Signal colors come from CSS classes .sig-high / .sig-low (see styles.css).

import type { Bit, FFType, GateType, PrimitiveGate, RippleResult } from '@/lib/logic-model';
import { cmosNetworks, FF_INFO, GATE_BUILD, GATE_INFO, gate, mosConducts, srLatchQBar } from '@/lib/logic-model';

const H = 'sig-high';
const L = 'sig-low';
const cls = (b: Bit | boolean) => (b ? H : L);

function Wire({ d, bit }: { d: string; bit: Bit | boolean }) {
  return <path d={d} className={`sig-wire ${cls(bit)}`} />;
}

function Pin({ x, y, bit, label, onToggle }: { x: number; y: number; bit: Bit; label?: string | undefined; onToggle?: (() => void) | undefined }) {
  return <g onClick={onToggle} style={onToggle ? { cursor: 'pointer' } : undefined} role={onToggle ? 'button' : undefined} aria-label={onToggle ? `Toggle ${label}` : undefined}>
    <circle cx={x} cy={y} r={9} className={`sig-pin ${cls(bit)}`} />
    <text x={x} y={y + 3.5} textAnchor="middle" className="sig-pin-text">{bit}</text>
    {label && <text x={x} y={y - 15} textAnchor="middle" className="terminal-label">{label}</text>}
  </g>;
}

// ---------- Gate symbols (distinctive shapes, IEC/ANSI style) ----------

export function GateSymbol({ type, a, b, onToggleA, onToggleB, motion = 0 }: {
  type: GateType; a: Bit; b: Bit; onToggleA?: () => void; onToggleB?: () => void; motion?: number;
}) {
  const two = GATE_INFO[type].inputs === 2;
  const out = gate(type, a, b);
  const cx = 200; // gate body center x
  const ya = two ? 120 : 140, yb = 160, yo = 140;
  const body = (() => {
    switch (type) {
      case 'and': case 'nand':
        return <path d={`M ${cx - 30} ${yo - 30} h 25 a 30 30 0 0 1 0 60 h -25 z`} className="symbol" />;
      case 'or': case 'nor': case 'xor': case 'xnor':
        return <>
          <path d={`M ${cx - 32} ${yo - 30} q 18 30 0 60 q 32 -12 62 -30 q -30 -18 -62 -30 z`} className="symbol" />;
          {(type === 'xor' || type === 'xnor') && <path d={`M ${cx - 42} ${yo - 30} q 18 30 0 60`} className="symbol" />}
        </>;
      case 'not':
        return <path d={`M ${cx - 28} ${yo - 28} v 56 l 52 -28 z`} className="symbol" />;
    }
  })();
  const bubble = type === 'nand' || type === 'nor' || type === 'xnor' || type === 'not';
  const outX = type === 'not' ? cx + 24 : cx + 30;
  const inX = type === 'xor' || type === 'xnor' ? cx - 42 : cx - 32;
  // travelling pulses on the wires
  const pulse = (x0: number, y0: number, x1: number, y1: number, bit: Bit, key: string) =>
    bit ? <circle key={key} r={4} className="sig-pulse"><animateMotion dur="1.6s" repeatCount="indefinite" path={`M ${x0} ${y0} L ${x1} ${y1}`} begin={`${motion % 1.6}s`} /></circle> : null;
  return <svg viewBox="0 0 400 280" className="circuit-svg" style={{ height: 300 }} role="img" aria-label={`${GATE_INFO[type].name} gate symbol`}>
    <Wire d={`M 60 ${ya} H ${inX + (two ? 0 : 4)}`} bit={a} />
    {two && <Wire d={`M 60 ${yb} H ${inX}`} bit={b} />}
    {body}
    {bubble && <circle cx={outX + 6} cy={yo} r={6} className="symbol" />}
    <Wire d={`M ${bubble ? outX + 12 : outX} ${yo} H 340`} bit={out} />
    {pulse(60, ya, inX, ya, a, 'pa')}
    {two && pulse(60, yb, inX, yb, b, 'pb')}
    {pulse(bubble ? outX + 12 : outX, yo, 340, yo, out, 'po')}
    <Pin x={60} y={ya} bit={a} label="A" onToggle={onToggleA} />
    {two && <Pin x={60} y={yb} bit={b} label="B" onToggle={onToggleB} />}
    <Pin x={340} y={yo} bit={out} label="OUT" />
    <text x={cx} y={250} textAnchor="middle" className="terminal-label" style={{ fontSize: 14 }}>{GATE_INFO[type].name}</text>
  </svg>;
}

// ---------- Flip-flop diagrams ----------

function NandMini({ x, y, inA, inB, out, label }: { x: number; y: number; inA: Bit; inB: Bit; out: Bit; label: string }) {
  return <g>
    <path d={`M ${x} ${y - 16} h 14 a 16 16 0 0 1 0 32 h -14 z`} className="symbol" style={{ strokeWidth: 2 }} />
    <circle cx={x + 34} cy={y} r={3.5} className="symbol" style={{ strokeWidth: 2 }} />
    <Wire d={`M ${x - 26} ${y - 8} H ${x}`} bit={inA} />
    <Wire d={`M ${x - 26} ${y + 8} H ${x}`} bit={inB} />
    <Wire d={`M ${x + 38} ${y} H ${x + 62}`} bit={out} />
    <text x={x + 15} y={y - 24} textAnchor="middle">{label}</text>
  </g>;
}

export function FlipFlopDiagram({ type, inputs, q, clock, onToggle }: {
  type: FFType;
  inputs: Record<string, Bit>;
  q: Bit;
  clock?: Bit;
  onToggle: (name: string) => void;
}) {
  if (type === 'sr') {
    const sBar = inputs['sBar'] ?? 1, rBar = inputs['rBar'] ?? 1;
    const qBar = srLatchQBar(sBar, rBar, q);
    return <svg viewBox="0 0 400 280" className="circuit-svg" style={{ height: 300 }} role="img" aria-label="SR latch built from two NAND gates">
      <NandMini x={150} y={100} inA={sBar} inB={qBar} out={q} label="NAND 1" />
      <NandMini x={150} y={190} inA={q} inB={rBar} out={qBar} label="NAND 2" />
      {/* cross-coupling wires: Q feeds NAND 2's upper input, Q̄ feeds NAND 1's lower input */}
      <Wire d={`M 212 100 H 250 V 182 H 124`} bit={q} />
      <Wire d={`M 212 190 H 262 V 108 H 124`} bit={qBar} />
      <circle cx={250} cy={100} r={3} className={`sig-node ${cls(q)}`} />
      <circle cx={262} cy={190} r={3} className={`sig-node ${cls(qBar)}`} />
      <Wire d={`M 60 92 H 124`} bit={sBar} />
      <Wire d={`M 60 198 H 124`} bit={rBar} />
      <Pin x={60} y={92} bit={sBar} label="S̄" onToggle={() => onToggle('sBar')} />
      <Pin x={60} y={198} bit={rBar} label="R̄" onToggle={() => onToggle('rBar')} />
      <Pin x={330} y={100} bit={q} label="Q" />
      <Pin x={330} y={190} bit={qBar} label="Q̄" />
      <Wire d="M 288 100 H 321" bit={q} />
      <Wire d="M 288 190 H 321" bit={qBar} />
    </svg>;
  }
  // Box-style flip-flop with clock triangle
  const names = type === 'd' ? ['d'] : type === 'jk' ? ['j', 'k'] : ['t'];
  const labels: Record<string, string> = { d: 'D', j: 'J', k: 'K', t: 'T' };
  const y0 = 110, gap = 40;
  return <svg viewBox="0 0 400 280" className="circuit-svg" style={{ height: 300 }} role="img" aria-label={`${FF_INFO[type].name} symbol`}>
    <rect x={160} y={80} width={90} height={130} rx={6} className="symbol" style={{ fill: 'var(--card)' }} />
    <text x={205} y={70} textAnchor="middle" className="terminal-label">{FF_INFO[type].name}</text>
    {names.map((n, i) => {
      const y = y0 + i * gap;
      return <g key={n}>
        <Wire d={`M 60 ${y} H 160`} bit={inputs[n] ?? 0} />
        <Pin x={60} y={y} bit={inputs[n] ?? 0} label={labels[n]} onToggle={() => onToggle(n)} />
        <text x={168} y={y + 4}>{labels[n]}</text>
      </g>;
    })}
    <Wire d={`M 60 190 H 160`} bit={clock ?? 0} />
    <path d="M 160 182 l 12 8 l -12 8" className="symbol" style={{ strokeWidth: 2 }} />
    <text x={176} y={205}>CLK</text>
    <Pin x={60} y={190} bit={clock ?? 0} label="CLK" onToggle={() => onToggle('clock')} />
    <Wire d="M 250 115 H 321" bit={q} />
    <Wire d="M 250 175 H 321" bit={q ? 0 : 1} />
    <text x={238} y={119} textAnchor="end">Q</text>
    <text x={238} y={179} textAnchor="end">Q̄</text>
    <Pin x={330} y={115} bit={q} label="Q" />
    <Pin x={330} y={175} bit={q ? 0 : 1} label="Q̄" />
  </svg>;
}

// ---------- Adder diagrams ----------

export function HalfAdderDiagram({ a, b, onToggleA, onToggleB }: { a: Bit; b: Bit; onToggleA: () => void; onToggleB: () => void }) {
  const sum = gate('xor', a, b), carry = gate('and', a, b);
  return <svg viewBox="0 0 400 280" className="circuit-svg" style={{ height: 300 }} role="img" aria-label="Half adder: XOR for the sum, AND for the carry">
    <Wire d="M 50 90 H 120 V 120 H 148" bit={a} />
    <Wire d="M 50 190 H 110 V 150 H 148" bit={b} />
    <circle cx={120} cy={90} r={3} className={`sig-node ${cls(a)}`} />
    <circle cx={110} cy={190} r={3} className={`sig-node ${cls(b)}`} />
    <Wire d="M 120 90 V 60 H 218" bit={a} />
    <Wire d="M 110 190 V 220 H 218" bit={b} />
    {/* XOR gate */}
    <path d="M 148 105 q 12 15 0 30 q 21 -8 41 -15 q -20 -7 -41 -15 z" className="symbol" style={{ strokeWidth: 2 }} />
    <path d="M 141 105 q 12 15 0 30" className="symbol" style={{ strokeWidth: 2 }} />
    <Wire d="M 189 120 H 340" bit={sum} />
    {/* AND gate */}
    <path d="M 218 185 h 14 a 15 15 0 0 1 0 30 h -14 z" className="symbol" style={{ strokeWidth: 2 }} transform="translate(0 15)" />
    <Wire d="M 247 215 H 340" bit={carry} />
    <Pin x={50} y={90} bit={a} label="A" onToggle={onToggleA} />
    <Pin x={50} y={190} bit={b} label="B" onToggle={onToggleB} />
    <Pin x={348} y={120} bit={sum} label="SUM" />
    <Pin x={348} y={215} bit={carry} label="CARRY" />
  </svg>;
}

export function FullAdderDiagram({ a, b, cin, onToggle }: { a: Bit; b: Bit; cin: Bit; onToggle: (n: string) => void }) {
  return <svg viewBox="0 0 400 280" className="circuit-svg" style={{ height: 300 }} role="img" aria-label="Full adder box">
    <rect x={150} y={70} width={110} height={140} rx={6} className="symbol" style={{ fill: 'var(--card)' }} />
    <text x={205} y={60} textAnchor="middle" className="terminal-label">FULL ADDER</text>
    {[['a', 'A', a, 95], ['b', 'B', b, 140], ['cin', 'C in', cin, 185]].map(([n, lab, bit, y]) => (
      <g key={n as string}>
        <Wire d={`M 55 ${y} H 150`} bit={bit as Bit} />
        <Pin x={55} y={y as number} bit={bit as Bit} label={lab as string} onToggle={() => onToggle(n as string)} />
        <text x={158} y={(y as number) + 4}>{lab as string}</text>
      </g>
    ))}
    <Wire d="M 260 110 H 340" bit={gate('xor', gate('xor', a, b), cin)} />
    <Wire d="M 260 170 H 340" bit={fullAdderCarry(a, b, cin)} />
    <text x={252} y={114} textAnchor="end">Σ</text>
    <text x={252} y={174} textAnchor="end">C out</text>
    <Pin x={348} y={110} bit={gate('xor', gate('xor', a, b), cin)} label="SUM" />
    <Pin x={348} y={170} bit={fullAdderCarry(a, b, cin)} label="C OUT" />
  </svg>;
}

function fullAdderCarry(a: Bit, b: Bit, c: Bit): Bit {
  return (a & b | (a ^ b) & c) as Bit;
}

export function RippleAdderDiagram({ result, onToggleA, onToggleB }: {
  result: RippleResult; onToggleA: (i: number) => void; onToggleB: (i: number) => void;
}) {
  const n = result.bits.length;
  const w = 88, x0 = 30, yTop = 40, boxH = 86;
  return <svg viewBox={`0 0 ${x0 * 2 + n * w + 40} 240`} className="circuit-svg" style={{ height: 260 }} role="img" aria-label="4-bit ripple-carry adder">
    {result.bits.map((bit, i) => {
      const x = x0 + (n - 1 - i) * w; // most significant on the left
      return <g key={i}>
        <rect x={x} y={yTop} width={64} height={boxH} rx={6} className="symbol" style={{ fill: 'var(--card)', strokeWidth: 1.8 }} />
        <text x={x + 32} y={yTop + 16} textAnchor="middle" style={{ fontSize: 9 }}>FA{i}</text>
        {/* inputs from above */}
        <Wire d={`M ${x + 16} ${yTop - 24} V ${yTop}`} bit={bit.a} />
        <Wire d={`M ${x + 48} ${yTop - 24} V ${yTop}`} bit={bit.b} />
        <Pin x={x + 16} y={yTop - 30} bit={bit.a} onToggle={() => onToggleA(i)} />
        <Pin x={x + 48} y={yTop - 30} bit={bit.b} onToggle={() => onToggleB(i)} />
        <text x={x + 16} y={yTop + 30} textAnchor="middle" style={{ fontSize: 9 }}>A{i}</text>
        <text x={x + 48} y={yTop + 30} textAnchor="middle" style={{ fontSize: 9 }}>B{i}</text>
        {/* carry in from the right (previous stage) */}
        <Wire d={`M ${x + 64} ${yTop + 52} H ${x + 64 + (i > 0 ? w - 64 : 10)}`} bit={bit.cin} />
        {i === 0 && <text x={x + 76} y={yTop + 46} style={{ fontSize: 9 }}>Cin=0</text>}
        <text x={x + 60} y={yTop + 58} textAnchor="end" style={{ fontSize: 9 }}>Cin</text>
        {/* carry out to the left */}
        <Wire d={`M ${x} ${yTop + 52} H ${x - (w - 64)}`} bit={bit.cout} />
        <text x={x + 5} y={yTop + 58} style={{ fontSize: 9 }}>Cout</text>
        {/* sum downward */}
        <Wire d={`M ${x + 32} ${yTop + boxH} V ${yTop + boxH + 26}`} bit={bit.sum} />
        <Pin x={x + 32} y={yTop + boxH + 38} bit={bit.sum} label={`S${i}`} />
      </g>;
    })}
    {/* final overflow carry */}
    <Wire d={`M ${x0 - 12} ${yTop + 52} H ${x0}`} bit={result.overflow} />
    <Pin x={x0 - 20} y={yTop + 52} bit={result.overflow} label="C4" />
  </svg>;
}

// ---------- Gates built from transistors (CMOS) ----------

/** Vertical MOSFET symbol: drain top, source bottom, gate from the left. Channel lights up when conducting. */
function Mosfet({ x, y, type, label, bit }: { x: number; y: number; type: 'pmos' | 'nmos'; label: string; bit: Bit }) {
  const on = mosConducts(type, bit);
  const ch = on ? 'sig-high' : 'sig-low';
  return <g>
    {/* gate wire and plate */}
    <path d={`M ${x - 34} ${y} H ${x - 8}`} className={`sig-wire ${cls(bit)}`} />
    {type === 'pmos' && <circle cx={x - 5} cy={y} r={3.5} className="symbol" style={{ strokeWidth: 1.8 }} />}
    <path d={`M ${x} ${y - 11} V ${y + 11}`} className="symbol" style={{ strokeWidth: 2 }} />
    {/* broken enhancement channel, highlighted when conducting */}
    <path d={`M ${x + 5} ${y - 11} V ${y - 4} M ${x + 5} ${y - 2} V ${y + 2} M ${x + 5} ${y + 4} V ${y + 11}`} className={`symbol ${ch}`} style={{ strokeWidth: on ? 3 : 2 }} />
    {/* drain / source stubs */}
    <path d={`M ${x + 5} ${y - 7} H ${x + 14} V ${y - 20}`} className={`symbol ${ch}`} style={{ strokeWidth: 1.8 }} />
    <path d={`M ${x + 5} ${y + 7} H ${x + 14} V ${y + 20}`} className={`symbol ${ch}`} style={{ strokeWidth: 1.8 }} />
    <text x={x - 40} y={y + 4} textAnchor="end" className="terminal-label" style={{ fontSize: 11 }}>{label}</text>
    <text x={x + 26} y={y + 4} className="terminal-label" style={{ fontSize: 9, fill: on ? 'var(--primary)' : 'var(--muted-foreground)' }}>{on ? 'ON' : 'off'}</text>
  </g>;
}

/** Transistor-level schematic of the primitive CMOS gates: NOT, NAND, NOR. */
export function CmosDiagram({ type, a, b }: { type: PrimitiveGate; a: Bit; b: Bit }) {
  const { pullUp, pullDown } = cmosNetworks(type, a, b);
  const out = gate(type, a, b);
  const vddY = 34, gndY = 266, outY = 150, outX = 214;
  return <svg viewBox="0 0 400 300" className="circuit-svg" style={{ height: 320 }} role="img" aria-label={`${GATE_INFO[type].name} gate built from transistors`}>
    {/* supply rails */}
    <path d={`M 120 ${vddY} H 280`} className="sig-wire sig-high" />
    <text x={290} y={vddY + 4} className="terminal-label" style={{ fontSize: 11 }}>VDD = 1</text>
    <path d={`M 120 ${gndY} H 280`} className="sig-wire sig-low" />
    <path d={`M 190 ${gndY + 6} H 250 M 196 ${gndY + 12} H 244 M 202 ${gndY + 18} H 238`} className="symbol" style={{ strokeWidth: 1.6 }} />
    <text x={290} y={gndY + 4} className="terminal-label" style={{ fontSize: 11 }}>GND = 0</text>
    {/* output node */}
    <Wire d={`M ${outX} ${outY} H 330`} bit={out} />
    <Pin x={340} y={outY} bit={out} label="OUT" />
    {type === 'not' && <>
      <Wire d={`M ${outX} ${vddY} V 70`} bit={1} />
      <Mosfet x={186} y={90} type="pmos" label="A" bit={a} />
      <Wire d={`M 200 110 V ${outY}`} bit={out} />
      <Mosfet x={186} y={210} type="nmos" label="A" bit={a} />
      <Wire d={`M 200 190 V ${outY} M 200 230 V ${gndY}`} bit={out} />
    </>}
    {type === 'nand' && <>
      {/* PMOS pair in parallel */}
      <Wire d={`M 160 ${vddY} V 70`} bit={1} />
      <Wire d={`M 240 ${vddY} V 70`} bit={1} />
      <Mosfet x={146} y={90} type="pmos" label="A" bit={a} />
      <Mosfet x={226} y={90} type="pmos" label="B" bit={b} />
      <Wire d={`M 160 110 V ${outY} H ${outX}`} bit={out} />
      <Wire d={`M 240 110 V ${outY}`} bit={out} />
      {/* NMOS pair in series */}
      <Mosfet x={186} y={180} type="nmos" label="A" bit={a} />
      <Mosfet x={186} y={236} type="nmos" label="B" bit={b} />
      <Wire d={`M 200 ${outY} V 160`} bit={out} />
      <Wire d={`M 200 200 V 216`} bit={pullDown ? 0 : out} />
      <Wire d={`M 200 256 V ${gndY}`} bit={0} />
    </>}
    {type === 'nor' && <>
      {/* PMOS pair in series */}
      <Mosfet x={186} y={64} type="pmos" label="A" bit={a} />
      <Mosfet x={186} y={120} type="pmos" label="B" bit={b} />
      <Wire d={`M 200 ${vddY} V 44`} bit={1} />
      <Wire d={`M 200 84 V 100`} bit={pullUp ? 1 : out} />
      <Wire d={`M 200 140 V ${outY}`} bit={out} />
      {/* NMOS pair in parallel */}
      <Mosfet x={130} y={210} type="nmos" label="A" bit={a} />
      <Mosfet x={250} y={210} type="nmos" label="B" bit={b} />
      <Wire d={`M ${outX} ${outY} V 190 M 144 190 H 264`} bit={out} />
      <Wire d={`M 144 230 V ${gndY}`} bit={0} />
      <Wire d={`M 264 230 V ${gndY}`} bit={0} />
    </>}
    <text x={30} y={30} className="terminal-label" style={{ fontSize: 11 }}>{pullUp ? 'Pulled UP to 1' : pullDown ? 'Pulled DOWN to 0' : ''}</text>
    <text x={30} y={292} className="terminal-label" style={{ fontSize: 10 }}>Top: PMOS (bubbled gate) conducts on 0 · Bottom: NMOS conducts on 1</text>
  </svg>;
}

/** Small labeled gate box with live colored wires, for composition diagrams. */
function GateBox({ x, y, name, inA, inB, out }: { x: number; y: number; name: string; inA: Bit; inB?: Bit | undefined; out: Bit }) {
  const w = 64, h = 40;
  return <g>
    <Wire d={`M ${x - 30} ${y + 12} H ${x}`} bit={inA} />
    {inB !== undefined && <Wire d={`M ${x - 30} ${y + 28} H ${x}`} bit={inB} />}
    <rect x={x} y={y} width={w} height={h} rx={6} className="symbol" style={{ fill: 'var(--card)', strokeWidth: 1.8 }} />
    <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" style={{ fontSize: 11 }}>{name}</text>
    <Wire d={`M ${x + w} ${y + h / 2} H ${x + w + 30}`} bit={out} />
  </g>;
}

/** How the derived gates are composed from NAND / NOR / NOT. */
export function CompositeBuild({ type, a, b }: { type: GateType; a: Bit; b: Bit }) {
  if (type === 'and' || type === 'or') {
    const first = type === 'and' ? 'nand' : 'nor';
    const mid = gate(first, a, b);
    const out = gate('not', mid);
    return <svg viewBox="0 0 400 200" className="circuit-svg" style={{ height: 220 }} role="img" aria-label={`${GATE_INFO[type].name} built from ${GATE_INFO[first].name} plus NOT`}>
      <Pin x={30} y={72} bit={a} label="A" />
      <Pin x={30} y={108} bit={b} label="B" />
      <Wire d="M 40 72 H 90" bit={a} />
      <Wire d="M 40 108 H 90" bit={b} />
      <GateBox x={120} y={60} name={GATE_INFO[first].name} inA={a} inB={b} out={mid} />
      <text x={214} y={86} className="terminal-label" style={{ fontSize: 10 }}>{mid}</text>
      <GateBox x={244} y={60} name="NOT" inA={mid} out={out} />
      <Pin x={368} y={80} bit={out} label="OUT" />
      <text x={200} y={160} textAnchor="middle" className="terminal-label" style={{ fontSize: 11 }}>{GATE_BUILD[type].transistors} transistors: {GATE_INFO[first].name} (4) + NOT (2)</text>
    </svg>;
  }
  // XOR / XNOR from four NANDs (+ NOT)
  const n1 = gate('nand', a, b);
  const n2 = gate('nand', a, n1);
  const n3 = gate('nand', b, n1);
  const x = gate('nand', n2, n3);
  const out = type === 'xnor' ? gate('not', x) : x;
  const wide = type === 'xnor';
  return <svg viewBox={`0 0 ${wide ? 670 : 540} 210`} className="circuit-svg" style={{ height: 230 }} role="img" aria-label={`${GATE_INFO[type].name} built from NAND gates`}>
    <Pin x={24} y={72} bit={a} label="A" />
    <Pin x={24} y={138} bit={b} label="B" />
    <Wire d="M 34 72 H 50 V 92 H 60" bit={a} />
    <Wire d="M 34 138 H 50 V 118 H 60" bit={b} />
    <GateBox x={90} y={80} name="NAND" inA={a} inB={b} out={n1} />
    {/* A and B branch to the middle gates */}
    <Wire d="M 44 72 V 42 H 200" bit={a} />
    <Wire d="M 44 138 V 168 H 200" bit={b} />
    <circle cx={44} cy={72} r={3} className={`sig-node ${cls(a)}`} />
    <circle cx={44} cy={138} r={3} className={`sig-node ${cls(b)}`} />
    {/* n1 branches to both middle gates */}
    <Wire d="M 184 100 H 190 V 58 H 200" bit={n1} />
    <Wire d="M 190 100 V 152 H 200" bit={n1} />
    <circle cx={190} cy={100} r={3} className={`sig-node ${cls(n1)}`} />
    <GateBox x={230} y={30} name="NAND" inA={a} inB={n1} out={n2} />
    <GateBox x={230} y={140} name="NAND" inA={n1} inB={b} out={n3} />
    <Wire d="M 324 50 H 350 V 92 H 380" bit={n2} />
    <Wire d="M 324 160 H 350 V 108 H 380" bit={n3} />
    <GateBox x={410} y={80} name="NAND" inA={n2} inB={n3} out={x} />
    {wide && <GateBox x={540} y={80} name="NOT" inA={x} out={out} />}
    <Pin x={wide ? 654 : 524} y={100} bit={out} label="OUT" />
  </svg>;
}

/** Transistor-level or composition view of how a gate is built. */
export function GateImplementation({ type, a, b }: { type: GateType; a: Bit; b: Bit }) {
  const build = GATE_BUILD[type];
  if (build.kind === 'cmos') return <CmosDiagram type={type as PrimitiveGate} a={a} b={b} />;
  return <CompositeBuild type={type} a={a} b={b} />;
}
