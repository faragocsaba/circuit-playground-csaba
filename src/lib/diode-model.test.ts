import { describe, expect, it } from 'vitest';
import { diodeModel, forwardVoltage, ZENER_VOLTAGE } from './diode-model';

describe('diode model', () => {
  it('conducts above forward voltage with Ohm-limited current', () => {
    const m = diodeModel('rectifier', 5.7, 1);
    expect(m.state).toBe('Forward');
    expect(m.current).toBeCloseTo(5);
    expect(m.vd + m.vr).toBeCloseTo(5.7);
  });
  it('Schottky turns on earlier than silicon', () => {
    expect(diodeModel('schottky', 0.5, 1).conducting).toBe(true);
    expect(diodeModel('rectifier', 0.5, 1).conducting).toBe(false);
  });
  it('LED threshold depends on color and brightness on current', () => {
    expect(forwardVoltage('led', 'blue')).toBeGreaterThan(forwardVoltage('led', 'red'));
    expect(diodeModel('led', 2.5, 1, 'blue').conducting).toBe(false);
    expect(diodeModel('led', 12, 0.5, 'red').brightness).toBe(1);
  });
  it('blocks reverse except Zener breakdown', () => {
    expect(diodeModel('rectifier', -10, 1).current).toBe(0);
    const z = diodeModel('zener', -8, 1);
    expect(z.state).toBe('Breakdown');
    expect(z.vd).toBeCloseTo(-ZENER_VOLTAGE);
    expect(z.current).toBeCloseTo(-(8 - ZENER_VOLTAGE));
  });
  it('depletion widens with reverse bias', () => {
    expect(diodeModel('rectifier', -10, 1).depletion).toBeGreaterThan(diodeModel('rectifier', 5, 1).depletion);
  });
});
