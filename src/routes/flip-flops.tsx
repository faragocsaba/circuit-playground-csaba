import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { FlipFlopDiagram } from '@/components/digital/diagrams';
import { FF_INFO, FF_ORDER, ffNext, ffRows, srLatch, srLatchQBar, type Bit, type FFType } from '@/lib/logic-model';

export const Route = createFileRoute('/flip-flops')({
  head: () => ({ meta: [
    { title: 'Flip-Flops — Circuit Playground' },
    { name: 'description', content: 'Build memory from gates: the NAND SR latch, then the edge-triggered D, JK and T flip-flops.' },
    { property: 'og:title', content: 'Flip-Flops — Circuit Playground' },
    { property: 'og:description', content: 'One bit of memory from two NAND gates; D, JK and T flip-flops with a clock.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: FlipFlopsLab,
});

function BitToggle({ label, bit, onChange, activeLow }: { label: string; bit: Bit; onChange: (b: Bit) => void; activeLow?: boolean }) {
  return <Button variant="outline" className="bit-toggle" aria-pressed={activeLow ? bit === 0 : bit === 1} onClick={() => onChange(bit ? 0 : 1)}>
    {label}<span className="bit-badge">{bit}</span>
  </Button>;
}

function FlipFlopsLab() {
  const [type, setType] = useState<FFType>('sr');
  const [q, setQ] = useState<Bit>(0);
  const [inputs, setInputs] = useState<Record<string, Bit>>({ sBar: 1, rBar: 1, d: 0, j: 0, k: 0, t: 0 });
  const [clock, setClock] = useState<Bit>(0);
  const set = (name: string, bit: Bit) => setInputs(s => ({ ...s, [name]: bit }));

  const apply = (name: string, bit: Bit) => {
    if (type === 'sr') {
      const next = { ...inputs, [name]: bit };
      setInputs(next);
      setQ(prev => srLatch(next['sBar'] ?? 1, next['rBar'] ?? 1, prev));
    } else if (name === 'clock') {
      // rising edge: 0 → 1
      if (clock === 0 && bit === 1) setQ(prev => ffNext(type, inputs, prev));
      setClock(bit);
    } else {
      set(name, bit);
    }
  };

  const forbidden = type === 'sr' && inputs['sBar'] === 0 && inputs['rBar'] === 0;
  const qBar: Bit = type === 'sr' ? srLatchQBar(inputs['sBar'] ?? 1, inputs['rBar'] ?? 1, q) : q ? 0 : 1;
  const rows = ffRows(type);
  const inputControls: [string, string, boolean?][] = type === 'sr' ? [['sBar', 'S̄ (set, active low)', true], ['rBar', 'R̄ (reset, active low)', true]]
    : type === 'd' ? [['d', 'D (data)']]
    : type === 'jk' ? [['j', 'J (set)'], ['k', 'K (reset)']]
    : [['t', 'T (toggle)']];

  return <>
    <SiteHeader />
    <main className="shell">
      <div className="lab-heading"><div className="eyebrow mb-3 flex items-center gap-2 text-muted-foreground"><span className="text-primary">11</span><span>/</span> DIGITAL ELECTRONICS</div><h1>Flip-flops<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">Gates that remember: one bit of memory, then clocked flip-flops.</p></div>
      <div className="lab-grid">
        <section className="workspace" aria-label="Flip-flop workspace">
          <div className="workspace-head"><div className="flex items-center gap-2.5"><span className="eyebrow text-muted-foreground">LIVE CIRCUIT</span><span className="text-xs text-muted-foreground">/</span><span className="text-xs font-medium">{FF_INFO[type].name}</span></div><span className="live-status"><span className="legend-dot" />Q = {q}</span></div>
          <div className="circuit-space">
            <div className="absolute left-5 top-4 status-badge" style={forbidden ? { color: 'var(--coral)' } : undefined}><span className="legend-dot" style={forbidden ? { background: 'var(--coral)' } : undefined} />{forbidden ? 'FORBIDDEN STATE' : q ? 'STORING 1' : 'STORING 0'}</div>
            <FlipFlopDiagram type={type} inputs={inputs} q={q} clock={clock} onToggle={name => apply(name, name === 'clock' ? (clock ? 0 : 1) : ((inputs[name] ?? 0) ? 0 : 1) as Bit)} />
          </div>
          <div className="circuit-footer"><div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground"><span className="flex items-center gap-2"><span className="legend-dot" />Logic 1 (high)</span><span className="flex items-center gap-2"><span className="legend-dot" style={{ background: 'var(--border)' }} />Logic 0 (low)</span>{type !== 'sr' && <span>Click CLK to make a rising edge (0 → 1): that is when the flip-flop listens</span>}</div></div>
          <div className="readouts" aria-live="polite">
            <div className="readout"><div className="eyebrow text-muted-foreground">STORED BIT Q</div><div className="readout-value">{q}</div></div>
            <div className="readout"><div className="eyebrow text-muted-foreground">COMPLEMENT Q̄</div><div className="readout-value">{qBar}</div></div>
            <div className="readout"><div className="eyebrow text-muted-foreground">{type === 'sr' ? 'MODE' : 'CLOCK'}</div><div className="readout-value">{type === 'sr' ? (forbidden ? 'FORBIDDEN' : inputs['sBar'] === 0 ? 'SET' : inputs['rBar'] === 0 ? 'RESET' : 'HOLD') : clock}</div></div>
          </div>
        </section>
        <aside className="controls" aria-label="Flip-flop controls">
          <div className="eyebrow mb-6 text-muted-foreground">EXPERIMENT CONTROLS</div>
          <div className="control-group"><div className="control-label">Choose a flip-flop</div><div className="layout-options">
            {FF_ORDER.map(f => <Button key={f} variant="outline" className="layout-option" aria-pressed={type === f} onClick={() => { setType(f); setClock(0); }}><span className="radio" />{FF_INFO[f].name}</Button>)}
          </div></div>
          <div className="control-divider" />
          <div className="control-group"><div className="control-label">Inputs</div><div className="layout-options">
            {inputControls.map(([n, lab, al]) => <BitToggle key={n} label={lab} bit={inputs[n] ?? 0} activeLow={al ?? false} onChange={bit => apply(n, bit)} />)}
            {type !== 'sr' && <BitToggle label="Clock (click for edge)" bit={clock} onChange={bit => apply('clock', bit)} />}
          </div></div>
          <div className="control-divider" /><div className="info-note flex gap-2"><Info size={14} className="mt-0.5 shrink-0 text-primary" /><span>{FF_INFO[type].blurb}</span></div>
        </aside>
      </div>
      <div className="lower-grid">
        <section><div className="section-top"><h2>Characteristic table</h2><span className="text-[10px] text-muted-foreground font-mono">NEXT STATE Q⁺</span></div><div className="figure-panel"><div className="p-5">
          <table className="truth-table"><thead><tr>{(rows[0]?.inputs ?? []).map(([n]) => <th key={n}>{n}</th>)}<th>Q⁺</th><th>ACTION</th></tr></thead><tbody>
            {rows.map((r, i) => <tr key={i} className={r.note === 'Forbidden' ? 'forbidden-row' : undefined}>{r.inputs.map(([n, v]) => <td key={n}>{v}</td>)}<td>{r.qNext}</td><td>{r.note}</td></tr>)}
          </tbody></table>
        </div><div className="panel-note"><Info size={13} className="shrink-0" /><span>{type === 'sr' ? 'Try it: pull S̄ low, then back high — Q stays 1. The latch remembers. Then pull both low to see the forbidden state.' : 'Change the data inputs and nothing happens until the clock rises. That edge-triggering is what keeps big digital systems orderly.'}</span></div></div></section>
        <section><div className="section-top"><h2>From latch to computer</h2><span className="text-[10px] text-muted-foreground font-mono">MEMORY</span></div><div className="figure-panel"><div className="p-5 text-sm leading-7 text-muted-foreground">
          <p>A gate on its own forgets instantly — its output only ever reflects its inputs right now. Feed two NAND gates into each other and the loop <em className="text-foreground not-italic font-medium">holds</em> a state: that feedback is the birth of memory.</p>
          <p className="mt-3">Add a clock and the memory only changes on the clock's rising edge. Millions of these in a row make registers; billions make the RAM in your computer.</p>
        </div><div className="panel-note"><Info size={13} className="shrink-0" /><span>Next step: <Link to="/adders" className="text-primary hover:underline">do arithmetic with gates →</Link></span></div></div></section>
      </div>
      <footer className="footer"><span className="flex items-center gap-1.5"><Info size={12} /> Ideal gates · edge-triggered on clock 0 → 1</span><span><Link to="/theory" className="mr-3 text-primary hover:underline">Theory →</Link>circuit.playground / 11</span></footer>
    </main>
  </>;
}
