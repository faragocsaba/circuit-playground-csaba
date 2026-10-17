import { shiftByte, type ShiftMode } from '@/lib/bit-shift-model';

export function BitShiftDiagram({ value, mode, amount }: { value: number; mode: ShiftMode; amount: number }) {
  const result = shiftByte(value, mode, amount);
  const x = (i: number) => 112 + i * 64;
  return <svg viewBox="0 0 720 350" className="shift-svg" role="img" aria-label={`${result.before} shifted ${mode === 'left' ? 'left' : 'right'} by ${result.count} becomes ${result.after}`}>
    <defs><marker id="shift-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="currentColor" /></marker></defs>
    <text x="38" y="34">BIT</text>
    {Array.from({ length: 8 }, (_, i) => <text key={i} x={x(i)} y="34" textAnchor="middle">{7 - i}</text>)}
    <text x="38" y="87">IN</text><text x="38" y="273">OUT</text>
    {result.sources.map((source, i) => source !== null
      ? <path key={i} d={`M${x(source)} 110L${x(i)} 240`} className={`sig-wire ${result.before[source] === '1' ? 'sig-high' : ''}`} markerEnd="url(#shift-arrow)" />
      : <g key={i}><path d={`M${x(i)} 207V240`} className={`sig-wire ${result.fill === '1' ? 'sig-high' : ''}`} markerEnd="url(#shift-arrow)" /><text x={x(i)} y="198" textAnchor="middle" className="shift-fill">{mode === 'arithmetic' ? 'sign' : 'zero'}</text></g>)}
    {[result.before, result.after].map((bits, row) => bits.split('').map((bit, i) => <g key={`${row}-${i}`}>
      <rect x={x(i) - 22} y={row === 0 ? 58 : 242} width="44" height="48" rx="4" className={`sig-pin ${bit === '1' ? 'sig-high' : ''}`} />
      <text x={x(i)} y={row === 0 ? 88 : 272} textAnchor="middle" className="shift-bit">{bit}</text>
    </g>))}
    <text x="360" y="326" textAnchor="middle">{result.count === 0 ? 'No shift' : `${result.count} position${result.count === 1 ? '' : 's'} · discarded: ${result.discarded}`}</text>
  </svg>;
}