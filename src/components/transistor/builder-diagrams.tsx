// Schematics and curve plot for the transistor circuit builder. All values come from solveTemplate().
import type { BuildResult, Curve, TemplateId } from '@/lib/transistor-builder';

const ON = 'var(--primary)';
const OFF = 'var(--muted-foreground)';

function W({ d, hot = false }: { d: string; hot?: boolean }) {
  return <path d={d} className="symbol" style={{ strokeWidth: hot ? 2.6 : 2, stroke: hot ? ON : undefined }} />;
}
function Dot({ x, y }: { x: number; y: number }) { return <circle cx={x} cy={y} r={3.2} style={{ fill: 'var(--foreground)' }} />; }
function Label({ x, y, children, anchor = 'start', strong = false }: { x: number; y: number; children: React.ReactNode; anchor?: 'start' | 'middle' | 'end'; strong?: boolean }) {
  return <text x={x} y={y} textAnchor={anchor} className={strong ? 'terminal-label' : undefined} style={{ fontSize: strong ? 12 : 10.5 }}>{children}</text>;
}
function Volt({ x, y, v, anchor = 'start' }: { x: number; y: number; v: number | undefined; anchor?: 'start' | 'middle' | 'end' }) {
  return <text x={x} y={y} textAnchor={anchor} style={{ fontSize: 10.5, fill: 'var(--amber)', fontWeight: 600 }}>{(v ?? 0).toFixed(2)} V</text>;
}

function ResV({ x, y1, y2, label }: { x: number; y1: number; y2: number; label: string }) {
  const a = y1 + (y2 - y1) / 2 - 22, b = a + 44;
  let z = `M ${x} ${y1} V ${a}`;
  for (let i = 0; i < 6; i++) z += ` L ${x + (i % 2 ? -7 : 7)} ${a + 3.7 + i * 7.3}`;
  z += ` L ${x} ${b} V ${y2}`;
  return <g><W d={z} /><Label x={x + 13} y={a + 26}>{label}</Label></g>;
}
function ResH({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  const a = x1 + (x2 - x1) / 2 - 22, b = a + 44;
  let z = `M ${x1} ${y} H ${a}`;
  for (let i = 0; i < 6; i++) z += ` L ${a + 3.7 + i * 7.3} ${y + (i % 2 ? -7 : 7)}`;
  z += ` L ${b} ${y} H ${x2}`;
  return <g><W d={z} /><Label x={a + 22} y={y - 13} anchor="middle">{label}</Label></g>;
}
function Ground({ x, y }: { x: number; y: number }) {
  return <path d={`M ${x - 13} ${y} H ${x + 13} M ${x - 8} ${y + 5} H ${x + 8} M ${x - 3} ${y + 10} H ${x + 3}`} className="symbol" style={{ strokeWidth: 1.8 }} />;
}
function Rail({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return <g><W d={`M ${x1} ${y} H ${x2}`} /><Label x={x2 + 6} y={y + 4} strong>{label}</Label></g>;
}
function InPin({ x, y, label, v }: { x: number; y: number; label: string; v: number | undefined }) {
  return <g><circle cx={x} cy={y} r={5} className="symbol" style={{ strokeWidth: 2, fill: 'var(--card)' }} /><Label x={x} y={y - 12} anchor="middle" strong>{label}</Label><Volt x={x} y={y + 20} v={v} anchor="middle" /></g>;
}

/** BJT: gate/base lead from the left (x-30,y); terminals at (x+20, y∓36). PNP draws the emitter on top. */
function Bjt({ x, y, kind, on, label, part }: { x: number; y: number; kind: 'npn' | 'pnp'; on: boolean; label: string; part: string }) {
  const c = on ? ON : undefined;
  const st = { stroke: c, strokeWidth: 2.2 };
  // emitter arrow: NPN points out along the emitter lead, PNP points in toward the base
  const [tx, ty, ang] = kind === 'npn'
    ? [x + 17, y + 20, Math.atan2(15, 20)]
    : [x + 4, y - 10, Math.atan2(15, -20)];
  const l = 8, w = 0.45;
  const arrowD = `M ${tx} ${ty} L ${tx - l * Math.cos(ang - w)} ${ty - l * Math.sin(ang - w)} L ${tx - l * Math.cos(ang + w)} ${ty - l * Math.sin(ang + w)} Z`;
  return <g>
    <circle cx={x + 8} cy={y} r={27} className="symbol" style={{ strokeWidth: 1.4, opacity: 0.5 }} />
    <W d={`M ${x - 30} ${y} H ${x}`} hot={on} />
    <path d={`M ${x} ${y - 15} V ${y + 15}`} className="symbol" style={{ strokeWidth: 3, stroke: c }} />
    <path d={`M ${x} ${y - 7} L ${x + 20} ${y - 22} V ${y - 36} M ${x} ${y + 7} L ${x + 20} ${y + 22} V ${y + 36}`} className="symbol" style={st} />
    <path d={arrowD} style={{ fill: c ?? 'var(--foreground)' }} />
    <Label x={x + 40} y={y - 4} strong>{label}</Label>
    <Label x={x + 40} y={y + 10}>{part}</Label>
    <text x={x + 40} y={y + 24} style={{ fontSize: 9.5, fill: on ? ON : OFF }}>{on ? 'CONDUCTING' : 'off'}</text>
  </g>;
}

/** Enhancement MOSFET: gate from the left (x-30,y); terminals at (x+20, y∓36). PMOS has a gate bubble and source on top. */
function Mos({ x, y, kind, on, label, part, gate }: { x: number; y: number; kind: 'nmos' | 'pmos'; on: boolean; label: string; part: string; gate?: string }) {
  const c = on ? ON : undefined;
  return <g>
    <W d={`M ${x - 30} ${y} H ${kind === 'pmos' ? x - 14 : x - 8}`} />
    {kind === 'pmos' && <circle cx={x - 11} cy={y} r={3.2} className="symbol" style={{ strokeWidth: 1.8 }} />}
    <path d={`M ${x - 7} ${y - 13} V ${y + 13}`} className="symbol" style={{ strokeWidth: 2.4 }} />
    <path d={`M ${x} ${y - 15} V ${y - 6} M ${x} ${y - 3} V ${y + 3} M ${x} ${y + 6} V ${y + 15}`} className="symbol" style={{ strokeWidth: on ? 3.4 : 2.4, stroke: c }} />
    <path d={`M ${x} ${y - 11} H ${x + 20} V ${y - 36} M ${x} ${y + 11} H ${x + 20} V ${y + 36}`} className="symbol" style={{ strokeWidth: 2.2, stroke: c }} />
    {gate && <Label x={x - 34} y={y + 4} anchor="end" strong>{gate}</Label>}
    <Label x={x + 28} y={y - 4} strong>{label}</Label>
    <Label x={x + 28} y={y + 9}>{part}</Label>
    <text x={x + 28} y={y + 22} style={{ fontSize: 9.5, fill: on ? ON : OFF }}>{on ? 'ON' : 'off'}</text>
  </g>;
}

export function BuilderSchematic({ template, result }: { template: TemplateId; result: BuildResult }) {
  const n = result.nodes, d = result.devices, f = result.flipped;
  const on = (i: number) => d[i]?.on ?? false;
  const kindB = (d[0]?.kind === 'pnp' ? 'pnp' : 'npn') as 'npn' | 'pnp';
  const kindM = (d[0]?.kind === 'pmos' ? 'pmos' : 'nmos') as 'nmos' | 'pmos';
  const tall = template === 'cmos-nand' || template === 'cmos-nor';
  const box = `0 0 460 ${tall ? 380 : 320}`;
  const aria = `Schematic of the ${template} circuit`;

  if (template === 'bjt-switch' || template === 'mos-switch' || template === 'ce-amp') {
    const amp = template === 'ce-amp';
    const supplyName = template === 'mos-switch' ? 'Vdd' : 'Vcc';
    const outV = template === 'mos-switch' ? n['vd'] : n['vc'];
    const device = template === 'mos-switch'
      ? <Mos x={280} y={150} kind={kindM} on={on(0)} label="M1" part={d[0]?.part ?? ''} />
      : <Bjt x={280} y={150} kind={kindB} on={on(0)} label="Q1" part={d[0]?.part ?? ''} />;
    const load = template === 'mos-switch' ? 'RD' : 'RC';
    return <svg viewBox={box} className="circuit-svg" style={{ height: 340 }} role="img" aria-label={aria}>
      <Rail x1={amp ? 140 : 260} x2={340} y={30} label={`${supplyName} ${(n['vcc'] ?? n['vdd'] ?? 0).toFixed(1)} V`} />
      {/* output column at x = 300 */}
      {!f ? <>
        <ResV x={300} y1={30} y2={100} label={load} />
        <W d="M 300 100 V 114" /><Dot x={300} y={100} />
        <W d="M 300 100 H 390" /><Label x={396} y={104} strong>OUT</Label><Volt x={396} y={120} v={outV} />
        {amp ? <><W d="M 300 186 V 200" /><Dot x={300} y={200} /><Volt x={310} y={214} v={n['ve']} /><ResV x={300} y1={200} y2={280} label="RE" /></> : <W d="M 300 186 V 280" />}
      </> : <>
        {amp ? <><ResV x={300} y1={30} y2={100} label="RE" /><W d="M 300 100 V 114" /><Dot x={300} y={100} /><Volt x={310} y={96} v={n['ve']} /></> : <W d="M 300 30 V 114" />}
        <W d="M 300 186 V 200" /><Dot x={300} y={200} />
        <W d="M 300 200 H 390" /><Label x={396} y={204} strong>OUT</Label><Volt x={396} y={220} v={outV} />
        <ResV x={300} y1={200} y2={280} label={load} />
      </>}
      <Ground x={300} y={280} />
      {device}
      {template === 'bjt-switch' && <><InPin x={80} y={150} label="IN" v={n['vin']} /><ResH x1={85} x2={250} y={150} label="RB" /><Volt x={218} y={170} v={n['vb']} anchor="middle" /></>}
      {template === 'mos-switch' && <><InPin x={80} y={150} label="GATE" v={n['vg']} /><W d="M 85 150 H 250" /></>}
      {amp && <>
        <ResV x={150} y1={30} y2={150} label={f ? 'R2' : 'R1'} />
        <ResV x={150} y1={150} y2={280} label={f ? 'R1' : 'R2'} />
        <Ground x={150} y={280} /><Dot x={150} y={150} />
        <W d="M 150 150 H 250" /><Volt x={200} y={166} v={n['vb']} anchor="middle" />
        <W d="M 60 150 H 100 M 100 140 V 160 M 108 140 V 160 M 108 150 H 150" /><InPin x={55} y={150} label="IN ~" v={undefined} />
      </>}
    </svg>;
  }

  if (template === 'cmos-not') {
    return <svg viewBox={box} className="circuit-svg" style={{ height: 340 }} role="img" aria-label={aria}>
      <Rail x1={260} x2={340} y={30} label={`Vdd ${(n['vdd'] ?? 0).toFixed(1)} V`} />
      <W d="M 300 30 V 64" /><W d="M 300 136 V 184" /><W d="M 300 256 V 290" /><Ground x={300} y={290} />
      <Dot x={300} y={160} /><W d="M 300 160 H 390" /><Label x={396} y={164} strong>OUT</Label><Volt x={396} y={180} v={n['vo']} />
      <Mos x={280} y={100} kind="pmos" on={on(0)} label="P1" part={d[0]?.part ?? ''} />
      <Mos x={280} y={220} kind="nmos" on={on(1)} label="N1" part={d[1]?.part ?? ''} />
      <InPin x={80} y={160} label="A" v={n['va']} /><W d="M 85 160 H 200 M 200 100 V 220 M 200 100 H 250 M 200 220 H 250" /><Dot x={200} y={160} />
    </svg>;
  }

  if (template === 'cmos-nand') {
    return <svg viewBox={box} className="circuit-svg" style={{ height: 400 }} role="img" aria-label={aria}>
      <Rail x1={190} x2={350} y={30} label={`Vdd ${(n['vdd'] ?? 0).toFixed(1)} V`} />
      <W d="M 200 30 V 54 M 340 30 V 54" />
      <W d="M 200 126 V 150 H 340 V 126" /><W d="M 270 150 V 174" /><Dot x={270} y={150} />
      <W d="M 340 150 H 400" /><Dot x={340} y={150} /><Label x={404} y={146} strong>OUT</Label><Volt x={404} y={166} v={n['vo']} />
      <W d="M 270 246 V 264" /><Dot x={270} y={255} /><Volt x={278} y={259} v={n['mid']} />
      <W d="M 270 336 V 350" /><Ground x={270} y={350} />
      <Mos x={180} y={90} kind="pmos" on={on(0)} label="P1" part="" gate="A" />
      <Mos x={320} y={90} kind="pmos" on={on(1)} label="P2" part="" gate="B" />
      <Mos x={250} y={210} kind="nmos" on={on(2)} label="N1" part="" gate="A" />
      <Mos x={250} y={300} kind="nmos" on={on(3)} label="N2" part="" gate="B" />
      <Label x={20} y={360}>A = {(n['va'] ?? 0).toFixed(2)} V · B = {(n['vb'] ?? 0).toFixed(2)} V</Label>
    </svg>;
  }

  // NOR
  return <svg viewBox={box} className="circuit-svg" style={{ height: 400 }} role="img" aria-label={aria}>
    <Rail x1={190} x2={350} y={30} label={`Vdd ${(n['vdd'] ?? 0).toFixed(1)} V`} />
    <W d="M 270 30 V 44" />
    <W d="M 270 116 V 134" /><Dot x={270} y={125} /><Volt x={278} y={129} v={n['mid']} />
    <W d="M 270 206 V 230" /><W d="M 200 254 V 230 H 340 V 254" /><Dot x={270} y={230} />
    <W d="M 340 230 H 400" /><Dot x={340} y={230} /><Label x={404} y={226} strong>OUT</Label><Volt x={404} y={246} v={n['vo']} />
    <W d="M 200 326 V 350 H 340 V 326" /><Ground x={270} y={350} />
    <Mos x={250} y={80} kind="pmos" on={on(0)} label="P1" part="" gate="A" />
    <Mos x={250} y={170} kind="pmos" on={on(1)} label="P2" part="" gate="B" />
    <Mos x={180} y={290} kind="nmos" on={on(2)} label="N1" part="" gate="A" />
    <Mos x={320} y={290} kind="nmos" on={on(3)} label="N2" part="" gate="B" />
    <Label x={20} y={372}>A = {(n['va'] ?? 0).toFixed(2)} V · B = {(n['vb'] ?? 0).toFixed(2)} V</Label>
  </svg>;
}

export function CurvePlot({ curve }: { curve: Curve }) {
  const W0 = 440, H0 = 250, L = 46, R = 14, T = 16, B = 38;
  const all = curve.series.flatMap(s => s.points);
  const xMax = Math.max(...all.map(p => p[0]), curve.marker[0], 1e-9);
  const yMax = Math.max(...curve.series.filter(s => !s.dashed).flatMap(s => s.points.map(p => p[1])), curve.marker[1], 1e-9) * 1.08;
  const sx = (x: number) => L + (x / xMax) * (W0 - L - R);
  const sy = (y: number) => T + (1 - Math.max(0, Math.min(y, yMax)) / yMax) * (H0 - T - B);
  return <svg viewBox={`0 0 ${W0} ${H0}`} className="trace-svg" style={{ width: '100%', height: 'auto' }} role="img" aria-label={curve.title}>
    <path d={`M ${L} ${T} V ${H0 - B} H ${W0 - R}`} fill="none" stroke="var(--border)" />
    {[0.25, 0.5, 0.75].map(f => <path key={f} d={`M ${L} ${sy(yMax * f)} H ${W0 - R}`} stroke="var(--border)" strokeDasharray="2 4" />)}
    {curve.series.map((s, i) => <polyline key={s.label} fill="none" points={s.points.map(p => `${sx(p[0])},${sy(p[1])}`).join(' ')} stroke={s.dashed ? 'var(--amber)' : 'var(--primary)'} strokeOpacity={s.dashed ? 1 : 0.45 + 0.55 * (i === 1 || curve.series.length === 1 ? 1 : 0.4)} strokeWidth={2} strokeDasharray={s.dashed ? '5 4' : undefined} />)}
    {curve.series.length > 2 && curve.series.filter(s => !s.dashed).map(s => { const p = s.points[s.points.length - 1]!; return <text key={s.label} x={sx(p[0]) - 4} y={sy(p[1]) - 5} textAnchor="end" style={{ fontSize: 9 }}>{s.label}</text>; })}
    <circle cx={sx(curve.marker[0])} cy={sy(curve.marker[1])} r={5.5} style={{ fill: 'var(--amber)', stroke: 'var(--card)', strokeWidth: 2 }} />
    <text x={L - 6} y={T + 4} textAnchor="end">{yMax.toFixed(yMax < 10 ? 1 : 0)}</text>
    <text x={L - 6} y={H0 - B + 4} textAnchor="end">0</text>
    <text x={W0 - R} y={H0 - B + 16} textAnchor="end">{xMax.toFixed(0)}</text>
    <text x={(L + W0 - R) / 2} y={H0 - 6} textAnchor="middle">{curve.xLabel}</text>
    <text x={12} y={(T + H0 - B) / 2} textAnchor="middle" transform={`rotate(-90 12 ${(T + H0 - B) / 2})`}>{curve.yLabel}</text>
  </svg>;
}
