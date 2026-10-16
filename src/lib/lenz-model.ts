/** Educational Lenz's-law model: a bar magnet moving along the axis of a coil.
 *  Distance in coil radii (1 = touching), speed in radii/s, flux normalized so
 *  flux(1) = 1. Induced EMF and current are in arbitrary teaching units. */
export type Pole = 'north' | 'south';
export interface LenzSettings { pole: Pole; resistance: number } // resistance in arbitrary units
export const defaultLenzSettings: LenzSettings = { pole: 'north', resistance: 10 };

/** Flux through the coil from a magnet at distance d along its axis (~ dipole fall-off). */
export const flux = (d: number) => 1 / (d * d);

/** dΦ/dt for a magnet moving with velocity v (positive = approaching). */
export const fluxRate = (d: number, v: number) => (2 * v) / (d * d * d);

/** Induced EMF opposes the change: ε = −dΦ/dt. Sign flipped for a south pole. */
export function inducedEmf(s: LenzSettings, d: number, v: number) {
  const emf = -fluxRate(d, v);
  const signed = s.pole === 'north' ? emf : -emf;
  return signed === 0 ? 0 : signed; // avoid -0
}

/** Induced current = ε / R. */
export function inducedCurrent(s: LenzSettings, d: number, v: number) {
  return inducedEmf(s, d, v) / s.resistance;
}

/** Which pole the coil presents to the magnet: it always opposes the motion —
 *  approaching magnet meets a like pole (repelled), receding magnet meets an unlike pole (attracted). */
export function coilFace(s: LenzSettings, v: number): Pole | 'none' {
  if (Math.abs(v) < 1e-9) return 'none';
  const approaching = v > 0;
  if (s.pole === 'north') return approaching ? 'north' : 'south';
  return approaching ? 'south' : 'north';
}

/** Oscillating magnet motion: distance swings between dMin and dMax with period T (s). */
export function oscillation(t: number, dMin = 1.2, dMax = 4, period = 6) {
  const phase = (2 * Math.PI * t) / period;
  const mid = (dMin + dMax) / 2, amp = (dMax - dMin) / 2;
  const distance = mid - amp * Math.cos(phase);
  const velocity = ((2 * Math.PI) / period) * amp * Math.sin(phase); // positive = approaching
  return { distance, velocity };
}
