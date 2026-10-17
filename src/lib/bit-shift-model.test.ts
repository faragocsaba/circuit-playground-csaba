import { describe, expect, it } from 'vitest';
import { shiftByte, signedByte } from './bit-shift-model';

describe('eight-bit shifts', () => {
  it('left shift doubles 13 with zero fill', () => {
    expect(shiftByte(13, 'left', 1)).toMatchObject({ output: 26, after: '00011010', fill: '0' });
  });
  it('left shift discards high bits instead of expanding the byte', () => {
    expect(shiftByte(192, 'left', 2)).toMatchObject({ output: 0, discarded: '11' });
  });
  it('logical right divides unsigned values and drops the remainder', () => {
    expect(shiftByte(13, 'right', 2)).toMatchObject({ output: 3, discarded: '01', after: '00000011' });
  });
  it('arithmetic right replicates the sign and rounds negative division downward', () => {
    expect(shiftByte(243, 'arithmetic', 1)).toMatchObject({ signedInput: -13, signedOutput: -7, after: '11111001', fill: '1' });
  });
  it('arithmetic right fills positive values with zeros', () => {
    expect(shiftByte(13, 'arithmetic', 1).output).toBe(6);
  });
  it('zero positions is an identity with no discarded bits', () => {
    expect(shiftByte(165, 'left', 0)).toMatchObject({ output: 165, discarded: '', sources: [0, 1, 2, 3, 4, 5, 6, 7] });
  });
  it('eight positions clears logical shifts and keeps only the arithmetic sign', () => {
    expect(shiftByte(165, 'left', 8).output).toBe(0);
    expect(shiftByte(165, 'right', 8).output).toBe(0);
    expect(shiftByte(165, 'arithmetic', 8).signedOutput).toBe(-1);
  });
  it('interprets a byte using two’s complement', () => {
    expect(signedByte(127)).toBe(127);
    expect(signedByte(128)).toBe(-128);
    expect(signedByte(255)).toBe(-1);
  });
  it('diagram mappings match each output bit for every byte and shift', () => {
    for (const mode of ['left', 'right', 'arithmetic'] as const) for (let value = 0; value < 256; value++) for (let amount = 0; amount <= 8; amount++) {
      const r = shiftByte(value, mode, amount);
      expect(r.output).toBe(mode === 'left' ? (value * 2 ** amount) & 255 : mode === 'right' ? Math.floor(value / 2 ** amount) : Math.floor(signedByte(value) / 2 ** amount) & 255);
      r.sources.forEach((source, i) => expect(r.after[i]).toBe(source === null ? r.fill : r.before[source]));
    }
  });
});