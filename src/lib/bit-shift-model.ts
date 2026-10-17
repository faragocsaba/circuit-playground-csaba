// Fixed-width, browser-safe bit operations; diagrams use this same mapping.
export type ShiftMode = 'left' | 'right' | 'arithmetic';
export const SHIFT_WIDTH = 8;
export const SHIFT_MODES: Record<ShiftMode, { name: string; note: string }> = {
  left: { name: 'Logical left', note: 'Move toward higher bit positions. Zeros enter on the right; bits leaving the left are lost.' },
  right: { name: 'Logical right', note: 'Move toward lower bit positions. Zeros enter on the left; bits leaving the right are lost.' },
  arithmetic: { name: 'Arithmetic right', note: 'Move right while copying the sign bit into the left positions. This preserves the sign of a two’s-complement number.' },
};
export function signedByte(value: number): number {
  const byte = Math.trunc(value) & 255;
  return byte >= 128 ? byte - 256 : byte;
}
export function shiftByte(value: number, mode: ShiftMode, amount: number) {
  const input = Math.trunc(value) & 255;
  const count = Math.max(0, Math.min(SHIFT_WIDTH, Math.trunc(amount)));
  const before = input.toString(2).padStart(SHIFT_WIDTH, '0');
  // Index 0 is the displayed MSB; null is a newly inserted bit.
  const sources = Array.from({ length: SHIFT_WIDTH }, (_, i) => {
    const source = mode === 'left' ? i + count : i - count;
    return source >= 0 && source < SHIFT_WIDTH ? source : null;
  });
  const fill = mode === 'arithmetic' ? before[0] ?? '0' : '0';
  const after = sources.map(source => source === null ? fill : before[source] ?? '0').join('');
  const output = parseInt(after, 2);
  const discarded = mode === 'left' ? before.slice(0, count) : before.slice(SHIFT_WIDTH - count);
  return { input, output, before, after, sources, count, fill, discarded, signedInput: signedByte(input), signedOutput: signedByte(output) };
}