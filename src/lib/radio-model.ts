/** Browser-safe ideal single-tone AM/FM model; physical frequencies in Hz.
 * Waveform views translate the carrier down for inspection without changing the message.
 * Receiver selectivity is illustrative, not a full RF circuit solver. */
export type Modulation = 'am' | 'fm';
export type RadioLabKind = 'modulation' | 'receiver' | 'transmitter';
export interface RadioSettings { mode: Modulation; audioHz: number; depth: number; deviationHz: number; carrierHz: number; tuneHz: number; bandwidthHz: number; strength: number; volume: number; detectorMs: number; powerW: number }
export const defaultRadioSettings: RadioSettings = { mode: 'am', audioHz: 500, depth: 0.6, deviationHz: 2500, carrierHz: 1_000_000, tuneHz: 1_000_000, bandwidthHz: 12_000, strength: 1, volume: 0.3, detectorMs: 0.3, powerW: 1 };
export function modeSettings(mode: Modulation): RadioSettings {
  return { ...defaultRadioSettings, mode, carrierHz: mode === 'am' ? 1_000_000 : 100_000_000, tuneHz: mode === 'am' ? 1_000_000 : 100_000_000, bandwidthHz: mode === 'am' ? 12_000 : 180_000 };
}
export const message = (t: number, hz: number) => Math.cos(2 * Math.PI * hz * t);
export const amEnvelope = (s: RadioSettings, t: number) => 1 + s.depth * message(t, s.audioHz);
export const fmPhase = (s: RadioSettings, t: number, carrier = s.carrierHz) => 2 * Math.PI * carrier * t + s.deviationHz / s.audioHz * Math.sin(2 * Math.PI * s.audioHz * t);
export const instantaneousFrequency = (s: RadioSettings, t: number) => s.carrierHz + s.deviationHz * message(t, s.audioHz);
export function rfSignal(s: RadioSettings, t: number, carrier = s.carrierHz) {
  return s.mode === 'am' ? amEnvelope(s, t) * Math.cos(2 * Math.PI * carrier * t) : Math.cos(fmPhase(s, t, carrier));
}
/** Smooth approximate bandpass magnitude; bandwidth is the full −3 dB width. */
export const tuningGain = (carrier: number, tune: number, bandwidth: number) => 1 / Math.sqrt(1 + (2 * (carrier - tune) / bandwidth) ** 2);
export function receiverGain(s: RadioSettings) { return s.strength * tuningGain(s.carrierHz, s.tuneHz, s.bandwidthHz); }
/** Ideal diode rapidly charges C; R allows an exponential discharge between peaks.
 * Input is the RF peak envelope; carrier ripple and diode drop are omitted. */
export function detectorStep(previous: number, envelope: number, dt: number, tau: number) {
  return Math.max(Math.abs(envelope), previous * Math.exp(-dt / tau));
}
/** Ideal FM discriminator: differentiate unwrapped phase and remove the carrier. */
export function discriminate(previousPhase: number, phase: number, dt: number, carrier: number, deviation: number) {
  return deviation > 0 ? ((phase - previousPhase) / (2 * Math.PI * dt) - carrier) / deviation : 0;
}
export interface RadioSample { time: number; message: number; carrier: number; rf: number; envelope: number; detected: number; audio: number; frequency: number }
export function radioSamples(s: RadioSettings, receiving = false, count = 1200): RadioSample[] {
  const duration = 3 / s.audioHz, dt = duration / (count - 1), carrier = 24 * s.audioHz;
  const gain = receiving ? receiverGain(s) : 1;
  let peak = gain * amEnvelope(s, 0);
  let previousPhase = fmPhase(s, -dt, carrier);
  return Array.from({ length: count }, (_, i) => {
    const time = i * dt, envelope = amEnvelope(s, time), phase = fmPhase(s, time, carrier);
    peak = detectorStep(peak, gain * envelope, dt, s.detectorMs / 1000);
    const fmAudio = discriminate(previousPhase, phase, dt, carrier, s.deviationHz);
    previousPhase = phase;
    const detected = s.mode === 'am' ? peak : gain > 0.02 ? fmAudio : 0;
    const audio = s.mode === 'am' ? s.depth > 0 ? (peak - gain) / s.depth : 0 : detected * Math.min(1, gain);
    return { time, message: message(time, s.audioHz), carrier: Math.cos(2 * Math.PI * carrier * time), rf: gain * rfSignal(s, time, carrier), envelope: gain * Math.abs(envelope), detected, audio, frequency: instantaneousFrequency(s, time) };
  });
}
export function radioAnalysis(s: RadioSettings) {
  const gain = receiverGain(s), index = s.deviationHz / s.audioHz;
  return { gain, index, bandwidth: s.mode === 'am' ? 2 * s.audioHz : 2 * (s.deviationHz + s.audioHz), overmodulated: s.mode === 'am' && s.depth > 1,
    minFrequency: s.carrierHz - s.deviationHz, maxFrequency: s.carrierHz + s.deviationHz,
    carrierPower: s.powerW, averagePower: s.mode === 'am' ? s.powerW * (1 + s.depth ** 2 / 2) : s.powerW,
    tankCapPf: 1 / ((2 * Math.PI * s.tuneHz) ** 2 * (s.mode === 'am' ? 250e-6 : 100e-9)) * 1e12,
    loHz: s.tuneHz + (s.mode === 'am' ? 455_000 : 10_700_000), ifHz: s.mode === 'am' ? 455_000 : 10_700_000,
  };
}
export const stations = { am: [{ hz: 900_000, tone: 300 }, { hz: 1_000_000, tone: 500 }, { hz: 1_100_000, tone: 800 }], fm: [{ hz: 98_000_000, tone: 300 }, { hz: 100_000_000, tone: 500 }, { hz: 102_000_000, tone: 800 }] };
export function formatRadioFrequency(hz: number) { return hz >= 1e7 ? `${(hz / 1e6).toFixed(3)} MHz` : `${(hz / 1000).toFixed(1)} kHz`; }