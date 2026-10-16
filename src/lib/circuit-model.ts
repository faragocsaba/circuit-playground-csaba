/** Educational series AC circuit with switchable R, L and C. Steady-state phasor analysis.
 *  Units: V (peak), Ω, H, µF, Hz; currents in mA; angles in degrees. */
export interface CircuitSettings {
  voltage: number; // peak source voltage
  frequency: number; // Hz
  resistance: number; // Ω
  inductance: number; // H
  capacitance: number; // µF
  useR: boolean;
  useL: boolean;
  useC: boolean;
}
export const defaultCircuitSettings: CircuitSettings = {
  voltage: 6, frequency: 1.6, resistance: 20, inductance: 10, capacitance: 1000,
  useR: true, useL: true, useC: true,
};

export interface CircuitAnalysis {
  xL: number; xC: number; // reactances (Ω, 0 when switched out)
  impedance: number; // |Z| in Ω
  phase: number; // deg; + means current leads the source (capacitive)
  peakCurrent: number; // mA
  powerFactor: number; // 0…1
  vR: number; vL: number; vC: number; // peak component voltages (V)
  resonant: boolean; // reactances cancel
}

export function analyze(s: CircuitSettings): CircuitAnalysis {
  const w = 2 * Math.PI * s.frequency;
  const xL = s.useL ? w * s.inductance : 0;
  const xC = s.useC ? 1 / (w * s.capacitance * 1e-6) : 0;
  const r = s.useR ? s.resistance : 0;
  const impedance = Math.hypot(r, xL - xC);
  const peakCurrent = impedance > 0 ? (s.voltage / impedance) * 1000 : 0;
  const i = peakCurrent / 1000;
  return {
    xL, xC, impedance, peakCurrent,
    phase: impedance > 0 ? (Math.atan2(xC - xL, r) * 180) / Math.PI : 0,
    powerFactor: impedance > 0 ? r / impedance : 0,
    vR: i * r, vL: i * xL, vC: i * xC,
    resonant: s.useL && s.useC && Math.abs(xL - xC) < 0.02 * Math.max(xL, xC),
  };
}

/** Instantaneous source voltage and current at time t (s), current in mA. */
export function instant(s: CircuitSettings, a: CircuitAnalysis, t: number) {
  const w = 2 * Math.PI * s.frequency;
  const lead = (a.phase * Math.PI) / 180;
  return { source: s.voltage * Math.sin(w * t), current: a.peakCurrent * Math.sin(w * t + lead) };
}

/** Short description of the active combination, e.g. "RC". */
export function combination(s: CircuitSettings) {
  const parts = [s.useR && 'R', s.useL && 'L', s.useC && 'C'].filter(Boolean);
  return parts.length ? parts.join('') : 'open';
}
