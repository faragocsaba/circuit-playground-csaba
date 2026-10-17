import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TheoryChapter, TheorySection, WorkedExample } from '@/components/theory/chapter';
import { GATE_ORDER, GATE_INFO, gate, truthTable, ffNext, ffRows, fullAdder, rippleAdd, toBits, type Bit, type GateType } from '@/lib/logic-model';

export const Route = createFileRoute('/theory_/digital')({ head: () => ({ meta: [
  { title: 'Digital Theory — Boolean Algebra, Memory & Adders | Circuit Playground' },
  { name: 'description', content: 'Boolean algebra, all seven gates, live truth tables, CMOS implementation, SR/D/JK/T memory and binary addition with real-world examples.' },
  { property: 'og:title', content: 'Digital Theory — Circuit Playground' },
  { property: 'og:description', content: 'Learn how Boolean equations become gates, stored bits and arithmetic.' },
  { property: 'og:type', content: 'article' }, { name: 'twitter:card', content: 'summary_large_image' },
] }), component: DigitalTheory });

function DigitalTheory() {
  const [type, setType] = useState<GateType>('and');
  const [a, setA] = useState<Bit>(0), [b, setB] = useState<Bit>(0);
  const [d, setD] = useState<Bit>(0), [q, setQ] = useState<Bit>(0);
  const [history, setHistory] = useState<Bit[]>([0]);
  const add = fullAdder(a, b, 1);
  const ripple = rippleAdd(toBits(15, 4), toBits(1, 4));
  return <TheoryChapter title="Digital theory" description="How two voltage levels become decisions, memory and arithmetic." contents={[
    ['boolean', 'Boolean algebra'], ['gates', 'Gates & truth tables'], ['cmos', 'Transistor implementation'], ['memory', 'Latches & flip-flops'], ['adders', 'Binary addition'],
  ]}>
    <TheorySection id="boolean" title="Boolean algebra: equations with bits" equations={['AB = A AND B; A + B = A OR B; ¬A = NOT A', 'A + 0 = A; A·1 = A; A + A = A; A·A = A', 'A + ¬A = 1; A·¬A = 0; ¬(¬A) = A', 'A(B + C) = AB + AC; A + AB = A', 'De Morgan: ¬(AB) = ¬A + ¬B; ¬(A + B) = ¬A·¬B']}>
      <p>Here + means OR, not ordinary addition: 1 + 1 = 1 in Boolean algebra. A bit represents a low or high voltage range. Chips have specified thresholds, an undefined region between them, and limited tolerance for noise.</p><WorkedExample><p>A safety interlock can require DoorClosed AND StartPressed. An alarm can be Smoke OR Heat. De Morgan turns “not both ready” into “A not ready OR B not ready”; it expresses the same function using different gates.</p></WorkedExample><p>Simplification saves gates, transistor area and switching energy. NAND and NOR are universal: tie a NAND’s inputs together for NOT; invert a NAND for AND; invert both inputs before NAND for OR.</p>
    </TheorySection>
    <TheorySection id="gates" title="Gates and exhaustive truth tables" equations={['AND = AB; OR = A + B; NOT = ¬A', 'NAND = ¬(AB); NOR = ¬(A + B)', 'XOR = ¬A·B + A·¬B; XNOR = AB + ¬A·¬B']}>
      <p>A truth table lists every possible input combination: n independent inputs need 2ⁿ rows. XOR detects different bits; XNOR detects equality. A combinational output depends only on present inputs once propagation has settled.</p>
      <div className="flex flex-wrap gap-2">{GATE_ORDER.map(g => <Button key={g} variant="outline" size="sm" aria-pressed={type === g} onClick={() => setType(g)}>{GATE_INFO[g].name}</Button>)}</div>
      <div className="flex flex-wrap gap-3"><Button variant="outline" aria-label="Example input A" aria-pressed={a === 1} onClick={() => setA(a ? 0 : 1)}>A = {a}</Button>{type !== 'not' && <Button variant="outline" aria-label="Example input B" aria-pressed={b === 1} onClick={() => setB(b ? 0 : 1)}>B = {b}</Button>}<output aria-label="Gate example output" className="self-center font-mono text-primary">OUT = {gate(type, a, b)}</output></div>
      <table className="truth-table max-w-lg"><caption className="mb-2 text-left">{GATE_INFO[type].name} truth table</caption><thead><tr><th>A</th>{type !== 'not' && <th>B</th>}<th>OUT</th></tr></thead><tbody>{truthTable(type).map((r, i) => <tr key={i} className={r.a === a && (r.b === null || r.b === b) ? 'current-row' : undefined}><td>{r.a}</td>{type !== 'not' && <td>{r.b}</td>}<td>{r.out}</td></tr>)}</tbody></table><Link to="/logic-gates" className="text-primary">Open the logic gates lab →</Link>
    </TheorySection>
    <TheorySection id="cmos" title="From Boolean expressions to transistors" equations={['NMOS conducts for high gate voltage; PMOS conducts for low gate voltage', 'NAND: parallel PMOS pull-up + series NMOS pull-down', 'NOR: series PMOS pull-up + parallel NMOS pull-down']}>
      <p>The pull-up network connects OUT to the supply; the pull-down connects OUT to ground. In an ideal stable CMOS state exactly one network conducts. An inverter uses one PMOS and one NMOS; NAND and NOR use four transistors. AND and OR add an inverter.</p>
      <svg className="theory-diagram" viewBox="0 0 600 190" role="img" aria-label="CMOS output connects to the supply through the pull-up network or to ground through the pull-down network"><text x="300" y="22" textAnchor="middle">VDD</text><path d="M300 30V45M300 80V110M300 145V175M300 95H510" className="wire" /><rect x="190" y="45" width="220" height="35" className="radio-stage" /><text x="300" y="68" textAnchor="middle">PMOS pull-up</text><rect x="190" y="110" width="220" height="35" className="radio-stage" /><text x="300" y="133" textAnchor="middle">NMOS pull-down</text><circle cx="300" cy="95" r="4" className="node" /><text x="460" y="85">OUT</text><path d="M280 175H320M285 181H315M292 187H308" className="wire" /></svg>
      <p>Real transistors do not switch instantly. During a transition both networks may briefly conduct, and charging node capacitance consumes energy. Static CMOS has low ideal steady-state power but real leakage remains. The transistor builder shows intermediate voltages rather than assuming every input is already 0 or 1.</p><Link to="/transistors" search={{ view: 'builder', template: 'cmos-nand', a, b }} className="text-primary">Explore the CMOS NAND circuit →</Link>
    </TheorySection>
    <TheorySection id="memory" title="Memory: feedback, latches and clock edges" equations={['NAND SR latch: Q = ¬(S̄·Q̄); Q̄ = ¬(R̄·Q)', 'At an active clock edge: D → Q⁺ = D', 'JK → Q⁺ = J·¬Q + ¬K·Q; T → Q⁺ = T ⊕ Q']}>
      <p>Q⁺ means the next stored state. An SR NAND latch has active-low inputs: S̄ = 0 sets, R̄ = 0 resets, and both 1 hold. Both 0 force Q and Q̄ high, so they are no longer complements; releasing them together is unpredictable in a real circuit.</p>
      <p>A latch responds throughout its enabled level. An edge-triggered flip-flop samples only at the active transition. D stores data, JK holds/sets/resets/toggles, and T either holds or toggles. These clocked equations do not mean the output changes immediately when an input changes.</p>
      <div className="flex flex-wrap gap-3"><Button variant="outline" aria-label="Example D input" aria-pressed={d === 1} onClick={() => setD(d ? 0 : 1)}>D = {d}</Button><Button variant="outline" onClick={() => { const next = ffNext('d', { d }, q); setQ(next); setHistory(h => [...h.slice(-7), next]); }}><ArrowUp /> Rising clock edge</Button><output aria-label="Stored example bit" className="self-center font-mono text-primary">Q = {q}</output></div>
      <svg className="theory-diagram" viewBox="0 0 600 140" role="img" aria-label={`Stored bit after each clock edge: ${history.join(', ')}`}><text x="20" y="22">Q after each ↑</text><path d="M40 100H560" className="comparison-axis" /><path d={history.map((bit, i) => `${i ? 'H' : 'M'}${40 + i * 60} ${i ? 'V' : ''}${bit ? 48 : 100}H${100 + i * 60}`).join(' ')} className="trace-output" />{history.map((bit, i) => <text key={i} x={65 + i * 60} y="128">{bit}</text>)}</svg>
      <div className="grid gap-6 sm:grid-cols-2">{(['sr', 'd', 'jk', 't'] as const).map(f => <table key={f} className="truth-table"><caption className="text-left font-semibold">{f === 'sr' ? 'SR NAND latch' : `${f.toUpperCase()} flip-flop (clock ↑)`}</caption><thead><tr><th>Inputs</th><th>Q⁺</th><th>Action</th></tr></thead><tbody>{ffRows(f).map((r, i) => <tr key={i}><td>{r.inputs.map(([n,v]) => `${n}=${v}`).join(', ')}</td><td>{r.qNext}</td><td>{r.note}</td></tr>)}</tbody></table>)}</div>
      <WorkedExample><p>D flip-flops form registers for a CPU’s current instruction or a digital instrument’s reading. A T flip-flop with T = 1 divides a regular clock by two. A JK flip-flop with J = K = 1 does the same.</p></WorkedExample><p>Data must be stable for the setup time before the edge and hold time after it. Violations can cause metastability, not a guaranteed 0 or 1. Real designs synchronize asynchronous inputs; this ideal lab does not simulate timing violations.</p><Link to="/flip-flops" className="text-primary">Open the flip-flops lab →</Link>
    </TheorySection>
    <TheorySection id="adders" title="Binary addition and carry" equations={['Half adder: Sum = A ⊕ B; Carry = AB', 'Full adder: Sum = A ⊕ B ⊕ Cin', 'Cout = AB + Cin(A ⊕ B)', 'A + B + Cin = Sum + 2·Cout (ordinary integer addition)']}>
      <p>Each bit position has a weight 1, 2, 4, 8, … . A full adder adds three one-bit values and emits a sum bit and carry. In a ripple adder, each carry feeds the next higher-weight stage. Gate delay accumulates along that chain; the ideal lab computes the settled answer.</p><WorkedExample><p>With the selected A = {a}, B = {b}, and Cin = 1, Sum = {add.sum}, Cout = {add.carry}: {a} + {b} + 1 = {add.sum} + 2 × {add.carry}. Four stages give 1111 + 0001 = {ripple.overflow}{[...ripple.sum].reverse().join('')}₂ = {ripple.decimal.sum}; the low four bits wrap to zero.</p></WorkedExample>
      <p>A final carry indicates unsigned overflow, but not necessarily signed overflow. In two’s-complement arithmetic, signed overflow occurs when two same-sign inputs produce an opposite-sign result. Adders advance instruction addresses, total sensor counts and combine pixel values; fast CPUs often use carry-lookahead or prefix networks rather than a simple ripple chain.</p><Link to="/adders" className="text-primary">Open the adders lab →</Link>
    </TheorySection>
  </TheoryChapter>;
}