// Circuit builder for the transistor lab: real part data + device equations + fill-in templates.
// Pure and browser-safe. Diagrams and readouts consume solveTemplate() results.
//
// BJT: transport Ebers–Moll with Early effect (captures cutoff, active, saturation, reverse leakage).
// MOSFET: square-law (Shichman–Hodges) with channel-length modulation.
// Part values are approximate datasheet-typical figures, rounded for teaching.

export const VT = 0.02585; // thermal voltage at ~27 °C

export type Polarity = 'n' | 'p';
export type BjtPart = { id: string; name: string; family: 'bjt'; polarity: Polarity; is: number; betaF: number; betaR: number; va: number; icMax: number; vceMax: number; note: string };
export type MosPart = { id: string; name: string; family: 'mos'; polarity: Polarity; vth: number; k: number; lambda: number; idMax: number; vdsMax: number; note: string };
export type Part = BjtPart | MosPart;

export const PARTS: Part[] = [
  { id: '2n3904', name: '2N3904', family: 'bjt', polarity: 'n', is: 6.7e-15, betaF: 180, betaR: 0.7, va: 74, icMax: 0.2, vceMax: 40, note: 'General-purpose small-signal NPN' },
  { id: 'bc547b', name: 'BC547B', family: 'bjt', polarity: 'n', is: 1.8e-14, betaF: 290, betaR: 1, va: 63, icMax: 0.1, vceMax: 45, note: 'High-gain European small-signal NPN' },
  { id: '2n2222a', name: '2N2222A', family: 'bjt', polarity: 'n', is: 1.4e-14, betaF: 200, betaR: 6, va: 74, icMax: 0.6, vceMax: 40, note: 'Higher-current switching NPN' },
  { id: '2n3906', name: '2N3906', family: 'bjt', polarity: 'p', is: 1.4e-15, betaF: 180, betaR: 4, va: 19, icMax: 0.2, vceMax: 40, note: 'Complement of the 2N3904 (PNP)' },
  { id: 'bc557b', name: 'BC557B', family: 'bjt', polarity: 'p', is: 1e-14, betaF: 290, betaR: 1, va: 50, icMax: 0.1, vceMax: 45, note: 'Complement of the BC547B (PNP)' },
  { id: '2n7000', name: '2N7000', family: 'mos', polarity: 'n', vth: 2.1, k: 0.1, lambda: 0.02, idMax: 0.2, vdsMax: 60, note: 'Small N-channel enhancement MOSFET' },
  { id: 'bs250', name: 'BS250', family: 'mos', polarity: 'p', vth: 2.0, k: 0.08, lambda: 0.02, idMax: 0.18, vdsMax: 45, note: 'Small P-channel enhancement MOSFET' },
  { id: 'cmos-n', name: 'Logic NMOS', family: 'mos', polarity: 'n', vth: 1.0, k: 0.001, lambda: 0.05, idMax: 0.01, vdsMax: 18, note: 'On-chip NMOS like those inside a CD4000-series gate' },
  { id: 'cmos-p', name: 'Logic PMOS', family: 'mos', polarity: 'p', vth: 1.0, k: 0.001, lambda: 0.05, idMax: 0.01, vdsMax: 18, note: 'On-chip PMOS, sized to match the logic NMOS' },
];

export function getPart(id: string): Part {
  const p = PARTS.find(x => x.id === id);
  if (!p) throw new Error(`Unknown part ${id}`);
  return p;
}

const limexp = (x: number) => (x < 40 ? Math.exp(x) : Math.exp(40) * (1 + x - 40));

/** NPN-convention BJT currents (A). For a PNP pass mirrored voltages V_EB, V_CB. */
export function bjtCurrents(p: BjtPart, vbe: number, vbc: number) {
  const ef = limexp(vbe / VT) - 1, er = limexp(vbc / VT) - 1;
  const it = p.is * (ef - er) * Math.max(0.05, 1 - vbc / p.va);
  const ib = (p.is / p.betaF) * ef + (p.is / p.betaR) * er + 1e-12 * vbe;
  const ic = it - (p.is / p.betaR) * er;
  return { ib, ic, ie: ib + ic };
}

export function bjtRegion(vbe: number, vbc: number): 'cutoff' | 'active' | 'saturation' {
  if (vbe < 0.5) return 'cutoff';
  return vbc > 0.4 ? 'saturation' : 'active';
}

/** NMOS-convention drain current (A). For a PMOS pass V_SG, V_SD. Symmetric for negative V_DS. */
export function mosCurrent(p: MosPart, vgs: number, vds: number): number {
  if (vds < 0) return -mosCurrent(p, vgs - vds, -vds);
  const leak = 1e-9 * vds;
  const vov = vgs - p.vth;
  if (vov <= 0) return leak;
  const clm = 1 + p.lambda * vds;
  return (vds < vov ? p.k * (2 * vov * vds - vds * vds) : p.k * vov * vov) * clm + leak;
}

export function mosRegion(p: MosPart, vgs: number, vds: number): 'cutoff' | 'triode' | 'saturation' {
  const vov = vgs - p.vth;
  if (vov <= 0) return 'cutoff';
  return Math.abs(vds) < vov ? 'triode' : 'saturation';
}

/** Root of a decreasing function on [lo, hi]. */
export function bisect(f: (x: number) => number, lo: number, hi: number, iters = 70): number {
  if (f(lo) <= 0) return lo;
  if (f(hi) >= 0) return hi;
  for (let i = 0; i < iters; i++) {
    const m = (lo + hi) / 2;
    if (f(m) > 0) lo = m; else hi = m;
  }
  return (lo + hi) / 2;
}

/** Damped Newton–Raphson with numerical Jacobian (small systems). */
export function newton(F: (x: number[]) => number[], x0: number[], maxStep = 0.1, iters = 400): number[] {
  const x = [...x0];
  const n = x.length;
  for (let it = 0; it < iters; it++) {
    const f = F(x);
    if (Math.max(...f.map(Math.abs)) < 1e-12) break;
    const J: number[][] = [];
    for (let j = 0; j < n; j++) {
      const xh = [...x]; xh[j] = (xh[j] ?? 0) + 1e-7;
      const fh = F(xh);
      for (let i = 0; i < n; i++) { (J[i] ??= [])[j] = ((fh[i] ?? 0) - (f[i] ?? 0)) / 1e-7; }
    }
    const dx = solveLinear(J, f.map(v => -v));
    for (let i = 0; i < n; i++) x[i] = (x[i] ?? 0) + Math.max(-maxStep, Math.min(maxStep, dx[i] ?? 0));
  }
  return x;
}

function solveLinear(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i] ?? 0]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r]![c]!) > Math.abs(M[piv]![c]!)) piv = r;
    [M[c], M[piv]] = [M[piv]!, M[c]!];
    const d = M[c]![c] || 1e-30;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const fac = M[r]![c]! / d;
      for (let k = c; k <= n; k++) M[r]![k]! -= fac * M[c]![k]!;
    }
  }
  return M.map((row, i) => row[n]! / (row[i] || 1e-30));
}

// ---------- Templates ----------

export type TemplateId = 'bjt-switch' | 'ce-amp' | 'mos-switch' | 'cmos-not' | 'cmos-nand' | 'cmos-nor';
export type ParamSpec = { key: string; label: string; min: number; max: number; step: number; unit: 'V' | 'Ω'; value: number };
export type TemplateSpec = { id: TemplateId; name: string; short: string; family: 'bjt' | 'mos' | 'cmos'; defaultPart: string; defaultPartP?: string; params: ParamSpec[]; idea: string };

export const TEMPLATES: Record<TemplateId, TemplateSpec> = {
  'bjt-switch': { id: 'bjt-switch', name: 'BJT switch', short: 'SW', family: 'bjt', defaultPart: '2n3904', idea: 'A small base current lets a much larger collector current flow through the load. Push the base hard enough and the transistor saturates: it behaves like a closed switch.', params: [
    { key: 'vcc', label: 'Supply Vcc', min: 1, max: 15, step: 0.1, unit: 'V', value: 9 },
    { key: 'vin', label: 'Input voltage', min: 0, max: 15, step: 0.05, unit: 'V', value: 5 },
    { key: 'rb', label: 'Base resistor RB', min: 1000, max: 100000, step: 500, unit: 'Ω', value: 10000 },
    { key: 'rc', label: 'Load resistor RC', min: 100, max: 4700, step: 10, unit: 'Ω', value: 470 },
  ] },
  'ce-amp': { id: 'ce-amp', name: 'Common-emitter amplifier', short: 'AMP', family: 'bjt', defaultPart: '2n3904', idea: 'A voltage divider fixes the base, the emitter resistor stabilises the current, and the collector sits near mid-supply so a small input swing becomes a larger, inverted output swing.', params: [
    { key: 'vcc', label: 'Supply Vcc', min: 5, max: 15, step: 0.1, unit: 'V', value: 12 },
    { key: 'r1', label: 'Upper bias R1', min: 10000, max: 100000, step: 1000, unit: 'Ω', value: 47000 },
    { key: 'r2', label: 'Lower bias R2', min: 2000, max: 47000, step: 500, unit: 'Ω', value: 10000 },
    { key: 'rc', label: 'Collector RC', min: 1000, max: 10000, step: 100, unit: 'Ω', value: 4700 },
    { key: 're', label: 'Emitter RE', min: 100, max: 4700, step: 50, unit: 'Ω', value: 1000 },
  ] },
  'mos-switch': { id: 'mos-switch', name: 'MOSFET switch', short: 'FET', family: 'mos', defaultPart: '2n7000', idea: 'No gate current at all: the gate voltage alone opens the channel. Below the threshold it is off; well above it the channel acts like a small resistor.', params: [
    { key: 'vdd', label: 'Supply Vdd', min: 1, max: 15, step: 0.1, unit: 'V', value: 12 },
    { key: 'vg', label: 'Gate voltage', min: 0, max: 15, step: 0.05, unit: 'V', value: 5 },
    { key: 'rd', label: 'Load resistor RD', min: 10, max: 1000, step: 5, unit: 'Ω', value: 100 },
  ] },
  'cmos-not': { id: 'cmos-not', name: 'CMOS inverter (NOT)', short: 'NOT', family: 'cmos', defaultPart: 'cmos-n', defaultPartP: 'cmos-p', idea: 'One PMOS pulls the output up, one NMOS pulls it down. Only one is on at a time, so almost no current flows except during the switch-over.', params: [
    { key: 'vdd', label: 'Supply Vdd', min: 3, max: 15, step: 0.1, unit: 'V', value: 5 },
    { key: 'va', label: 'Input A', min: 0, max: 15, step: 0.05, unit: 'V', value: 0 },
  ] },
  'cmos-nand': { id: 'cmos-nand', name: 'CMOS NAND', short: 'NAND', family: 'cmos', defaultPart: 'cmos-n', defaultPartP: 'cmos-p', idea: 'Two PMOS in parallel pull up if either input is low; two NMOS in series pull down only when both inputs are high.', params: [
    { key: 'vdd', label: 'Supply Vdd', min: 3, max: 15, step: 0.1, unit: 'V', value: 5 },
    { key: 'va', label: 'Input A', min: 0, max: 15, step: 0.05, unit: 'V', value: 0 },
    { key: 'vb', label: 'Input B', min: 0, max: 15, step: 0.05, unit: 'V', value: 0 },
  ] },
  'cmos-nor': { id: 'cmos-nor', name: 'CMOS NOR', short: 'NOR', family: 'cmos', defaultPart: 'cmos-n', defaultPartP: 'cmos-p', idea: 'Two PMOS in series pull up only when both inputs are low; two NMOS in parallel pull down if either input is high.', params: [
    { key: 'vdd', label: 'Supply Vdd', min: 3, max: 15, step: 0.1, unit: 'V', value: 5 },
    { key: 'va', label: 'Input A', min: 0, max: 15, step: 0.05, unit: 'V', value: 0 },
    { key: 'vb', label: 'Input B', min: 0, max: 15, step: 0.05, unit: 'V', value: 0 },
  ] },
};
export const TEMPLATE_ORDER: TemplateId[] = ['bjt-switch', 'ce-amp', 'mos-switch', 'cmos-not', 'cmos-nand', 'cmos-nor'];

export function defaultParams(id: TemplateId): Record<string, number> {
  return Object.fromEntries(TEMPLATES[id].params.map(p => [p.key, p.value]));
}

export type DeviceReading = { label: string; part: string; kind: 'npn' | 'pnp' | 'nmos' | 'pmos'; controlName: string; control: number; acrossName: string; across: number; current: number; region: string; on: boolean };
export type Curve = { title: string; xLabel: string; yLabel: string; series: { label: string; points: [number, number][]; dashed?: boolean }[]; marker: [number, number] };
export type BuildResult = { nodes: Record<string, number>; devices: DeviceReading[]; outputs: { label: string; value: string }[]; curve: Curve; warnings: string[]; flipped: boolean };

export type BuildSetup = { template: TemplateId; partId: string; partPId?: string | undefined; params: Record<string, number> };

const val = (p: Record<string, number>, k: string) => p[k] ?? 0;
export function fmtV(v: number) { return `${v.toFixed(2)} V`; }
export function fmtI(i: number) {
  const a = Math.abs(i);
  if (a >= 0.1) return `${(i * 1000).toFixed(0)} mA`;
  if (a >= 1e-3) return `${(i * 1000).toFixed(2)} mA`;
  if (a >= 1e-6) return `${(i * 1e6).toFixed(1)} µA`;
  return `${(i * 1e9).toFixed(1)} nA`;
}
export function fmtR(r: number) { return r >= 1000 ? `${(r / 1000).toFixed(r >= 10000 ? 0 : 1)} kΩ` : `${r.toFixed(0)} Ω`; }

/** BJT switch in "n-coordinates" (voltages measured from the emitter rail). */
function switchCore(p: BjtPart, vcc: number, vin: number, rb: number, rc: number) {
  let vb = 0;
  const vbFor = (vc: number) => bisect(b => (vin - b) / rb - bjtCurrents(p, b, b - vc).ib, Math.min(0, vin), Math.max(vin, 0.01));
  const vc = bisect(c => { vb = vbFor(c); return (vcc - c) / rc - bjtCurrents(p, vb, vb - c).ic; }, 0, vcc);
  vb = vbFor(vc);
  return { vb, vc, ...bjtCurrents(p, vb, vb - vc) };
}

function ampCore(p: BjtPart, vcc: number, r1: number, r2: number, rc: number, re: number) {
  const vth = vcc * r2 / (r1 + r2);
  const ve0 = Math.max(0, vth - 0.65);
  const x0 = [vth, Math.max(ve0, vcc - rc * ve0 / re), ve0];
  const F = ([vb = 0, vc = 0, ve = 0]: number[]) => {
    const { ib, ic, ie } = bjtCurrents(p, vb - ve, vb - vc);
    return [(vcc - vb) / r1 - vb / r2 - ib, (vcc - vc) / rc - ic, ie - ve / re].map(v => v * 1e3);
  };
  const [vb = 0, vc = 0, ve = 0] = newton(F, x0);
  return { vb, vc, ve, ...bjtCurrents(p, vb - ve, vb - vc) };
}

/** Pull-up / pull-down network currents for CMOS gates (NMOS-convention helpers). */
function seriesN(n: MosPart, gTop: number, gBot: number, vTop: number) {
  const x = bisect(m => mosCurrent(n, gTop - m, vTop - m) - mosCurrent(n, gBot, m), 0, Math.max(vTop, 0));
  return { i: mosCurrent(n, gBot, x), x };
}
function cmosCore(t: TemplateId, n: MosPart, pp: MosPart, vdd: number, va: number, vb: number) {
  let mid = 0;
  const up = (vo: number) => {
    if (t === 'cmos-not') return mosCurrent(pp, vdd - va, vdd - vo);
    if (t === 'cmos-nand') return mosCurrent(pp, vdd - va, vdd - vo) + mosCurrent(pp, vdd - vb, vdd - vo);
    // NOR: series PMOS, mirrored coordinates u = vdd - v
    const s = seriesN(pp, vdd - vb, vdd - va, vdd - vo); // P1 (gate A) sits at the rail
    mid = vdd - s.x; return s.i;
  };
  const down = (vo: number) => {
    if (t === 'cmos-not') return mosCurrent(n, va, vo);
    if (t === 'cmos-nor') return mosCurrent(n, va, vo) + mosCurrent(n, vb, vo);
    const s = seriesN(n, va, vb, vo); mid = s.x; return s.i;
  };
  const vo = bisect(v => up(v) - down(v), 0, vdd);
  const i = down(vo); up(vo); // refresh mid for the series network
  if (t === 'cmos-nand') down(vo);
  return { vo, i, mid };
}

export function solveTemplate(s: BuildSetup): BuildResult {
  const P = s.params;
  const part = getPart(s.partId);
  const warnings: string[] = [];
  const t = s.template;

  if (t === 'bjt-switch') {
    if (part.family !== 'bjt') throw new Error('BJT template needs a BJT');
    const vcc = val(P, 'vcc'), vin = Math.min(val(P, 'vin'), 15), rb = val(P, 'rb'), rc = val(P, 'rc');
    const flip = part.polarity === 'p';
    const m = (v: number) => (flip ? vcc - v : v); // map n-coordinates <-> real volts
    const r = switchCore(part, vcc, m(vin), rb, rc);
    const region = bjtRegion(r.vb, r.vb - r.vc);
    const vout = m(r.vc);
    const pts: [number, number][] = [];
    for (let k = 0; k <= 50; k++) { const x = (15 * k) / 50; pts.push([x, m(switchCore(part, vcc, m(x), rb, rc).vc)]); }
    if (r.ic > part.icMax) warnings.push(`${part.name} is rated for ${fmtI(part.icMax)}; this load draws ${fmtI(r.ic)}.`);
    if (vcc > part.vceMax) warnings.push(`Supply exceeds the ${part.vceMax} V rating.`);
    return {
      flipped: flip,
      nodes: { vin, vb: m(r.vb), vc: vout, vcc },
      devices: [{ label: 'Q1', part: part.name, kind: flip ? 'pnp' : 'npn', controlName: flip ? 'V_EB' : 'V_BE', control: r.vb, acrossName: flip ? 'V_EC' : 'V_CE', across: r.vc, current: r.ic, region, on: region !== 'cutoff' }],
      outputs: [
        { label: 'Base current', value: fmtI(r.ib) },
        { label: 'Load current', value: fmtI(r.ic) },
        { label: 'Current gain I꜀/Iᵦ', value: r.ib > 1e-9 ? (r.ic / r.ib).toFixed(0) : '—' },
        { label: 'Load power', value: `${(r.ic * r.ic * rc * 1000).toFixed(1)} mW` },
      ],
      curve: { title: 'Input voltage → collector voltage', xLabel: 'Vin (V)', yLabel: 'Vout (V)', series: [{ label: 'Transfer', points: pts }], marker: [vin, vout] },
      warnings,
    };
  }

  if (t === 'ce-amp') {
    if (part.family !== 'bjt') throw new Error('BJT template needs a BJT');
    const vcc = val(P, 'vcc'), r1 = val(P, 'r1'), r2 = val(P, 'r2'), rc = val(P, 'rc'), re = val(P, 're');
    const flip = part.polarity === 'p';
    const m = (v: number) => (flip ? vcc - v : v);
    // For PNP, R1 connects the base to ground and R2 to the supply (mirror of the NPN divider).
    const r = ampCore(part, vcc, r1, r2, rc, re);
    const vbe = r.vb - r.ve, vce = r.vc - r.ve;
    const region = bjtRegion(vbe, r.vb - r.vc);
    const gm = r.ic / VT, ro = (part.va + vce) / Math.max(r.ic, 1e-12);
    const rcp = rc * ro / (rc + ro);
    const gain = -gm * rcp / (1 + gm * re);
    const swing = Math.min(vce - 0.2, r.ic * rc);
    // Output characteristics I_C(V_CE) at five base currents around the Q point
    const series: Curve['series'] = [];
    for (const f of [0.5, 1, 1.5, 2]) {
      const ibT = r.ib * f;
      const pts: [number, number][] = [];
      for (let k = 0; k <= 40; k++) {
        const x = (vcc * k) / 40;
        const be = bisect(b => ibT - bjtCurrents(part, b, b - x).ib, 0, 1.2);
        pts.push([x, bjtCurrents(part, be, be - x).ic * 1000]);
      }
      series.push({ label: `Iᵦ = ${fmtI(ibT)}`, points: pts });
    }
    series.push({ label: 'Load line', dashed: true, points: [[0, (vcc / (rc + re)) * 1000], [vcc, 0]] });
    if (region !== 'active') warnings.push(`The transistor is in ${region}, not the active region — it cannot amplify. Adjust R1/R2.`);
    return {
      flipped: flip,
      nodes: { vcc, vb: m(r.vb), vc: m(r.vc), ve: m(r.ve) },
      devices: [{ label: 'Q1', part: part.name, kind: flip ? 'pnp' : 'npn', controlName: flip ? 'V_EB' : 'V_BE', control: vbe, acrossName: flip ? 'V_EC' : 'V_CE', across: vce, current: r.ic, region, on: region !== 'cutoff' }],
      outputs: [
        { label: 'Quiescent I꜀', value: fmtI(r.ic) },
        { label: 'Voltage gain', value: `${gain.toFixed(1)}×` },
        { label: 'Max output swing', value: `±${Math.max(0, swing).toFixed(2)} V` },
        { label: 'β at this point', value: (r.ic / Math.max(r.ib, 1e-15)).toFixed(0) },
      ],
      curve: { title: 'Output characteristics and load line', xLabel: 'V_CE (V)', yLabel: 'I_C (mA)', series, marker: [vce, r.ic * 1000] },
      warnings,
    };
  }

  if (t === 'mos-switch') {
    if (part.family !== 'mos') throw new Error('MOSFET template needs a MOSFET');
    const vdd = val(P, 'vdd'), vg = Math.min(val(P, 'vg'), 15), rd = val(P, 'rd');
    const flip = part.polarity === 'p';
    const m = (v: number) => (flip ? vdd - v : v);
    const solve = (g: number) => { const vd = bisect(d => (vdd - d) / rd - mosCurrent(part, g, d), 0, vdd); return { vd, id: mosCurrent(part, g, vd) }; };
    const r = solve(m(vg));
    const region = mosRegion(part, m(vg), r.vd);
    const pts: [number, number][] = [];
    for (let k = 0; k <= 60; k++) { const x = (15 * k) / 60; pts.push([x, solve(m(x)).id * 1000]); }
    if (r.id > part.idMax) warnings.push(`${part.name} is rated for ${fmtI(part.idMax)} continuous; this load draws ${fmtI(r.id)}.`);
    const ron = r.id > 1e-6 ? r.vd / r.id : Infinity;
    return {
      flipped: flip,
      nodes: { vdd, vg, vd: m(r.vd) },
      devices: [{ label: 'M1', part: part.name, kind: flip ? 'pmos' : 'nmos', controlName: flip ? 'V_SG' : 'V_GS', control: m(vg), acrossName: flip ? 'V_SD' : 'V_DS', across: r.vd, current: r.id, region, on: region !== 'cutoff' }],
      outputs: [
        { label: 'Load current', value: fmtI(r.id) },
        { label: 'Gate current', value: '0 A' },
        { label: 'Channel resistance', value: Number.isFinite(ron) && ron < 1e6 ? fmtR(ron) : 'open' },
        { label: 'Threshold', value: `${flip ? '−' : ''}${part.vth.toFixed(1)} V` },
      ],
      curve: { title: 'Gate voltage → drain current', xLabel: 'Vg (V)', yLabel: 'I_D (mA)', series: [{ label: 'Transfer', points: pts }], marker: [vg, r.id * 1000] },
      warnings,
    };
  }

  // CMOS gates
  const pp = getPart(s.partPId ?? 'cmos-p');
  if (part.family !== 'mos' || part.polarity !== 'n' || pp.family !== 'mos' || pp.polarity !== 'p') throw new Error('CMOS templates need an NMOS and a PMOS');
  const vdd = val(P, 'vdd');
  const va = Math.min(val(P, 'va'), vdd), vb = Math.min(val(P, 'vb'), vdd);
  const r = cmosCore(t, part, pp, vdd, va, vb);
  const pts: [number, number][] = [];
  for (let k = 0; k <= 50; k++) { const x = (vdd * k) / 50; pts.push([x, cmosCore(t, part, pp, vdd, x, vb).vo]); }
  const nRead = (label: string, g: number, s0: number, d: number): DeviceReading => {
    const region = mosRegion(part, g - s0, d - s0);
    return { label, part: part.name, kind: 'nmos', controlName: 'V_GS', control: g - s0, acrossName: 'V_DS', across: d - s0, current: mosCurrent(part, g - s0, d - s0), region, on: region !== 'cutoff' };
  };
  const pRead = (label: string, g: number, s0: number, d: number): DeviceReading => {
    const region = mosRegion(pp, s0 - g, s0 - d);
    return { label, part: pp.name, kind: 'pmos', controlName: 'V_SG', control: s0 - g, acrossName: 'V_SD', across: s0 - d, current: mosCurrent(pp, s0 - g, s0 - d), region, on: region !== 'cutoff' };
  };
  const vo = r.vo;
  const devices = t === 'cmos-not' ? [pRead('P1', va, vdd, vo), nRead('N1', va, 0, vo)]
    : t === 'cmos-nand' ? [pRead('P1 (A)', va, vdd, vo), pRead('P2 (B)', vb, vdd, vo), nRead('N1 (A)', va, r.mid, vo), nRead('N2 (B)', vb, 0, r.mid)]
    : [pRead('P1 (A)', va, vdd, r.mid), pRead('P2 (B)', vb, r.mid, vo), nRead('N1 (A)', va, 0, vo), nRead('N2 (B)', vb, 0, vo)];
  const logic = vo > vdd * 0.7 ? '1' : vo < vdd * 0.3 ? '0' : 'undefined';
  if (logic === 'undefined') warnings.push('The output is between valid logic levels — both networks conduct and the gate draws current from the supply.');
  return {
    flipped: false,
    nodes: { vdd, va, vb, vo, mid: r.mid },
    devices,
    outputs: [
      { label: 'Output', value: fmtV(vo) },
      { label: 'Logic level', value: logic },
      { label: 'Supply current', value: fmtI(r.i) },
      { label: 'Power', value: `${(r.i * vdd * 1e6).toFixed(r.i * vdd > 1e-4 ? 0 : 2)} µW` },
    ],
    curve: { title: t === 'cmos-not' ? 'Input → output (switching threshold)' : `Input A → output (B fixed at ${vb.toFixed(1)} V)`, xLabel: 'Va (V)', yLabel: 'Vout (V)', series: [{ label: 'Transfer', points: pts }], marker: [va, vo] },
    warnings,
  };
}

/** Which builder template shows the transistor-level form of each logic gate. */
export function templateForGate(g: string): TemplateId {
  if (g === 'not') return 'cmos-not';
  if (g === 'nor' || g === 'or') return 'cmos-nor';
  return 'cmos-nand';
}
