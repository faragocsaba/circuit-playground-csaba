import { useMemo, useState } from 'react';
import { AlertTriangle, Info, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BuilderSchematic, CurvePlot } from './builder-diagrams';
import { defaultParams, fmtI, fmtR, getPart, PARTS, solveTemplate, TEMPLATE_ORDER, TEMPLATES, type MosPart, type BjtPart, type TemplateId } from '@/lib/transistor-builder';

export function TransistorBuilder({ initialTemplate = 'bjt-switch', initialA, initialB }: { initialTemplate?: TemplateId; initialA?: number | undefined; initialB?: number | undefined }) {
  const initParams = (t: TemplateId, a?: number, b?: number) => {
    const p = defaultParams(t);
    if (TEMPLATES[t].family === 'cmos') { const vdd = p['vdd'] ?? 5; if (a !== undefined) p['va'] = a ? vdd : 0; if (b !== undefined) p['vb'] = b ? vdd : 0; }
    return p;
  };
  const [template, setTemplate] = useState<TemplateId>(initialTemplate);
  const [partId, setPartId] = useState(TEMPLATES[initialTemplate].defaultPart);
  const [partPId, setPartPId] = useState(TEMPLATES[initialTemplate].defaultPartP ?? 'cmos-p');
  const [params, setParams] = useState<Record<string, number>>(() => initParams(initialTemplate, initialA, initialB));
  const spec = TEMPLATES[template];
  const result = useMemo(() => solveTemplate({ template, partId, partPId, params }), [template, partId, partPId, params]);

  function pick(t: TemplateId) { setTemplate(t); setPartId(TEMPLATES[t].defaultPart); setPartPId(TEMPLATES[t].defaultPartP ?? 'cmos-p'); setParams(initParams(t)); }
  const fam = spec.family === 'bjt' ? 'bjt' : 'mos';
  const partsN = PARTS.filter(p => p.family === fam && (spec.family !== 'cmos' || p.polarity === 'n'));
  const partsP = PARTS.filter(p => p.family === 'mos' && p.polarity === 'p');
  const part = getPart(partId);
  const vdd = params['vdd'] ?? params['vcc'] ?? 15;

  return <>
    <div className="lab-grid">
      <section className="workspace" aria-label="Circuit builder workspace">
        <div className="workspace-head"><div className="flex items-center gap-2.5"><span className="eyebrow text-muted-foreground">CIRCUIT BUILDER</span><span className="text-xs text-muted-foreground">/</span><span className="text-xs font-medium">{spec.name}</span></div><span className="live-status"><span className="legend-dot" />Solved</span></div>
        <div className="circuit-space"><BuilderSchematic template={template} result={result} /></div>
        <div className="panel-note"><Info size={13} className="shrink-0" /><span>{spec.idea}</span></div>
        <div className="readouts readouts-led" aria-live="polite">{result.outputs.map(o => <div className="readout" key={o.label}><div className="eyebrow text-muted-foreground" style={{ fontSize: 9, letterSpacing: .6 }}>{o.label.toUpperCase()}</div><div className="readout-value" style={{ fontSize: 19 }}>{o.value}</div></div>)}</div>
      </section>
      <aside className="controls" aria-label="Circuit builder controls">
        <div className="control-group"><div className="control-label">Circuit template</div><div className="layout-options">{TEMPLATE_ORDER.map(t => <Button key={t} variant="outline" className="layout-option" aria-pressed={template === t} onClick={() => pick(t)}><span className="radio" />{TEMPLATES[t].name}<span className="ml-auto font-mono text-[10px] opacity-60">{TEMPLATES[t].short}</span></Button>)}</div></div>
        <div className="control-divider" />
        <div className="control-group"><label htmlFor="part-n" className="control-label">{spec.family === 'cmos' ? 'NMOS part' : 'Transistor part'}</label><select id="part-n" className="w-full rounded-md border bg-card px-3 py-2 text-sm" value={partId} onChange={e => setPartId(e.target.value)}>{partsN.map(p => <option key={p.id} value={p.id}>{p.name} — {p.polarity === 'n' ? (fam === 'bjt' ? 'NPN' : 'N-channel') : (fam === 'bjt' ? 'PNP' : 'P-channel')}</option>)}</select></div>
        {spec.family === 'cmos' && <div className="control-group"><label htmlFor="part-p" className="control-label">PMOS part</label><select id="part-p" className="w-full rounded-md border bg-card px-3 py-2 text-sm" value={partPId} onChange={e => setPartPId(e.target.value)}>{partsP.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>}
        {spec.params.map(p => {
          const max = (p.key === 'va' || p.key === 'vb') ? vdd : p.max;
          const v = Math.min(params[p.key] ?? p.value, max);
          return <div className="control-group" key={p.key}><label htmlFor={`bp-${p.key}`} className="control-label">{p.label}<output className="value-pill">{p.unit === 'Ω' ? fmtR(v) : `${v.toFixed(2)} V`}</output></label><input id={`bp-${p.key}`} className="range" type="range" min={p.min} max={max} step={p.step} value={v} onChange={e => setParams(s => ({ ...s, [p.key]: Number(e.target.value) }))} /></div>;
        })}
        <div className="control-divider" />
        <Button variant="ghost" size="sm" onClick={() => pick(template)}><RotateCcw size={14} /> Reset this circuit</Button>
      </aside>
    </div>
    {result.warnings.length > 0 && <div className="info-note mt-5 flex gap-2" role="alert"><AlertTriangle size={14} className="mt-0.5 shrink-0 text-primary" /><span>{result.warnings.join(' ')}</span></div>}
    <div className="lower-grid">
      <section><div className="section-top"><h2>Each transistor</h2><span className="text-[10px] text-muted-foreground font-mono">SOLVED OPERATING POINT</span></div><div className="figure-panel"><div className="overflow-x-auto p-4"><table className="w-full text-xs font-mono"><thead><tr className="text-left text-muted-foreground"><th className="py-1.5">Device</th><th>Part</th><th>Control</th><th>Across</th><th>Current</th><th>Region</th></tr></thead><tbody>{result.devices.map(d => <tr key={d.label} className="border-t"><td className="py-2 font-semibold">{d.label}</td><td>{d.part}</td><td>{d.controlName} {d.control.toFixed(2)} V</td><td>{d.acrossName} {d.across.toFixed(2)} V</td><td>{fmtI(d.current)}</td><td style={{ color: d.on ? 'var(--primary)' : undefined }}>{d.region}</td></tr>)}</tbody></table></div>
        <div className="panel-note"><Info size={13} className="shrink-0" /><span><strong>{part.name}</strong>: {part.note}. {part.family === 'bjt' ? `Typical gain β ≈ ${(part as BjtPart).betaF}, Early voltage ${(part as BjtPart).va} V, max ${fmtI((part as BjtPart).icMax)}.` : `Threshold ${(part as MosPart).vth} V, max ${fmtI((part as MosPart).idMax)}.`} Values are rounded datasheet typicals.</span></div></div></section>
      <section><div className="section-top"><h2>{result.curve.title}</h2><span className="text-[10px] text-muted-foreground font-mono">● YOUR SETTING</span></div><div className="figure-panel"><div className="p-4"><CurvePlot curve={result.curve} /></div><div className="panel-note"><Info size={13} className="shrink-0" /><span>{fam === 'bjt' ? 'Ebers–Moll model with the Early effect: it covers cutoff, the active region and saturation.' : 'Square-law MOSFET model with channel-length modulation.'} Every point is solved from the same equations as the readouts.</span></div></div></section>
    </div>
  </>;
}
