import { z } from 'zod';
import { acResponse, capacitorSample, timeConstant, type CapacitorSettings, type CapacitorSample } from './capacitor-model';

export const capacitorContextSchema = z.object({
  settings: z.object({ mode: z.enum(['dc', 'ac']), voltage: z.number().finite().min(-12).max(12), resistance: z.number().min(0.2).max(5), capacitance: z.number().min(100).max(2000), frequency: z.number().min(0.1).max(2), connected: z.boolean() }),
  sample: z.object({ time: z.number().finite().nonnegative(), voltage: z.number().finite().min(-12).max(12) }),
  history: z.array(z.object({ time: z.number().finite().nonnegative(), voltage: z.number().finite().min(-12).max(12), source: z.number().finite().min(-12).max(12), current: z.number().finite().min(-120).max(120) })).max(25),
  playing: z.boolean(),
});
export type CapacitorContext = z.infer<typeof capacitorContextSchema>;
export function snapshotCapacitor(settings: CapacitorSettings, sample: CapacitorSample, history: CapacitorSample[], playing: boolean): CapacitorContext {
  const stride = Math.max(1, Math.ceil(history.length / 24));
  return { settings: { ...settings }, sample: { time: sample.time, voltage: sample.voltage }, history: history.filter((_, i) => i % stride === 0).slice(-24).map(({ time, source, voltage, current }) => ({ time, source, voltage, current })), playing };
}
export function explainableCapacitor(context: CapacitorContext) {
  return { ...context, sample: capacitorSample(context.settings, context.sample.time, context.sample.voltage), timeConstantSeconds: timeConstant(context.settings), acSteadyState: context.settings.mode === 'ac' ? acResponse(context.settings) : null };
}