export type SourceMode = 'dc' | 'ac';
export interface CapacitorSettings {
  mode: SourceMode;
  voltage: number;
  resistance: number; // kΩ
  capacitance: number; // µF
  frequency: number; // Hz
  connected: boolean; // DC: source connected or replaced by a discharge wire
}
export interface CapacitorSample {
  time: number;
  source: number;
  voltage: number;
  current: number; // mA, positive into upper plate
  charge: number; // µC on upper plate
  energy: number; // mJ
}
export const defaultCapacitorSettings: CapacitorSettings = {
  mode: 'dc', voltage: 5, resistance: 1, capacitance: 1000, frequency: 0.5, connected: true,
};
export function timeConstant(settings: CapacitorSettings) {
  return settings.resistance * settings.capacitance / 1000;
}
export function sourceAt(settings: CapacitorSettings, time: number) {
  return settings.mode === 'ac' ? settings.voltage * Math.sin(2 * Math.PI * settings.frequency * time)
    : settings.connected ? settings.voltage : 0;
}
export function capacitorSample(settings: CapacitorSettings, time: number, voltage: number): CapacitorSample {
  const source = sourceAt(settings, time);
  return { time, source, voltage, current: (source - voltage) / settings.resistance,
    charge: settings.capacitance * voltage, energy: settings.capacitance * voltage * voltage / 2000 };
}
// Exact RC solution over a time step; keeps stored charge continuous when controls change.
export function advanceCapacitor(settings: CapacitorSettings, time: number, voltage: number, dt: number) {
  const tau = timeConstant(settings);
  const decay = Math.exp(-Math.max(0, dt) / tau);
  let next: number;
  if (settings.mode === 'dc') {
    const target = sourceAt(settings, time);
    next = target + (voltage - target) * decay;
  } else {
    const omega = 2 * Math.PI * settings.frequency;
    const x = omega * tau;
    const particular = (t: number) => settings.voltage * (Math.sin(omega * t) - x * Math.cos(omega * t)) / (1 + x * x);
    next = particular(time + dt) + (voltage - particular(time)) * decay;
  }
  return capacitorSample(settings, time + dt, next);
}
export function acResponse(settings: CapacitorSettings) {
  const x = 2 * Math.PI * settings.frequency * timeConstant(settings);
  return { amplitude: settings.voltage / Math.sqrt(1 + x * x), lag: Math.atan(x) * 180 / Math.PI };
}