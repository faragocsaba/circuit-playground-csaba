export type DiodeKind = 'rectifier' | 'schottky' | 'led' | 'zener';
export type LedColor = 'red' | 'green' | 'blue';
export type DiodeState = 'Forward' | 'Below threshold' | 'Blocking' | 'Breakdown';

export const ledForward: Record<LedColor, number> = { red: 1.8, green: 2.1, blue: 3.0 };
export const ZENER_VOLTAGE = 5.1;

export const diodes: Record<DiodeKind, { name: string; abbreviation: string; observation: string }> = {
  rectifier: { name: 'Rectifier diode', abbreviation: 'Si', observation: 'A one-way valve: current flows once the forward voltage passes about 0.7 V, and is blocked in reverse.' },
  schottky: { name: 'Schottky diode', abbreviation: 'SB', observation: 'A metal–semiconductor junction turns on at only about 0.3 V, so less voltage is lost across it.' },
  led: { name: 'Light-emitting diode', abbreviation: 'LED', observation: 'Carriers recombining at the junction release light. Brighter colors need a higher forward voltage.' },
  zener: { name: 'Zener diode', abbreviation: 'Z', observation: 'Built to break down safely in reverse: it holds about 5.1 V across itself, which makes it a voltage reference.' },
};

export function forwardVoltage(kind: DiodeKind, color: LedColor = 'red') {
  return kind === 'schottky' ? 0.3 : kind === 'led' ? ledForward[color] : 0.7;
}

/** Simplified series circuit: source → resistor (kΩ) → diode. Current in mA, positive = forward. */
export function diodeModel(kind: DiodeKind, source: number, resistanceK: number, color: LedColor = 'red') {
  const vf = forwardVoltage(kind, color);
  const r = Math.max(resistanceK, 0.01);
  let current = 0; let vd = source; let state: DiodeState;
  if (source > vf) { current = (source - vf) / r; vd = vf; state = 'Forward'; }
  else if (kind === 'zener' && source < -ZENER_VOLTAGE) { current = (source + ZENER_VOLTAGE) / r; vd = -ZENER_VOLTAGE; state = 'Breakdown'; }
  else state = source >= 0 ? 'Below threshold' : 'Blocking';
  const vr = source - vd;
  return {
    vf, current, vd, vr, state, conducting: current !== 0,
    power: Math.abs(current * vd),
    brightness: kind === 'led' ? Math.min(1, Math.max(0, current) / 20) : 0,
    /** 0 = thin (forward), 1 = wide (strong reverse bias) */
    depletion: state === 'Forward' ? 0.15 : Math.min(1, 0.35 + Math.max(0, -vd) / 12),
  };
}
export type DiodeResult = ReturnType<typeof diodeModel>;

/** Idealized device characteristic for the I–V plot (mA per volt beyond the knee is illustrative). */
export function ivCurve(kind: DiodeKind, v: number, color: LedColor = 'red') {
  const vf = forwardVoltage(kind, color);
  if (v > vf) return (v - vf) * 40;
  if (kind === 'zener' && v < -ZENER_VOLTAGE) return (v + ZENER_VOLTAGE) * 40;
  return 0;
}
