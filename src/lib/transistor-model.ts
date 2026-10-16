export type TransistorType = 'npn' | 'pnp';
export type Configuration = 'emitter' | 'base' | 'collector';
export const BETA = 100;
export const LOAD_KOHM = 1;
export const configurations = {
  emitter: { name: 'Common emitter', abbreviation: 'CE', input: 'Base current', maxDrive: 150, unit: 'µA', observation: 'A small base current controls a much larger collector current.', response: 'Inverting', shared: 'Emitter' },
  base: { name: 'Common base', abbreviation: 'CB', input: 'Emitter current', maxDrive: 15, unit: 'mA', observation: 'The emitter supplies the input; nearly all its current reaches the collector.', response: 'Non-inverting', shared: 'Base' },
  collector: { name: 'Common collector', abbreviation: 'CC', input: 'Base current', maxDrive: 150, unit: 'µA', observation: 'The emitter voltage follows the base, while supplying more current.', response: 'Voltage follower', shared: 'Collector' },
} as const;
// Magnitudes in mA and V; polarity is applied to signed terminal voltages.
// CE: grounded emitter, collector 1k load to supply. CB: grounded base,
// negative emitter input for NPN, collector 1k load to supply. CC: collector
// at supply, emitter 1k load to ground. Mirror all polarities for PNP.
export function transistorModel(type: TransistorType, config: Configuration, drive: number, supply: number) {
  const sign = type === 'npn' ? 1 : -1;
  const v = Math.max(0, supply);
  const requestedBase = Math.max(0, drive) / (config === 'base' ? BETA + 1 : 1000);
  const canConduct = v > 0.7;
  const limit = canConduct ? Math.max(0, v - (config === 'base' ? -0.5 : 0.2)) / LOAD_KOHM : 0;
  const ibActive = canConduct ? requestedBase : 0;
  const collectorTarget = BETA * ibActive;
  const ic = config === 'collector' ? Math.min(collectorTarget, Math.max(0, limit - ibActive)) : Math.min(collectorTarget, limit);
  const ib = config === 'base' && canConduct ? Math.max(0, drive) - ic : config === 'collector' ? Math.min(ibActive, limit) : ibActive;
  const ie = ic + ib;
  const active = canConduct && requestedBase > 0;
  const saturated = active && collectorTarget >= (config === 'collector' ? Math.max(0, limit - ibActive) : limit);
  // Emitter output in CC is constrained by its load, even when excess base drive flows.
  const emitterVoltage = config === 'collector' ? Math.min(ie * LOAD_KOHM, Math.max(0, v - 0.2)) : config === 'base' && active ? -0.7 : 0;
  const collectorVoltage = config === 'collector' ? v : Math.max(config === 'base' && active ? -0.5 : 0, v - ic * LOAD_KOHM);
  return { ib, ic, ie, sign, state: !active ? 'Cutoff' : saturated ? 'Saturation' : 'Active', output: sign * (config === 'collector' ? emitterVoltage : collectorVoltage), vb: sign * (config === 'base' ? 0 : active ? emitterVoltage + 0.7 : 0), ve: sign * emitterVoltage, vc: sign * collectorVoltage, conducting: active, saturated };
}
export type Model = ReturnType<typeof transistorModel>;
// Compress the numerical gain to a readable 10:1 active-region dot ratio.
// Every branch has the same transit period, so counts also represent dot rates.
export function transistorFlow(model: Model) {
  const base = model.ib > 0 ? 1 : 0;
  const collector = model.ic > 0
    ? Math.max(1, Math.min(10, Math.round(10 * model.ic / Math.max(model.ib * BETA, Number.EPSILON))))
    : 0;
  return {
    base,
    collector,
    emitter: collector + base,
    period: 3 * Math.max(0.75, Math.min(4, Math.sqrt(4.04 / Math.max(model.ie, 0.001)))),
  };
}
export function formatCurrent(ma: number) { return ma < 1 ? { value: (ma * 1000).toFixed(ma === 0 ? 0 : 1), unit: 'µA' } : { value: ma.toFixed(2), unit: 'mA' }; }
