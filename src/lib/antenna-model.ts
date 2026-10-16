// Pure, browser-safe educational antenna model.
export type AntennaType = 'dipole' | 'monopole' | 'loop' | 'yagi';
export type RadioMode = 'transmit' | 'receive';
export type AntennaSettings = { type: AntennaType; frequencyMHz: number; lengthM: number; mode: RadioMode };

export const C = 299_792_458;
export const antennaInfo: Record<AntennaType, { name: string; resonantFraction: number; gainDbi: number; example: string; polarization: string }> = {
  dipole: { name: 'Half-wave dipole', resonantFraction: 0.48, gainDbi: 2.15, example: 'FM radio rabbit ears, TV aerials', polarization: 'Linear, along the rods' },
  monopole: { name: 'Quarter-wave monopole', resonantFraction: 0.24, gainDbi: 5.15, example: 'Car whip, walkie-talkie, Wi-Fi router stick', polarization: 'Vertical' },
  loop: { name: 'Small loop', resonantFraction: 0.1, gainDbi: 1.76, example: 'AM radio ferrite loop, RFID tags', polarization: 'Linear, in the loop plane' },
  yagi: { name: 'Yagi–Uda (3 element)', resonantFraction: 0.48, gainDbi: 7.5, example: 'Rooftop TV antenna, amateur radio beam', polarization: 'Linear, along the elements' },
};

export const defaultAntennaSettings: AntennaSettings = { type: 'dipole', frequencyMHz: 100, lengthM: 1.44, mode: 'transmit' };

export const wavelength = (fMHz: number) => C / (fMHz * 1e6);
export const resonantLength = (type: AntennaType, fMHz: number) => antennaInfo[type].resonantFraction * wavelength(fMHz);

/** Radiation resistance in ohms (textbook approximations). */
export function radiationResistance(type: AntennaType, lengthM: number, fMHz: number): number {
  const l = lengthM / wavelength(fMHz);
  if (type === 'loop') { const a = (l * wavelength(fMHz)) ** 2 / (4 * Math.PI); return 31171 * (a / wavelength(fMHz) ** 2) ** 2 / 1; } // l = circumference/λ
  const dip = (x: number) => x <= 0.3 ? 20 * Math.PI ** 2 * x ** 2 * 1.2 : 73 * Math.min(1.6, (x / 0.5) ** 1.3);
  if (type === 'monopole') return dip(2 * l) / 2;
  if (type === 'yagi') return dip(l) * 0.35; // parasitic elements pull the feed impedance down
  return dip(l);
}

/** Share of the transmitter power actually accepted (series-resonance mismatch, Q ≈ 8). */
export function matchFactor(type: AntennaType, lengthM: number, fMHz: number): number {
  if (type === 'loop') return 1; // small loops are tuned with a capacitor
  const ratio = lengthM / resonantLength(type, fMHz);
  const q = 8;
  return 1 / (1 + q * q * (ratio - 1 / ratio) ** 2);
}

/** Radiation efficiency against 2 Ω of conductor/ground loss. */
export function efficiency(type: AntennaType, lengthM: number, fMHz: number): number {
  const r = radiationResistance(type, lengthM, fMHz);
  return r / (r + 2);
}

/** Normalised field strength (0..1) towards angle `theta` in radians.
 *  0 = along +x in the drawing (to the right), π/2 = up. */
export function patternRaw(type: AntennaType, lengthM: number, fMHz: number, theta: number): number {
  const k = 2 * Math.PI / wavelength(fMHz);
  // dipole/monopole axis vertical: angle from axis is (π/2 - theta)
  const fromAxis = Math.PI / 2 - theta;
  const dipole = (len: number) => {
    const s = Math.sin(fromAxis);
    if (Math.abs(s) < 1e-6) return 0;
    const h = k * len / 2;
    return Math.abs((Math.cos(h * Math.cos(fromAxis)) - Math.cos(h)) / s);
  };
  if (type === 'dipole') return dipole(lengthM);
  if (type === 'monopole') return Math.sin(theta) < -1e-9 ? 0 : dipole(2 * lengthM);
  if (type === 'loop') return Math.abs(Math.sin(theta)); // loop drawn edge-on, axis horizontal → null along its axis, maximum in the loop plane
  // Yagi: three horizontal elements stacked along +x (reflector -0.2λ, driven 0, director +0.2λ), top view
  const d = 0.2 * wavelength(fMHz);
  const amps = [{ x: -d, a: 0.65, p: Math.PI * 0.5 }, { x: 0, a: 1, p: 0 }, { x: d, a: 0.75, p: -Math.PI * 0.5 }];
  let re = 0, im = 0;
  for (const e of amps) { const ph = k * e.x * Math.cos(theta) + e.p; re += e.a * Math.cos(ph); im += e.a * Math.sin(ph); }
  const element = Math.abs(Math.cos(theta)) ** 0.5 * 0.4 + 0.6; // short-dipole element factor seen from above, softened
  return Math.hypot(re, im) * element;
}

export function pattern(type: AntennaType, lengthM: number, fMHz: number, samples = 180): number[] {
  const raw = Array.from({ length: samples }, (_, i) => patternRaw(type, lengthM, fMHz, i / samples * 2 * Math.PI));
  const max = Math.max(...raw, 1e-9);
  return raw.map(v => v / max);
}

/** Front-to-back ratio in dB (direction 0 vs π). */
export function frontToBack(type: AntennaType, lengthM: number, fMHz: number): number {
  const f = patternRaw(type, lengthM, fMHz, 0), b = patternRaw(type, lengthM, fMHz, Math.PI);
  return 20 * Math.log10(Math.max(f, 1e-9) / Math.max(b, 1e-9));
}

export function antennaModel(s: AntennaSettings) {
  const lambda = wavelength(s.frequencyMHz);
  const match = matchFactor(s.type, s.lengthM, s.frequencyMHz);
  const eff = efficiency(s.type, s.lengthM, s.frequencyMHz);
  const delivered = match * eff;
  return {
    lambda,
    resonantLength: resonantLength(s.type, s.frequencyMHz),
    lengthInWavelengths: s.lengthM / lambda,
    radiationResistance: radiationResistance(s.type, s.lengthM, s.frequencyMHz),
    match, efficiency: eff, delivered,
    gainDbi: antennaInfo[s.type].gainDbi,
    pattern: pattern(s.type, s.lengthM, s.frequencyMHz),
    frontToBack: frontToBack(s.type, s.lengthM, s.frequencyMHz),
    periodNs: 1e3 / s.frequencyMHz,
  };
}

export const formatLength = (m: number) => m >= 1 ? `${m.toFixed(2)} m` : `${(m * 100).toFixed(1)} cm`;
