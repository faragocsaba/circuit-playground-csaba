export type Arrangement = 'single' | 'series' | 'parallel';
export interface ResistorSettings { arrangement: Arrangement; voltage: number; r1: number; r2: number }
export const defaultResistorSettings: ResistorSettings = { arrangement: 'single', voltage: 9, r1: 470, r2: 1000 };

/** Ideal Ohm's-law model. Resistances in Ω, voltage in V, currents in mA, power in mW. */
export function resistorModel({ arrangement, voltage, r1, r2 }: ResistorSettings) {
  const total = arrangement === 'single' ? r1 : arrangement === 'series' ? r1 + r2 : (r1 * r2) / (r1 + r2);
  const current = (voltage / total) * 1000;
  const i1 = arrangement === 'parallel' ? (voltage / r1) * 1000 : current;
  const i2 = arrangement === 'single' ? 0 : arrangement === 'parallel' ? (voltage / r2) * 1000 : current;
  const v1 = (i1 / 1000) * r1;
  const v2 = (i2 / 1000) * r2;
  return { total, current, i1, i2, v1, v2, power: voltage * current, p1: v1 * i1, p2: v2 * i2 };
}

const names = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'grey', 'white'] as const;
export type BandColor = (typeof names)[number] | 'gold';
/** Four-band code (two digits, multiplier, ±5% gold) for resistances of 10 Ω or more. */
export function colorBands(ohms: number): BandColor[] {
  let exponent = Math.floor(Math.log10(ohms)) - 1;
  let digits = Math.round(ohms / 10 ** exponent);
  if (digits === 100) { digits = 10; exponent += 1; }
  return [names[Math.floor(digits / 10)]!, names[digits % 10]!, names[exponent]!, "gold"];
}
export function formatOhms(ohms: number) {
  return ohms >= 1000 ? `${+(ohms / 1000).toFixed(2)} kΩ` : `${+ohms.toFixed(1)} Ω`;
}

/** Kirchhoff checks built from the same model results. KCL: current in = sum out at the junction. KVL: source rise = sum of drops around each loop. */
export function kirchhoff(settings: ResistorSettings) {
  const m = resistorModel(settings);
  const { arrangement, voltage } = settings;
  const kcl = arrangement === 'parallel'
    ? { into: m.current, out: [m.i1, m.i2] }
    : { into: m.current, out: [m.i1] };
  const loops = arrangement === 'series' ? [{ source: voltage, drops: [m.v1, m.v2] }]
    : arrangement === 'parallel' ? [{ source: voltage, drops: [m.v1] }, { source: voltage, drops: [m.v2] }]
      : [{ source: voltage, drops: [m.v1] }];
  return { kcl, loops };
}
