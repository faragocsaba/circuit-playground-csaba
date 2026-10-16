import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { GateSymbol } from '@/components/digital/diagrams';
import { GATE_INFO, GATE_ORDER, gate, truthTable, type Bit, type GateType } from '@/lib/logic-model';

export const Route = createFileRoute('/logic-gates')({
  head: () => ({ meta: [
    { title: 'Logic Gates — Circuit Playground' },
    { name: 'description', content: 'AND, OR, NOT, NAND, NOR, XOR and XNOR gates with switchable inputs, live output pins and truth tables.' },
    { property: 'og:title', content: 'Logic Gates — Circuit Playground' },
    { property: 'og:description', content: 'The building blocks of digital electronics, with truth tables and signal animation.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: LogicGatesLab,
});

function BitToggle({ label, bit, onChange }: { label: string; bit: Bit; onChange: (b: Bit) => void }) {
  return <Button variant="outline" className="bit-toggle" aria-pressed={bit === 1} onClick={() => onChange(bit ? 0 : 1)}>
    {label}<span className="bit-badge">{bit}</span>
  </Button>;
}

function LogicGatesLab() {
  const [type, setType] = useState<GateType>('and');
  const [a, setA] = useState<Bit>(0);
  const [b, setB] = useState<Bit>(0);
  const two = GATE_INFO[type].inputs === 2;
  const out = gate(type, a, b);
  const rows = truthTable(type);
  const isCurrent = (r: { a: Bit; b: Bit | null }) => r.a === a && (r.b === null || r.b === b);
  return <>
    <SiteHeader />
    <main className="shell">
      <div className="lab-heading"><div className="eyebrow mb-3 flex items-center gap-2 text-muted-foreground"><span className="text-primary">10</span><span>/</span> DIGITAL ELECTRONICS</div><h1>Logic gates<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">The atoms of digital electronics. Flip the inputs and watch the output.</p></div>
      <div className="lab-grid">
        <section className="workspace" aria-label="Gate workspace">
          <div className="workspace-head"><div className="flex items-center gap-2.5"><span className="eyebrow text-muted-foreground">LIVE GATE</span><span className="text-xs text-muted-foreground">/</span><span className="text-xs font-medium">{GATE_INFO[type].name}</span></div><span className="live-status"><span className="legend-dot" />OUT = {out}</span></div>
          <div className="circuit-space">
            <div className="absolute left-5 top-4 status-badge"><span className="legend-dot" />{out ? 'OUTPUT HIGH' : 'OUTPUT LOW'}</div>
            <GateSymbol type={type} a={a} b={b} onToggleA={() => setA(a ? 0 : 1)} onToggleB={two ? () => setB(b ? 0 : 1) : undefined} />
          </div>
          <div className="circuit-footer"><div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground"><span className="flex items-center gap-2"><span className="legend-dot" />Logic 1 (high)</span><span className="flex items-center gap-2"><span className="legend-dot" style={{ background: 'var(--border)' }} />Logic 0 (low)</span><span>Click the round pins to flip them</span></div></div>
          <div className="readouts" aria-live="polite">
            <div className="readout"><div className="eyebrow text-muted-foreground">INPUT A</div><div className="readout-value">{a}</div></div>
            <div className="readout"><div className="eyebrow text-muted-foreground">INPUT B</div><div className="readout-value">{two ? b : '—'}</div></div>
            <div className="readout"><div className="eyebrow text-muted-foreground">OUTPUT</div><div className="readout-value">{out}</div></div>
          </div>
        </section>
        <aside className="controls" aria-label="Gate controls">
          <div className="eyebrow mb-6 text-muted-foreground">EXPERIMENT CONTROLS</div>
          <div className="control-group"><div className="control-label">Choose a gate</div><div className="layout-options">
            {GATE_ORDER.map(g => <Button key={g} variant="outline" className="layout-option" aria-pressed={type === g} onClick={() => setType(g)}><span className="radio" />{GATE_INFO[g].name}</Button>)}
          </div></div>
          <div className="control-divider" />
          <div className="control-group"><div className="control-label">Inputs</div><div className="layout-options">
            <BitToggle label="Input A" bit={a} onChange={setA} />
            {two && <BitToggle label="Input B" bit={b} onChange={setB} />}
          </div></div>
          <div className="control-divider" /><div className="info-note flex gap-2"><Info size={14} className="mt-0.5 shrink-0 text-primary" /><span>{GATE_INFO[type].blurb}</span></div>
        </aside>
      </div>
      <div className="lower-grid">
        <section><div className="section-top"><h2>Truth table</h2><span className="text-[10px] text-muted-foreground font-mono">CURRENT ROW HIGHLIGHTED</span></div><div className="figure-panel"><div className="p-5">
          <table className="truth-table"><thead><tr><th>A</th>{two && <th>B</th>}<th>OUT</th></tr></thead><tbody>
            {rows.map((r, i) => <tr key={i} className={isCurrent(r) ? 'current-row' : undefined}><td>{r.a}</td>{two && <td>{r.b}</td>}<td>{r.out}</td></tr>)}
          </tbody></table>
        </div><div className="panel-note"><Info size={13} className="shrink-0" /><span>A truth table lists every possible input combination. Flip the inputs above and watch the highlighted row follow you.</span></div></div></section>
        <section><div className="section-top"><h2>Why NAND is special</h2><span className="text-[10px] text-muted-foreground font-mono">UNIVERSAL GATE</span></div><div className="figure-panel"><div className="p-5 text-sm leading-7 text-muted-foreground">
          <p>Every other gate can be built from NAND gates alone: tie the inputs together and you get a NOT; follow a NAND with that NOT and you get an AND; three NANDs make an OR.</p>
          <p className="mt-3">That is why the next lab builds memory — a flip-flop — out of nothing but two cross-coupled NAND gates, and why real chips are full of them.</p>
        </div><div className="panel-note"><Info size={13} className="shrink-0" /><span>Next step: <Link to="/flip-flops" className="text-primary hover:underline">build flip-flops from these gates →</Link></span></div></div></section>
      </div>
      <footer className="footer"><span className="flex items-center gap-1.5"><Info size={12} /> Ideal gates · 0 = low, 1 = high</span><span><Link to="/theory" className="mr-3 text-primary hover:underline">Theory →</Link>circuit.playground / 10</span></footer>
    </main>
  </>;
}
