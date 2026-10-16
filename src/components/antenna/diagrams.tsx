import type { AntennaSettings } from '@/lib/antenna-model';

const W = 720, H = 400, CX = 300, CY = 200;

/** Real-world style antenna drawing with animated current and radiated/incoming field. */
export function AntennaScene({ s, phase, scale }: { s: AntennaSettings; phase: number; scale: number }) {
  const tx = s.mode === 'transmit';
  const osc = Math.sin(phase * 2 * Math.PI);
  // visual element half-length in px, proportional to physical length vs resonance
  const half = Math.max(18, Math.min(150, 75 * scale));
  const waves = [0, 1, 2, 3, 4].map(i => (phase + i) % 5 / 5);
  const amp = tx ? 1 : 0.6;
  const cur = (y: number, len: number) => Math.cos(Math.PI / 2 * Math.min(1, Math.abs(y) / len)); // standing-wave current, max at feed
  const dots = (len: number, x: number, sign = 1) => Array.from({ length: 7 }, (_, i) => {
    const y = -len + (i + 0.5) * (2 * len / 7);
    return <circle key={`${x}-${i}`} className="current-particle" cx={x} cy={CY + y + sign * osc * 6 * cur(y, len)} r={2.6 + 1.6 * cur(y, len)} opacity={0.35 + 0.65 * cur(y, len)} />;
  });

  let antenna;
  if (s.type === 'dipole') antenna = <g>
    <line className="wire" x1={CX} y1={CY - half} x2={CX} y2={CY - 5} strokeWidth={5} /><line className="wire" x1={CX} y1={CY + 5} x2={CX} y2={CY + half} strokeWidth={5} />
    <path className="wire" d={`M${CX - 3} ${CY - 4}H${CX - 30}V${H - 30} M${CX + 3} ${CY + 4}H${CX + 16}V${H - 30}`} strokeWidth={1.5} fill="none" />
    {dots(half, CX)}
  </g>;
  else if (s.type === 'monopole') antenna = <g>
    <rect x={CX - 140} y={CY + 4} width={280} height={8} rx={2} className="ant-ground" />
    {[...Array(14)].map((_, i) => <line key={i} x1={CX - 135 + i * 20} y1={CY + 12} x2={CX - 145 + i * 20} y2={CY + 22} className="wire" strokeWidth={1} />)}
    <line className="wire" x1={CX} y1={CY - half * 1.6} x2={CX} y2={CY} strokeWidth={5} />
    <path className="wire" d={`M${CX} ${CY + 12}V${H - 30}`} strokeWidth={1.5} />
    {Array.from({ length: 6 }, (_, i) => { const y = -half * 1.6 + (i + 0.5) * (half * 1.6 / 6); const c = Math.cos(Math.PI / 2 * Math.abs(y) / (half * 1.6)); return <circle key={i} className="current-particle" cx={CX} cy={CY + y + osc * 6 * c} r={2.6 + 1.6 * c} opacity={0.35 + 0.65 * c} />; })}
    <text x={CX + 150} y={CY + 12} className="ant-label">ground plane (car roof, earth)</text>
  </g>;
  else if (s.type === 'loop') antenna = <g>
    <ellipse cx={CX} cy={CY} rx={14} ry={Math.max(22, half * 0.7)} className="wire" fill="none" strokeWidth={5} />
    <path className="wire" d={`M${CX} ${CY + Math.max(22, half * 0.7)}V${H - 30}`} strokeWidth={1.5} />
    <line x1={CX - 70} y1={CY} x2={CX + 70} y2={CY} className="ant-axis" />
    <text x={CX + 76} y={CY + 4} className="ant-label">loop axis — null</text>
    {Array.from({ length: 10 }, (_, i) => { const a = i / 10 * 2 * Math.PI + phase * 2 * Math.PI * 0.25 * Math.sign(osc || 1); return <circle key={i} className="current-particle" cx={CX + 14 * Math.cos(a)} cy={CY + Math.max(22, half * 0.7) * Math.sin(a)} r={3} />; })}
  </g>;
  else antenna = <g>
    <line x1={CX - 90} y1={CY} x2={CX + 150} y2={CY} className="wire" strokeWidth={4} />
    {[[-80, 1.1, 'reflector'], [0, 1, 'driven'], [80, 0.9, 'director']].map(([x, k, label]) => <g key={label as string}>
      <line x1={CX + (x as number)} y1={CY - half * (k as number)} x2={CX + (x as number)} y2={CY + half * (k as number)} className="wire" strokeWidth={label === 'driven' ? 5 : 3.5} />
      {dots(half * (k as number), CX + (x as number), label === 'driven' ? 1 : -0.6)}
      <text x={CX + (x as number)} y={CY - half * (k as number) - 8} textAnchor="middle" className="ant-label">{label as string}</text>
    </g>)}
    <path className="wire" d={`M${CX} ${CY + 6}V${H - 30}`} strokeWidth={1.5} />
  </g>;

  const dir = s.type === 'yagi';
  return <svg viewBox={`0 0 ${W} ${H}`} className="circuit-svg" role="img" aria-label={`${s.type} antenna ${tx ? 'transmitting' : 'receiving'}`}>
    <defs><clipPath id="ant-clip"><rect x="0" y="0" width={W} height={s.type === 'monopole' ? CY + 4 : H} /></clipPath></defs>
    <g clipPath="url(#ant-clip)">
      {tx ? waves.map((w, i) => {
        const r = 30 + w * 340;
        return dir
          ? <path key={i} d={`M${CX + 80 + r * 0.9} ${CY - r * 0.55} A${r} ${r} 0 0 1 ${CX + 80 + r * 0.9} ${CY + r * 0.55}`} className="ant-wave" style={{ opacity: (1 - w) * amp }} />
          : s.type === 'loop'
            ? <ellipse key={i} cx={CX} cy={CY} rx={r * 0.35} ry={r} className="ant-wave" style={{ opacity: (1 - w) * amp }} />
            : <ellipse key={i} cx={CX} cy={CY} rx={r} ry={r * 0.82} className="ant-wave" style={{ opacity: (1 - w) * amp }} />;
      }) : waves.map((w, i) => {
        const x = W - 20 - w * (W - CX + 120);
        return <line key={i} x1={x} y1={40} x2={x} y2={H - 40} className="ant-wave" style={{ opacity: Math.min(1, w * 3) * (1 - w * 0.6) }} />;
      })}
    </g>
    {!tx && <g><path d={`M${W - 30} ${CY - 150}h-50`} className="ant-arrow" /><text x={W - 30} y={CY - 160} textAnchor="end" className="ant-label">incoming wave</text></g>}
    {antenna}
    <rect x={CX - 40} y={H - 30} width={80} height={22} rx={4} className="ant-box" />
    <text x={CX} y={H - 15} textAnchor="middle" className="ant-label ant-box-text">{tx ? 'TRANSMITTER' : 'RECEIVER'}</text>
    <text x={20} y={28} className="ant-label">E-field {tx ? 'radiated' : 'arriving'} · {(s.frequencyMHz).toFixed(0)} MHz</text>
  </svg>;
}

/** Polar radiation pattern. */
export function PatternPlot({ pattern, title }: { pattern: number[]; title: string }) {
  const R = 120, c = 150;
  const pts = pattern.map((v, i) => { const a = i / pattern.length * 2 * Math.PI; return `${c + R * v * Math.cos(a)},${c - R * v * Math.sin(a)}`; }).join(' ');
  return <svg viewBox="0 0 300 300" className="w-full" style={{ maxHeight: 300 }} role="img" aria-label={title}>
    {[0.25, 0.5, 0.75, 1].map(r => <circle key={r} cx={c} cy={c} r={R * r} className="ant-grid" />)}
    {[0, 30, 60, 90, 120, 150].map(d => { const a = d * Math.PI / 180; return <line key={d} x1={c - R * Math.cos(a)} y1={c + R * Math.sin(a)} x2={c + R * Math.cos(a)} y2={c - R * Math.sin(a)} className="ant-grid" />; })}
    <polygon points={pts} className="ant-pattern" />
    <text x={c + R + 4} y={c - 4} className="ant-label">0°</text><text x={c + 3} y={c - R - 6} className="ant-label">90°</text>
  </svg>;
}
