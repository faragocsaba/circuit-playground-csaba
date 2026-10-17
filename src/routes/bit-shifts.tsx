import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { PhysicalParts } from '@/components/physical-parts';
import { BitShiftDiagram } from '@/components/digital/bit-shift-diagram';
import { SHIFT_MODES, shiftByte, type ShiftMode } from '@/lib/bit-shift-model';

export const Route = createFileRoute('/bit-shifts')({
  head: () => ({ meta: [
    { title: 'Bit Shifts — Circuit Playground' },
    { name: 'description', content: 'Explore eight-bit logical left, logical right and arithmetic right shifts with live binary diagrams and signed results.' },
    { property: 'og:title', content: 'Bit Shifts — Circuit Playground' },
    { property: 'og:description', content: 'Follow each bit, discover zero and sign fill, and see how shifts multiply or divide binary numbers.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: BitShiftsLab,
});

function BitShiftsLab() {
  const [value, setValue] = useState(13);
  const [mode, setMode] = useState<ShiftMode>('left');
  const [amount, setAmount] = useState(1);
  const r = shiftByte(value, mode, amount);
  const reset = () => { setValue(13); setMode('left'); setAmount(1); };
  const arithmetic = mode === 'arithmetic';
  const expected = value * 2 ** amount;
  const equation = mode === 'left'
    ? `${value} × ${2 ** amount} = ${expected}${expected > 255 ? ` → ${r.output} in 8 bits` : ''}`
    : arithmetic ? `floor(${r.signedInput} ÷ ${2 ** amount}) = ${r.signedOutput}` : `floor(${value} ÷ ${2 ** amount}) = ${r.output}`;
  return <>
    <SiteHeader />
    <main className="shell">
      <div className="lab-heading"><div className="eyebrow mb-3 text-muted-foreground">DIGITAL ELECTRONICS</div><h1>Bit shifts<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">Move binary digits. Multiply, divide, or preserve a sign.</p></div>
      <div className="lab-grid">
        <section className="workspace" aria-label="Bit shift workspace">
          <div className="workspace-head"><span className="eyebrow text-muted-foreground">8-BIT DATA PATH</span><span className="live-status">{SHIFT_MODES[mode].name}</span></div>
          <div className="circuit-space"><BitShiftDiagram value={value} mode={mode} amount={amount} /></div>
          <div className="circuit-footer"><span className="font-mono text-sm text-primary" data-testid="shift-equation">{equation}</span><span className="text-xs text-muted-foreground">Fill: {arithmetic ? `sign (${r.fill})` : '0'}</span></div>
          <div className="readouts" aria-live="polite">
            <div className="readout"><div className="eyebrow text-muted-foreground">UNSIGNED</div><div className="readout-value" data-testid="shift-unsigned">{value} → {r.output}</div></div>
            <div className="readout"><div className="eyebrow text-muted-foreground">SIGNED</div><div className="readout-value" data-testid="shift-signed">{r.signedInput} → {r.signedOutput}</div></div>
            <div className="readout"><div className="eyebrow text-muted-foreground">DISCARDED BITS</div><div className="readout-value">{r.discarded || '—'}</div></div>
          </div>
        </section>
        <aside className="controls" aria-label="Bit shift controls">
          <div className="eyebrow mb-6 text-muted-foreground">EXPERIMENT CONTROLS</div>
          <div className="control-group"><div className="control-label">Operation</div><div className="layout-options">{(Object.keys(SHIFT_MODES) as ShiftMode[]).map(m => <Button key={m} variant="outline" className="layout-option" aria-pressed={mode === m} onClick={() => setMode(m)}>{m === 'left' ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}{SHIFT_MODES[m].name}</Button>)}</div></div>
          <div className="control-divider" />
          <div className="control-group"><label className="control-label" htmlFor="shift-value">Input byte <span className="value-pill">{value}</span></label><input id="shift-value" type="number" min={0} max={255} value={value} className="w-full rounded border border-input bg-card px-3 py-2 font-mono text-sm" onChange={e => { const n = e.currentTarget.valueAsNumber; if (Number.isFinite(n)) setValue(Math.max(0, Math.min(255, Math.trunc(n)))); }} />
            <div className="mt-3 grid grid-cols-4 gap-2">{[7, 6, 5, 4, 3, 2, 1, 0].map(i => <Button key={i} variant="outline" className="bit-toggle justify-center px-1" aria-label={`Input bit ${i}`} aria-pressed={Boolean(value & 2 ** i)} onClick={() => setValue(n => n ^ 2 ** i)}><span className="text-[10px]">b{i}</span><span>{(value >> i) & 1}</span></Button>)}</div>
          </div>
          <div className="control-group"><label className="control-label" htmlFor="shift-amount">Shift positions <span className="value-pill">{amount}</span></label><input id="shift-amount" className="range" type="range" min={0} max={8} step={1} value={amount} onChange={e => setAmount(Number(e.currentTarget.value))} /><div className="range-ends"><span>0 · unchanged</span><span>8 · whole byte</span></div></div>
          <div className="control-divider" /><p className="info-note">{SHIFT_MODES[mode].note}</p>
          <div className="mt-4 flex gap-2"><Button onClick={() => setValue(r.output)} variant="outline" className="flex-1" disabled={amount === 0}>Apply result <ArrowRight size={14} /></Button><Button variant="outline" size="icon" onClick={reset} title="Reset experiment" aria-label="Reset experiment"><RotateCcw size={15} /></Button></div>
        </aside>
      </div>
      <div className="lower-grid">
        <section><div className="section-top"><h2>Arithmetic by moving bits</h2><span className="text-[10px] font-mono text-muted-foreground">POWERS OF TWO</span></div><div className="figure-panel p-5 text-sm leading-7 text-muted-foreground"><p>Each binary position has twice the weight of its neighbor on the right: 128, 64, 32, 16, 8, 4, 2, 1. Moving left by k places multiplies an unsigned value by 2ᵏ, provided the result fits. Moving right divides by 2ᵏ and drops the fractional part.</p><p className="mt-3">Only eight bits fit here. If a left shift produces a number above 255, the high bits are lost: 128 shifted left once becomes 0, not 256. Unlike addition, no carry is stored outside this byte.</p></div></section>
        <section><div className="section-top"><h2>Logical vs arithmetic right</h2><span className="text-[10px] font-mono text-muted-foreground">TWO’S COMPLEMENT</span></div><div className="figure-panel p-5 text-sm leading-7 text-muted-foreground"><p>The same eight bits can mean 0–255 unsigned, or −128–127 signed. In two’s complement, the leftmost bit has weight −128. Arithmetic right shift repeats this sign bit, while logical right shift always inserts zeros.</p><p className="mt-3">For example, 11110011 is 243 unsigned but −13 signed. Logical right gives 121; arithmetic right gives −7. Arithmetic right rounds downward, so for negative odd numbers it differs from division that truncates toward zero.</p></div></section>
      </div>
      <section className="mt-8 border-t border-border pt-6"><div className="section-top"><h2>How hardware shifts bits</h2></div><p className="max-w-3xl text-sm leading-7 text-muted-foreground">A shift register chains D flip-flops: on each clock edge, every stage copies the previous stage, moving stored bits one position. A combinational barrel shifter instead uses layers of multiplexers to select bit paths, allowing several positions in one operation. The data-path diagram above shows the selected connections, not a clocked register.</p><div className="mt-3 flex flex-wrap gap-5 text-sm"><Link to="/flip-flops" className="text-primary hover:underline">D flip-flops →</Link><Link to="/adders" className="text-primary hover:underline">Adders →</Link><Link to="/logic-gates" className="text-primary hover:underline">Logic gates →</Link></div></section>
      <PhysicalParts kind="shifts" />
      <footer className="footer"><span className="flex items-center gap-1.5"><Info size={12} /> Ideal fixed-width 8-bit operations · no rotation or carry storage</span><Link to="/theory/digital" hash="adders" className="text-primary hover:underline">Digital Theory →</Link></footer>
    </main>
  </>;
}