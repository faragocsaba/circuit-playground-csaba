import { useState } from 'react';
import { ArrowDownUp, ChevronDown, Cpu, Info, Pause, Play, RotateCcw, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetConfigurations, fetModel, fetParameters, type FetChannel, type FetConfiguration, type FetKind } from '@/lib/fet-model';
import { formatCurrent } from '@/lib/transistor-model';
import { FetCircuit, FetCutaway, FetTransfer } from './fet-diagrams';

export function FetLab() {
  const [kind, setKind] = useState<FetKind>('mosfet');
  const [channel, setChannel] = useState<FetChannel>('n');
  const [config, setConfig] = useState<FetConfiguration>('source');
  const [drive, setDrive] = useState(3);
  const [supply, setSupply] = useState(5);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const model = fetModel(kind, channel, config, drive, supply);
  const selected = fetConfigurations[config];
  const p = fetParameters[kind];
  const sign = channel === 'n' ? 1 : -1;
  function reset() { setKind('mosfet'); setChannel('n'); setConfig('source'); setDrive(3); setSupply(5); setPlaying(true); setSpeed(1); }
  return <>
    <div className="lab-grid">
      <section className="workspace" aria-label="FET circuit workspace">
        <div className="workspace-head"><span className="text-xs">{kind.toUpperCase()} / {selected.name}</span><span className="live-status"><span className="legend-dot" />{playing ? 'Running' : 'Paused'}</span></div>
        <div className="circuit-space"><div className="absolute left-5 top-4 status-badge">{model.state.toUpperCase()}</div><FetCircuit {...{ kind, channel, config, model, supply, playing, speed }} /></div>
        <div className="circuit-footer"><div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground"><span className="legend-dot flow-collector" />Iᴅ = Iѕ <span>· Iɢ ≈ 0 · Conventional current</span></div><div className="flex items-center gap-1"><Button variant="ghost" size="icon" aria-label={playing ? 'Pause animation' : 'Play animation'} title={playing ? 'Pause animation' : 'Play animation'} onClick={() => setPlaying(!playing)}>{playing ? <Pause /> : <Play />}</Button><div className="relative"><select aria-label="Animation speed" className="appearance-none rounded-md bg-secondary py-1.5 pl-3 pr-7 text-xs" value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select><ChevronDown size={12} className="absolute right-2 top-2 pointer-events-none" /></div><Button variant="ghost" size="icon" aria-label="Reset FET lab" title="Reset FET lab" onClick={reset}><RotateCcw /></Button></div></div>
        <div className="readouts" aria-live="polite">{[{ name: 'GATE–SOURCE', value: model.vgs.toFixed(2), unit: 'V' }, { name: 'DRAIN CURRENT', ...formatCurrent(model.id) }, { name: 'GATE CURRENT', value: '0', unit: 'µA' }].map(r => <div className="readout" key={r.name}><div className="eyebrow text-muted-foreground">{r.name}</div><div className="readout-value">{r.value} <span className="readout-unit">{r.unit}</span></div></div>)}</div>
      </section>
      <aside className="controls" aria-label="FET controls">
        <div className="eyebrow mb-6 text-muted-foreground">EXPERIMENT CONTROLS</div>
        <div className="control-group"><div className="control-label">Gate structure</div><div className="segment">{(['mosfet','jfet'] as const).map(k => <Button key={k} variant="ghost" size="sm" aria-pressed={kind === k} onClick={() => { setKind(k); setDrive(fetParameters[k].initial); }}>{k.toUpperCase()}</Button>)}</div></div>
        <div className="control-group"><div className="control-label">Channel type</div><div className="segment">{(['n','p'] as const).map(c => <Button key={c} variant="ghost" size="sm" aria-pressed={channel === c} onClick={() => setChannel(c)}><ArrowDownUp size={12} />{c.toUpperCase()}-channel</Button>)}</div></div>
        <div className="control-group"><div className="control-label">Circuit arrangement</div><div className="layout-options">{(Object.keys(fetConfigurations) as FetConfiguration[]).map(c => <Button key={c} variant="outline" className="layout-option" aria-pressed={config === c} onClick={() => setConfig(c)}><span className="radio" />{fetConfigurations[c].name}<span className="ml-auto text-[10px]">{fetConfigurations[c].short}</span></Button>)}</div></div>
        <div className="control-divider" />
        <div className="control-group"><label htmlFor="fet-drive" className="control-label">{config === 'gate' ? 'Source voltage' : 'Gate voltage'}<output className="value-pill">{((config === 'gate' ? -drive : drive) * sign).toFixed(2)} V</output></label><input id="fet-drive" aria-label={config === 'gate' ? 'Source voltage' : 'Gate voltage'} type="range" className="range" min={p.min} max={p.max} step="0.05" value={drive} onChange={e => setDrive(Number(e.target.value))} /><div className="range-ends"><span>{(p.min * sign * (config === 'gate' ? -1 : 1)).toFixed(0)} V</span><span>{(p.max * sign * (config === 'gate' ? -1 : 1)).toFixed(0)} V</span></div></div>
        <div className="control-group"><label htmlFor="fet-supply" className="control-label">Supply voltage<output className="value-pill">{(supply * sign).toFixed(1)} V</output></label><input id="fet-supply" type="range" className="range" min="0" max="12" step="0.1" value={supply} onChange={e => setSupply(Number(e.target.value))} /></div>
        <div className="control-divider" /><div className="info-note">{kind === 'mosfet' ? 'Enhancement MOSFET: normally off. An insulated gate creates a channel when the gate–source bias exceeds the threshold.' : 'JFET: normally on at zero gate–source bias. A reverse-biased junction gate squeezes the existing channel closed.'} {config === 'gate' && 'With the gate grounded, the source voltage sets VGS.'}</div>
      </aside>
    </div>
    <div className="lower-grid">
      <section><div className="section-top"><h2 className="flex items-center gap-2"><Cpu size={16} /> Inside the FET</h2><span className="text-xs text-muted-foreground">{kind.toUpperCase()}</span></div><div className="figure-panel"><FetCutaway {...{ kind, channel, model, playing, speed }} /><div className="panel-note"><Info size={13} className="shrink-0" /><span>{kind === 'mosfet' ? 'The oxide insulates the gate; its electric field controls channel charge.' : 'The reverse-biased gate junction expands the depletion region and narrows the channel.'} No steady gate current is shown; real devices have leakage and transient gate charging.</span></div></div></section>
      <section><div className="section-top"><h2 className="flex items-center gap-2"><Waves size={16} /> Voltage control</h2><span className="text-xs text-primary">{selected.response}</span></div><div className="figure-panel"><FetTransfer {...{ kind, channel, config, drive, supply }} /><div className="response-footer"><span>{selected.shared} is the common reference</span><span className="font-mono text-primary">Vᴅѕ {model.vds.toFixed(2)} V</span></div><div className="panel-note"><Info size={13} className="shrink-0" /><span>{model.state === 'Saturation' ? 'FET saturation is the current-source region used for amplification—not BJT saturation.' : model.state === 'Ohmic' ? 'The channel behaves like a voltage-controlled resistance; the supply and load constrain current.' : 'The channel is off at this gate–source voltage.'} {config === 'drain' && 'Source feedback reduces the effective gate–source bias.'}</span></div></div></section>
    </div>
    <footer className="footer"><span>Ideal square-law model · 1 kΩ load · no body diode, leakage or gate capacitance</span><span>Iѕ = Iᴅ · Iɢ ≈ 0</span></footer>
  </>;
}