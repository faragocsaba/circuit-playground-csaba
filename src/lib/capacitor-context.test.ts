import { describe, it, expect } from 'vitest';
import { capacitorContextSchema, snapshotCapacitor, explainableCapacitor } from './capacitor-context';
import { defaultCapacitorSettings, capacitorSample } from './capacitor-model';

describe('capacitor question snapshots', () => {
  it('freezes settings and bounds the trace', () => {
    const settings = { ...defaultCapacitorSettings };
    const sample = capacitorSample(settings, 1, 3);
    const snapshot = snapshotCapacitor(settings, sample, Array.from({length: 300}, (_, i) => capacitorSample(settings, i / 25, 3)), false);
    settings.voltage = 12;
    expect(snapshot.settings.voltage).toBe(5);
    expect(snapshot.history.length).toBeLessThanOrEqual(25);
    expect(capacitorContextSchema.safeParse(snapshot).success).toBe(true);
    expect(explainableCapacitor(snapshot).sample.current).toBe(2);
  });
  it('computes discharge and AC context using the RC model', () => {
    const settings = { ...defaultCapacitorSettings, connected: false };
    const dc = explainableCapacitor(snapshotCapacitor(settings, capacitorSample(settings, 2, 4), [], true));
    expect(dc.sample.current).toBe(-4);
    expect(dc.timeConstantSeconds).toBe(1);
    const ac = explainableCapacitor({ ...dc, settings: { ...settings, mode: 'ac' } });
    expect(ac.acSteadyState?.lag).toBeGreaterThan(0);
  });
});