import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { PhysicalParts } from '@/components/physical-parts';
import { FullAdderDiagram, HalfAdderDiagram, RippleAdderDiagram } from '@/components/digital/diagrams';
import { fullAdder, halfAdder, rippleAdd, toBits, type Bit } from '@/lib/logic-model';

export const Route = createFileRoute('/adders')({
  head: () => ({ meta: [
    { title: 'Adders — Circuit Playground' },
    { name: 'description', content: 'Binary addition with gates: half adder, full adder and a 4-bit ripple-carry adder.' },
    { property: 'og:title', content: 'Adders — Circuit Playground' },
    { property: 'og:description', content: 'From XOR and AND gates to a 4-bit adder with a rippling carry.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: AddersLab,
});

type Mode = 'half' | 'full' | 'ripple';

function BitToggle({ label, bit, onChange }: { label: string; bit: Bit; onChange: (b: Bit) => void }) {
  return <Button variant="outline" className="bit-toggle" aria-pressed={bit === 1} onClick={() => onChange(bit ? 0 : 1)}>
    {label}<span className="bit-badge">{bit}</span>
  </Button>;
}

function AddersLab() {
  const [mode, setMode] = useState<Mode>('half');
  const [a, setA] = useState<Bit>(1);
  const [b, setB] = useState<Bit>(1);
  const [cin, setCin] = useState<Bit>(0);
  const [numA, setNumA] = useState(7);
  const [numB, setNumB] = useState(5);

  const half = halfAdder(a, b);
  const full = fullAdder(a, b, cin);
  const bitsA = toBits(numA, 4), bitsB = toBits(numB, 4);
  const ripple = rippleAdd(bitsA, bitsB);

  const flipA = (i: number) => setNumA(n => n ^ (1 << i));
  const flipB = (i: number) => setNumB(n => n ^ (1 << i));

  const readouts: [string, string][] = mode === 'half'
    ? [['SUM', String(half.sum)], ['CARRY', String(half.carry)], ['DECIMAL', `${a} + ${b} = ${a + b}`]]
    : mode === 'full'
    ? [['SUM', String(full.sum)], ['CARRY OUT', String(full.carry)], ['DECIMAL', `${a} + ${b} + ${cin} = ${a + b + cin}`]]
    : [['A + B', `${numA} + ${numB}`], ['RESULT', String(ripple.decimal.sum)], ['OVERFLOW C₄', String(ripple.overflow)]];

  return <>
    <SiteHeader />
    <main className="shell">
      <div className="lab-heading"><div className="eyebrow mb-3 flex items-center gap-2 text-muted-foreground"><span className="text-primary">12</span><span>/</span> DIGITAL ELECTRONICS</div><h1>Adders<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">Arithmetic from gates: how a computer adds numbers.</p></div>
      <div className="lab-grid">
        <section className="workspace" aria-label="Adder workspace">
          <div className="workspace-head"><div className="flex items-center gap-2.5"><span className="eyebrow text-muted-foreground">LIVE CIRCUIT</span><span className="text-xs text-muted-foreground">/</span><span className="text-xs font-medium">{mode === 'half' ? 'Half adder' : mode === 'full' ? 'Full adder' : '4-bit ripple-carry adder'}</span></div><span className="live-status"><span className="legend-dot" />{mode === 'ripple' ? `${numA} + ${numB} = ${ripple.decimal.sum}` : `SUM = ${mode === 'half' ? half.sum : full.sum}`}</span></div>
          <div className="circuit-space">
            {mode === 'half' && <HalfAdderDiagram a={a} b={b} onToggleA={() => setA(a ? 0 : 1)} onToggleB={() => setB(b ? 0 : 1)} />}
            {mode === 'full' && <FullAdderDiagram a={a} b={b} cin={cin} onToggle={n => n === 'a' ? setA(a ? 0 : 1) : n === 'b' ? setB(b ? 0 : 1) : setCin(cin ? 0 : 1)} />}
            {mode === 'ripple' && <RippleAdderDiagram result={ripple} onToggleA={flipA} onToggleB={flipB} />}
          </div>
          <div className="circuit-footer"><div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground"><span className="flex items-center gap-2"><span className="legend-dot" />Logic 1 (high)</span><span className="flex items-center gap-2"><span className="legend-dot" style={{ background: 'var(--border)' }} />Logic 0 (low)</span><span>Click the round pins to flip bits</span></div></div>
          <div className="readouts" aria-live="polite">{readouts.map(([l, v]) => <div className="readout" key={l}><div className="eyebrow text-muted-foreground">{l}</div><div className="readout-value">{v}</div></div>)}</div>
        </section>
        <aside className="controls" aria-label="Adder controls">
          <div className="eyebrow mb-6 text-muted-foreground">EXPERIMENT CONTROLS</div>
          <div className="control-group"><div className="control-label">Choose a circuit</div><div className="layout-options">
            {([['half', 'Half adder'], ['full', 'Full adder'], ['ripple', '4-bit ripple adder']] as [Mode, string][]).map(([m, lab]) => <Button key={m} variant="outline" className="layout-option" aria-pressed={mode === m} onClick={() => setMode(m)}><span className="radio" />{lab}</Button>)}
          </div></div>
          <div className="control-divider" />
          {mode !== 'ripple' ? <div className="control-group"><div className="control-label">Inputs</div><div className="layout-options">
            <BitToggle label="Input A" bit={a} onChange={setA} />
            <BitToggle label="Input B" bit={b} onChange={setB} />
            {mode === 'full' && <BitToggle label="Carry in" bit={cin} onChange={setCin} />}
          </div></div> : <div className="control-group"><div className="control-label">Inputs (least-significant bit last)</div><div className="layout-options">
            <div className="grid grid-cols-4 gap-2">{[3, 2, 1, 0].map(i => <BitToggle key={`a${i}`} label={`A${i}`} bit={bitsA[i] ?? 0} onChange={() => flipA(i)} />)}</div>
            <div className="grid grid-cols-4 gap-2">{[3, 2, 1, 0].map(i => <BitToggle key={`b${i}`} label={`B${i}`} bit={bitsB[i] ?? 0} onChange={() => flipB(i)} />)}</div>
          </div></div>}
          <div className="control-divider" /><div className="info-note flex gap-2"><Info size={14} className="mt-0.5 shrink-0 text-primary" /><span>{mode === 'half' ? 'The sum bit is XOR, the carry bit is AND — two gates add two bits. It cannot accept a carry from a previous stage, hence "half".' : mode === 'full' ? 'A full adder also takes the carry in, so it can be chained. It is two half adders plus an OR gate.' : 'Four full adders chained: each carry out feeds the next carry in. The carry "ripples" from right to left — that delay is why real CPUs use faster carry-lookahead designs.'}</span></div>
        </aside>
      </div>
      <div className="lower-grid">
        <section><div className="section-top"><h2>Binary addition</h2><span className="text-[10px] text-muted-foreground font-mono">BASE 2</span></div><div className="figure-panel"><div className="p-5 text-sm leading-7 text-muted-foreground">
          <p>Binary addition works exactly like decimal, just with only two digits: 0 + 0 = 0, 0 + 1 = 1, and 1 + 1 = 10 — write down 0, carry the 1.</p>
          <p className="mt-3">"Write down 0, carry 1" is precisely what the XOR and AND gates compute. The whole of arithmetic — subtraction, multiplication, division — is built on this little circuit.</p>
        </div><div className="panel-note"><Info size={13} className="shrink-0" /><span>Try 15 + 1 in the ripple adder and watch every stage carry — the same "rolling over" as 999 + 1 in decimal.</span></div></div></section>
        <section><div className="section-top"><h2>Why the carry ripples</h2><span className="text-[10px] text-muted-foreground font-mono">PROPAGATION DELAY</span></div><div className="figure-panel"><div className="p-5 text-sm leading-7 text-muted-foreground">
          <p>Each full adder must wait for the carry from the stage before it. In a 32-bit processor that chain is 32 gates long, and the final answer is not valid until the carry has travelled the whole way.</p>
          <p className="mt-3">Real chips use <em className="text-foreground not-italic font-medium">carry-lookahead</em> logic that computes all the carries in parallel — one of the classic speed-versus-size trade-offs of hardware design.</p>
        </div><div className="panel-note"><Info size={13} className="shrink-0" /><span>Overflow: when the result needs 5 bits (like 9 + 8 = 17), the last carry out lights up as C₄.</span></div></div></section>
      </div>
      <PhysicalParts kind="adders" />
      <footer className="footer"><span className="flex items-center gap-1.5"><Info size={12} /> Ideal gates · 4-bit unsigned numbers 0–15</span><span><Link to="/theory" hash="digital-logic" className="mr-3 text-primary hover:underline">Theory →</Link>circuit.playground / 12</span></footer>
    </main>
  </>;
}
