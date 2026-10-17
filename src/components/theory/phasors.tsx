import { analyze, type CircuitSettings } from '@/lib/circuit-model';

/** Stationary voltage phasors with current as the horizontal reference. */
export function TheoryPhasors({ settings }: { settings: CircuitSettings }) {
  const a = analyze(settings);
  const scale = 105 / Math.max(settings.voltage, a.vR, a.vL, a.vC);
  const x = 170, y = 150;
  return <svg className="theory-diagram mx-auto" viewBox="0 0 600 310" role="img" aria-label={`Voltage phasors with horizontal current reference; current phase ${a.phase.toFixed(2)} degrees`}>
    <defs><marker id="theory-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" className="node" /></marker></defs>
    <circle cx={x} cy={y} r="120" className="ant-grid" /><path d="M40 150H300M170 20V280" className="comparison-axis" />
    <line x1={x} y1={y} x2={x + a.vR * scale} y2={y} className="phasor-r" strokeWidth="3" markerEnd="url(#theory-arrow)" />
    <line x1={x} y1={y} x2={x} y2={y - a.vL * scale} className="phasor-l" strokeWidth="3" markerEnd="url(#theory-arrow)" />
    <line x1={x} y1={y} x2={x} y2={y + a.vC * scale} className="phasor-c" strokeWidth="3" markerEnd="url(#theory-arrow)" />
    <line x1={x} y1={y} x2={x + a.vR * scale} y2={y - (a.vL - a.vC) * scale} className="phasor-s" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#theory-arrow)" />
    <text x="170" y="305" textAnchor="middle">Current reference →</text>
    <g transform="translate(335,65)">
      <text className="phasor-r-text">VR = {a.vR.toFixed(2)} V</text><text y="20">In phase with current</text>
      <text y="55" className="phasor-l-text">VL = {a.vL.toFixed(2)} V</text><text y="75">90° ahead of current</text>
      <text y="110" className="phasor-c-text">VC = {a.vC.toFixed(2)} V</text><text y="130">90° behind current</text>
      <text y="165" className="phasor-s-text">Vs = {settings.voltage.toFixed(2)} V</text><text y="185">Dashed: vector sum</text>
    </g>
  </svg>;
}