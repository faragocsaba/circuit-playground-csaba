import { describe, expect, it } from 'vitest';
import { bjtCurrents, defaultParams, getPart, mosCurrent, solveTemplate, templateForGate, type BjtPart, type MosPart, type TemplateId } from './transistor-builder';

const run = (template: TemplateId, partId: string, over: Record<string, number> = {}, partPId?: string) =>
  solveTemplate({ template, partId, partPId, params: { ...defaultParams(template), ...over } });

describe('device equations', () => {
  it('2N3904 in the active region has current gain close to its beta', () => {
    const p = getPart('2n3904') as BjtPart;
    const { ib, ic } = bjtCurrents(p, 0.65, -4);
    expect(ic / ib).toBeGreaterThan(170);
    expect(ic / ib).toBeLessThan(200);
  });
  it('MOSFET is off below threshold and conducts above it', () => {
    const p = getPart('2n7000') as MosPart;
    expect(mosCurrent(p, 1.5, 5)).toBeLessThan(1e-7);
    expect(mosCurrent(p, 4, 5)).toBeGreaterThan(0.3);
  });
});

describe('templates', () => {
  it('BJT switch saturates with 5 V in and cuts off with 0 V in', () => {
    const on = run('bjt-switch', '2n3904');
    expect(on.devices[0]!.region).toBe('saturation');
    expect(on.nodes['vc']!).toBeLessThan(0.3);
    const off = run('bjt-switch', '2n3904', { vin: 0 });
    expect(off.devices[0]!.region).toBe('cutoff');
    expect(off.nodes['vc']!).toBeGreaterThan(8.9);
  });
  it('PNP high-side switch turns on when the input is pulled low', () => {
    const r = run('bjt-switch', '2n3906', { vin: 0 });
    expect(r.devices[0]!.on).toBe(true);
    expect(r.nodes['vc']!).toBeGreaterThan(8.5);
  });
  it('common-emitter amplifier biases into the active region with gain ≈ −RC/RE', () => {
    const r = run('ce-amp', '2n3904');
    expect(r.devices[0]!.region).toBe('active');
    const vc = r.nodes['vc']!;
    expect(vc).toBeGreaterThan(4); expect(vc).toBeLessThan(8);
    const gain = parseFloat(r.outputs[1]!.value);
    expect(gain).toBeLessThan(-4); expect(gain).toBeGreaterThan(-4.8);
  });
  it('MOSFET switch: off at 0 V gate, nearly full load current at 10 V', () => {
    expect(run('mos-switch', '2n7000', { vg: 0 }).nodes['vd']!).toBeGreaterThan(11.9);
    expect(run('mos-switch', '2n7000', { vg: 10 }).nodes['vd']!).toBeLessThan(0.5);
  });
  it('CMOS gates produce the right truth tables at full logic levels', () => {
    const lvl = (t: TemplateId, a: number, b: number) => run(t, 'cmos-n', { va: a * 5, vb: b * 5 }, 'cmos-p').nodes['vo']! > 2.5 ? 1 : 0;
    for (const [a, b] of [[0, 0], [0, 1], [1, 0], [1, 1]] as const) {
      expect(lvl('cmos-nand', a, b)).toBe(a && b ? 0 : 1);
      expect(lvl('cmos-nor', a, b)).toBe(a || b ? 0 : 1);
    }
    expect(lvl('cmos-not', 0, 0)).toBe(1);
    expect(lvl('cmos-not', 1, 0)).toBe(0);
  });
  it('a CMOS gate at a valid logic level draws essentially no supply current', () => {
    const r = run('cmos-nand', 'cmos-n', { va: 5, vb: 0 }, 'cmos-p');
    expect(r.outputs[2]!.value).toMatch(/nA/);
  });
  it('symmetric inverter switches at half the supply', () => {
    const r = run('cmos-not', 'cmos-n', { va: 2.5 }, 'cmos-p');
    expect(r.nodes['vo']!).toBeGreaterThan(1); expect(r.nodes['vo']!).toBeLessThan(4);
  });
  it('maps each logic gate to its transistor-level template', () => {
    expect(templateForGate('not')).toBe('cmos-not');
    expect(templateForGate('and')).toBe('cmos-nand');
    expect(templateForGate('or')).toBe('cmos-nor');
  });
});
