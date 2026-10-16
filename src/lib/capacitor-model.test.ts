import { describe, expect, it } from 'vitest';
import { acResponse, advanceCapacitor, capacitorSample, defaultCapacitorSettings as defaults, timeConstant } from './capacitor-model';

describe('capacitor RC model', () => {
  it('charges to 63.2% in one time constant and blocks steady DC', () => {
    expect(timeConstant(defaults)).toBe(1);
    const sample = advanceCapacitor(defaults, 0, 0, 1);
    expect(sample.voltage).toBeCloseTo(5 * (1 - Math.exp(-1)));
    expect(sample.source).toBeCloseTo(sample.voltage + sample.current * defaults.resistance);
    expect(advanceCapacitor(defaults, 0, 0, 20).current).toBeCloseTo(0);
  });
  it('discharges stored energy through the resistor with reversed current', () => {
    const sample = advanceCapacitor({ ...defaults, connected: false }, 0, 5, 1);
    expect(sample.voltage).toBeCloseTo(5 / Math.E);
    expect(sample.current).toBeLessThan(0);
    expect(sample.energy).toBeLessThan(capacitorSample(defaults, 0, 5).energy);
  });
  it('uses consistent charge and energy units', () => {
    const sample = capacitorSample(defaults, 0, 5);
    expect(sample.charge).toBe(5000);
    expect(sample.energy).toBe(12.5);
  });
  it('preserves voltage across source changes at zero elapsed time', () => {
    expect(advanceCapacitor({ ...defaults, mode: 'ac', voltage: 12 }, 2, 3, 0).voltage).toBeCloseTo(3);
    expect(advanceCapacitor({ ...defaults, voltage: -5 }, 2, 3, 0).voltage).toBeCloseTo(3);
  });
  it('solves AC independently of step size and reverses current', () => {
    const settings = { ...defaults, mode: 'ac' as const };
    const single = advanceCapacitor(settings, 0, 0, 2);
    let sample = capacitorSample(settings, 0, 0);
    for (let i = 0; i < 200; i++) sample = advanceCapacitor(settings, sample.time, sample.voltage, 0.01);
    expect(sample.voltage).toBeCloseTo(single.voltage, 10);
    expect(advanceCapacitor(settings, 0, 0, 0.5).current).toBeGreaterThan(0);
    expect(advanceCapacitor(settings, 0, 0, 1.5).current).toBeLessThan(0);
  });
  it('matches steady AC attenuation and voltage phase lag', () => {
    const settings = { ...defaults, mode: 'ac' as const };
    const response = acResponse(settings);
    const time = 20.5;
    expect(advanceCapacitor(settings, 0, 0, time).voltage).toBeCloseTo(response.amplitude * Math.sin(2 * Math.PI * settings.frequency * time - response.lag * Math.PI / 180), 6);
    expect(acResponse({ ...settings, frequency: 2 }).amplitude).toBeLessThan(response.amplitude);
  });
});