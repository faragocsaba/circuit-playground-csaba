/** Educational series R–L(–C) model. Units: V, Ω, H, µF, Hz, s; currents reported in mA. */
export type InductorMode = 'rl' | 'lc' | 'rlc';
export interface InductorSettings {
  mode: InductorMode;
  voltage: number; // DC source (rl), initial capacitor charge (lc), AC peak (rlc)
  resistance: number; // Ω
  inductance: number; // H
  capacitance: number; // µF
  frequency: number; // Hz (rlc drive)
  connected: boolean; // rl: source connected, or replaced by a wire so the stored current freewheels
}
export interface InductorState { time: number; current: number; capVoltage: number } // current in A
export interface InductorSample {
  time: number; source: number; current: number; // mA
  vR: number; vL: number; vC: number; energyL: number; energyC: number; // mJ
}
export const defaultInductorSettings: InductorSettings = {
  mode: 'rl', voltage: 6, resistance: 20, inductance: 10, capacitance: 1000, frequency: 1.6, connected: true,
};
export const timeConstant = (s: InductorSettings) => s.inductance / s.resistance;
export const resonantFrequency = (s: InductorSettings) => 1 / (2 * Math.PI * Math.sqrt(s.inductance * s.capacitance * 1e-6));
export const qualityFactor = (s: InductorSettings) => Math.sqrt(s.inductance / (s.capacitance * 1e-6)) / s.resistance;

export function sourceAt(s: InductorSettings, t: number) {
  if (s.mode === 'rl') return s.connected ? s.voltage : 0;
  if (s.mode === 'lc') return 0;
  return s.voltage * Math.sin(2 * Math.PI * s.frequency * t);
}
export function initialState(s: InductorSettings): InductorState {
  return { time: 0, current: 0, capVoltage: s.mode === 'lc' ? s.voltage : 0 };
}
export function sample(s: InductorSettings, st: InductorState): InductorSample {
  const source = sourceAt(s, st.time);
  const vC = s.mode === 'rl' ? 0 : st.capVoltage;
  const vR = st.current * s.resistance;
  return { time: st.time, source, current: st.current * 1000, vR, vC, vL: source - vR - vC,
    energyL: 0.5 * s.inductance * st.current ** 2 * 1000, energyC: 0.5 * s.capacitance * 1e-6 * vC ** 2 * 1000 };
}
/** L di/dt = vs − iR − vC ; dvC/dt = i/C. RL steps are exact; LC/RLC use RK4 with ≤0.5 ms substeps. */
export function advance(s: InductorSettings, st: InductorState, dt: number): InductorState {
  if (dt <= 0) return st;
  if (s.mode === 'rl') {
    const target = sourceAt(s, st.time) / s.resistance;
    return { time: st.time + dt, current: target + (st.current - target) * Math.exp(-dt / timeConstant(s)), capVoltage: 0 };
  }
  const C = s.capacitance * 1e-6;
  const f = (t: number, i: number, v: number) => [(sourceAt(s, t) - i * s.resistance - v) / s.inductance, i / C] as const;
  const n = Math.max(1, Math.ceil(dt / 0.0005)); const h = dt / n;
  let { time: t, current: i, capVoltage: v } = st;
  for (let k = 0; k < n; k++) {
    const a = f(t, i, v), b = f(t + h / 2, i + h / 2 * a[0], v + h / 2 * a[1]);
    const c = f(t + h / 2, i + h / 2 * b[0], v + h / 2 * b[1]), d = f(t + h, i + h * c[0], v + h * c[1]);
    i += h / 6 * (a[0] + 2 * b[0] + 2 * c[0] + d[0]); v += h / 6 * (a[1] + 2 * b[1] + 2 * c[1] + d[1]); t += h;
  }
  return { time: t, current: i, capVoltage: v };
}
/** Steady-state series RLC: peak current (mA), phase of current vs source (deg, + = leads), reactances (Ω). */
export function acResponse(s: InductorSettings, frequency = s.frequency) {
  const w = 2 * Math.PI * frequency;
  const xL = w * s.inductance, xC = 1 / (w * s.capacitance * 1e-6);
  const z = Math.hypot(s.resistance, xL - xC);
  return { xL, xC, impedance: z, peakCurrent: s.voltage / z * 1000, phase: Math.atan2(xC - xL, s.resistance) * 180 / Math.PI };
}
