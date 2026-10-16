export type FetKind = 'mosfet' | 'jfet';
export type FetChannel = 'n' | 'p';
export type FetConfiguration = 'source' | 'gate' | 'drain';
export const fetConfigurations = {
  source: { name: 'Common source', short: 'CS', response: 'Inverting', shared: 'Source' },
  gate: { name: 'Common gate', short: 'CG', response: 'Non-inverting', shared: 'Gate' },
  drain: { name: 'Common drain', short: 'CD', response: 'Source follower', shared: 'Drain' },
} as const;
export const fetParameters = {
  mosfet: { threshold: 2, k: 2, min: 0, max: 5, initial: 3 },
  jfet: { threshold: -4, k: 1.25, min: -4, max: 0, initial: -1 },
} as const;

// Normalized n-channel magnitudes: V, mA, a 1 kΩ load.
// P-channel circuits mirror every voltage and conventional-current direction.
// Long-channel square-law MOSFET; JFET uses the same channel law with a
// negative cutoff voltage (Shockley's IDSS curve at sufficient VDS).
export function fetChannelCurrent(kind: FetKind, vgs: number, vds: number) {
  const { threshold, k } = fetParameters[kind];
  const overdrive = Math.max(0, vgs - threshold);
  const drain = Math.max(0, vds);
  if (overdrive === 0 || drain === 0) return 0;
  return drain < overdrive
    ? k * (overdrive * drain - drain * drain / 2)
    : k * overdrive * overdrive / 2;
}

export function fetModel(kind: FetKind, channel: FetChannel, config: FetConfiguration, drive: number, supply: number) {
  const p = fetParameters[kind];
  const input = Math.max(p.min, Math.min(p.max, drive));
  const rail = Math.max(0, supply);
  const headroom = Math.max(0, rail + (config === 'gate' ? input : 0));
  const terminals = (current: number) => {
    const source = config === 'drain' ? current : config === 'gate' ? -input : 0;
    const gate = config === 'gate' ? 0 : input;
    const drain = config === 'drain' ? rail : rail - current;
    return { source, gate, drain, vgs: gate - source, vds: drain - source };
  };
  let low = 0;
  let high = headroom;
  // Solve the channel equation and resistive load line together, including
  // source feedback in common drain. No ideal current-source clipping.
  for (let i = 0; i < 64; i++) {
    const mid = (low + high) / 2;
    const t = terminals(mid);
    if (fetChannelCurrent(kind, t.vgs, t.vds) > mid) low = mid;
    else high = mid;
  }
  const id = (low + high) / 2 < 1e-9 ? 0 : (low + high) / 2;
  const t = terminals(id);
  const sign = channel === 'n' ? 1 : -1;
  const overdrive = Math.max(0, t.vgs - p.threshold);
  const state = id === 0 ? 'Cutoff' : t.vds < overdrive ? 'Ohmic' : 'Saturation';
  return {
    id, is: id, ig: 0, state, conducting: id > 0, sign,
    vg: sign * t.gate, vs: sign * t.source, vd: sign * t.drain,
    vgs: sign * t.vgs, vds: sign * t.vds,
    output: sign * (config === 'drain' ? t.source : t.drain),
    channelFraction: Math.min(1, overdrive / (kind === 'mosfet' ? 3 : 4)),
    dots: id > 0 ? Math.max(2, Math.min(12, Math.ceil(id * 2))) : 0,
    period: 3 / Math.max(0.25, Math.min(2, Math.sqrt(id / 2))),
  };
}
export type FetModel = ReturnType<typeof fetModel>;