import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site-header';
import { analyze, defaultCircuitSettings } from '@/lib/circuit-model';
import { resonantLength, wavelength } from '@/lib/antenna-model';
import { coilFace, defaultLenzSettings, inducedCurrent, inducedEmf } from '@/lib/lenz-model';

export const Route = createFileRoute('/theory')({
  head: () => ({ meta: [
    { title: 'Theory — Circuit Playground' },
    { name: 'description', content: 'Learn electronics foundations, then explore dedicated Circuits, Digital and Radio theory chapters with equations, diagrams and worked examples.' },
    { property: 'og:title', content: 'Circuit theory — Circuit Playground' },
    { property: 'og:description', content: 'Worked examples connect circuit laws, impedance, magnetic induction, digital logic and radio waves to interactive labs.' },
    { property: 'og:type', content: 'article' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Theory,
});

type LabPath = '/resistors' | '/capacitors' | '/inductors' | '/circuits' | '/circuits/kirchhoff' | '/circuits/lenz' | '/logic-gates' | '/antennas';
function Topic({ id, n, title, formula, lab, labName, children, example }: { id: string; n: string; title: string; formula: string; lab: LabPath; labName: string; children: ReactNode; example: ReactNode }) {
  return <section id={id} className="scroll-mt-24 border-t border-border py-8">
    <div className="font-mono text-xs text-primary">{n}</div>
    <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
    <div className="my-5 border-l-2 border-primary bg-secondary px-5 py-4 font-mono text-base sm:text-xl break-words">{formula}</div>
    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    <div className="mt-5 rounded-md border border-border p-4 text-sm"><div className="eyebrow mb-2 text-muted-foreground">WORKED EXAMPLE</div>{example}</div>
    <Link to={lab} className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">Try it in the {labName} <ArrowRight size={15} /></Link>
  </section>;
}

const contents = [['ohm', "Ohm's law"], ['kcl', "Kirchhoff's current law"], ['kvl', "Kirchhoff's voltage law"], ['capacitor-energy', 'Energy in a capacitor'], ['inductor-energy', 'Energy in an inductor'], ['impedance', 'Impedance & phase'], ['lenz', 'Lenz’s law'], ['digital-logic', 'Digital logic'], ['electromagnetic-waves', 'Electromagnetic waves']] as const;

function Theory() {
  const ac = analyze(defaultCircuitSettings);
  const lambda = wavelength(100);
  return <>
    <SiteHeader />
    <main className="shell">
      <div className="lab-heading max-w-2xl"><div className="eyebrow mb-3 text-muted-foreground">THE RULES BEHIND THE LABS</div><h1>Theory<span className="text-primary">.</span></h1><p className="mt-4 text-muted-foreground">From charge flowing through a resistor to information carried by radio waves.</p></div>
      <nav aria-label="Theory chapters" className="mb-8 grid gap-6 border-y border-border py-6 sm:grid-cols-3">
        <Link to="/theory/circuits" className="group"><h2 className="text-lg font-semibold text-primary">Circuits <ArrowRight size={16} className="inline" /></h2><p className="mt-2 text-sm text-muted-foreground">Kirchhoff, complex impedance, phasors, RMS power and resonance.</p></Link>
        <Link to="/theory/digital" className="group"><h2 className="text-lg font-semibold text-primary">Digital <ArrowRight size={16} className="inline" /></h2><p className="mt-2 text-sm text-muted-foreground">Boolean algebra, truth tables, CMOS, memory and binary addition.</p></Link>
        <Link to="/theory/radio" className="group"><h2 className="text-lg font-semibold text-primary">Radio <ArrowRight size={16} className="inline" /></h2><p className="mt-2 text-sm text-muted-foreground">Waves, AM/FM, tuning, mixing, detectors and transmitter power.</p></Link>
      </nav>
      <nav aria-label="Theory contents" className="mb-8 flex flex-wrap gap-2">{contents.map(([id, name]) => <a key={id} href={`#${id}`} className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium hover:text-primary">{name}</a>)}</nav>
      <div className="max-w-4xl pb-12">
        <Topic id="ohm" n="01" title="Ohm's law" formula="V = I × R" lab="/resistors" labName="resistor lab" example={<>9 V across 470 Ω gives I = 9 ÷ 470 = <b>19.1 mA</b>. The power turned into heat is P = V × I = 9 × 0.0191 = <b>172 mW</b>.</>}>
          <p>Voltage (V, in volts) is the push. Resistance (R, in ohms) is how hard the component resists. Current (I, in amperes) is how much charge flows each second.</p>
          <p>Double the voltage and the current doubles. Double the resistance and the current halves. That straight-line relationship is why a resistor's current-versus-voltage graph is a straight line.</p>
          <p>Series resistors add: R = R₁ + R₂. Parallel resistors combine as 1/R = 1/R₁ + 1/R₂, so the total is always smaller than the smallest one.</p>
        </Topic>
        <Topic id="kcl" n="02" title="Kirchhoff's current law (junction rule)" formula="Σ I in = Σ I out" lab="/circuits/kirchhoff" labName="Kirchhoff lab" example={<>In parallel, 9 V across 470 Ω and 1 kΩ: I₁ = 19.15 mA, I₂ = 9.00 mA, so the source supplies I = 19.15 + 9.00 = <b>28.15 mA</b>.</>}>
          <p>Charge cannot pile up in a wire or vanish. So at any junction, the current flowing in equals the current flowing out.</p>
          <p>In a single loop with no junctions, this simply means the same current flows everywhere. In a transistor it is why the emitter current is the sum of the base and collector currents: Iₑ = I꜀ + Iᵦ.</p>
        </Topic>
        <Topic id="kvl" n="03" title="Kirchhoff's voltage law (loop rule)" formula="Σ V around a loop = 0" lab="/circuits/kirchhoff" labName="Kirchhoff lab" example={<>In series, 9 V across 470 Ω + 1 kΩ: I = 6.12 mA, V₁ = 2.88 V, V₂ = 6.12 V, and 9 − 2.88 − 6.12 = <b>0 V</b>.</>}>
          <p>Voltage is energy per unit of charge. Walk once around any closed loop and you must arrive back at the same energy level, so the voltage rises (sources) and drops (components) add up to zero.</p>
          <p>In parallel, each branch forms its own loop, so each branch gets the full source voltage. The rule works for capacitors and inductors too, using their voltage at each moment.</p>
        </Topic>
        <Topic id="capacitor-energy" n="04" title="How a capacitor stores energy" formula="E = ½ · C · V²" lab="/capacitors" labName="capacitor lab" example={<>1000 µF charged to 5 V: Q = C × V = <b>5000 µC</b>, and E = ½ × 0.001 × 5² = <b>12.5 mJ</b>.</>}>
          <p>Current moves charge onto one plate and off the other. The opposite charges create an <b>electric field</b> across the insulator between the plates, and the energy lives in that field.</p>
          <p>Capacitor voltage cannot jump: it takes time to move the charge. Through a resistor, the time scale is τ = R × C. After one τ the voltage has made 63% of its change; after about five, it is essentially finished. Once charged, a capacitor blocks steady DC.</p>
        </Topic>
        <Topic id="inductor-energy" n="05" title="How an inductor stores energy" formula="E = ½ · L · I²" lab="/inductors" labName="inductor lab" example={<>10 H carrying 300 mA (6 V through 20 Ω, once steady): E = ½ × 10 × 0.3² = <b>450 mJ</b>. The time constant is τ = L ÷ R = <b>0.5 s</b>.</>}>
          <p>Current through a coil creates a <b>magnetic field</b>, and the energy lives in that field. Changing the field takes energy, so the coil produces a voltage that opposes any change in current: V = L × ΔI/Δt.</p>
          <p>Inductor current cannot jump. Switched on, the current rises gradually; switched off, the collapsing field keeps it flowing for a while. Connect a coil to a capacitor and the energy swaps back and forth between the two fields, ringing at f₀ = 1 ÷ (2π√LC).</p>
        </Topic>
        <Topic id="impedance" n="06" title="Impedance and phase" formula="Z = R + j(XL − XC); |Z| = √[R² + (XL − XC)²]" lab="/circuits" labName="combined R/L/C lab" example={<>At the lab’s starting values (6 V peak, 1.6 Hz, 20 Ω, 10 H, 1000 µF), Xₗ = <b>{ac.xL.toFixed(2)} Ω</b> and X꜀ = <b>{ac.xC.toFixed(2)} Ω</b>. They nearly cancel: |Z| = <b>{ac.impedance.toFixed(2)} Ω</b>, peak current = <b>{ac.peakCurrent.toFixed(1)} mA</b>, and current {ac.phase < 0 ? 'lags' : 'leads'} the source by <b>{Math.abs(ac.phase).toFixed(2)}°</b>.</>}>
          <p>Resistance dissipates energy as heat. Reactance stores energy and returns it later. Impedance combines both, describing not only how much a circuit resists AC, but also the timing between voltage and current. The symbol j represents a quarter-turn in that timing, not an extra resistor.</p>
          <p>Inductive reactance Xₗ = 2πfL grows with frequency. Capacitive reactance X꜀ = 1/(2πfC) shrinks with frequency. In a series circuit, subtract the two reactances before combining them with resistance.</p>
          <p>For an ideal resistor, voltage and current peak together. In an ideal coil, current lags voltage by 90°; in an ideal capacitor, it leads by 90°. For series RLC, the impedance angle is θ = atan2(Xₗ − X꜀, R); current’s phase relative to the source is −θ.</p>
          <p>At resonance, f₀ = 1/(2π√LC), the reactances cancel and |Z| = R. Coil and capacitor voltages may each exceed the source voltage because they oppose each other. Power factor is R/|Z|: average power is Vᵣₘₛ × Iᵣₘₛ × power factor. RMS values are peak values divided by √2 for sine waves.</p>
          <p><Link to="/circuits/resonance" className="text-primary hover:underline">Explore resonance →</Link></p>
        </Topic>
        <Topic id="lenz" n="07" title="Lenz’s law and self-induction" formula="ε = −N · dΦ/dt" lab="/circuits/lenz" labName="magnet-and-coil lab" example={<>In the lab’s normalized model, a north pole at distance 2 coil radii approaching at 1 radius/s gives ε = <b>{inducedEmf(defaultLenzSettings, 2, 1).toFixed(2)} teaching units</b>. With resistance 10, current is <b>{(inducedCurrent(defaultLenzSettings, 2, 1) * 1000).toFixed(0)} mU</b>; the coil’s near face becomes <b>{coilFace(defaultLenzSettings, 1)}</b> and repels the approaching magnet. Twice the speed gives twice the current at the same distance.</>}>
          <p>Magnetic flux Φ measures the magnetic field passing through a loop. Faraday’s law says changing that flux produces an induced voltage ε. N is the number of coil turns; dΦ/dt is the rate of change of flux per turn. The minus sign is Lenz’s law: the induced current creates a field opposing the <b>change</b> in flux.</p>
          <p>A north pole approaching a closed coil increases the flux: the coil presents a north pole and repels it. Pull the magnet away and the coil becomes south, attracting it to resist the decrease. Reverse the magnet’s pole and the current reverses. A stationary magnet produces no induced current in this resistive teaching model.</p>
          <p>The coil does not simply oppose the external field: on retreat it reinforces that field to slow its decrease. Work done moving the magnet supplies the electrical energy, ultimately dissipated as heat. An open coil can develop a voltage, but has no closed path for sustained current.</p>
          <p>Self-induction is the same law applied to a coil’s own current: its induced EMF is −L · dI/dt. With the passive voltage convention the terminal voltage drop is vₗ = L · dI/dt. This is why switching off an inductor can create a large voltage unless its current has a safe path.</p>
          <p><Link to="/inductors" className="text-primary hover:underline">See RL switching and the Lenz experiment inside Inductors →</Link></p>
        </Topic>
        <Topic id="digital-logic" n="08" title="Digital logic, memory and addition" formula="AND: A ∧ B · OR: A ∨ B · XOR: A ⊕ B" lab="/logic-gates" labName="logic gates lab" example={<>A half adder takes A = 1, B = 1: XOR gives sum = <b>0</b>, AND gives carry = <b>1</b>. The result is binary <b>10</b>, which is decimal 2. A full adder also accepts an incoming carry; connecting four full adders makes a 4-bit ripple-carry adder.</>}>
          <p>Bits represent two voltage ranges: 0 is low and 1 is high, not necessarily exactly 0 V and 1 V. A truth table lists the output for every possible input combination. Real chips specify voltage thresholds and take a small time to respond; the labs use ideal logic levels.</p>
          <p>AND is 1 only when both inputs are 1. OR is 1 when either or both are 1. XOR is 1 when the inputs differ. NOT reverses a bit; NAND, NOR and XNOR invert AND, OR and XOR respectively. NAND and NOR are universal: either type alone can build every Boolean function.</p>
          <p>In CMOS, PMOS transistors connect the output toward the supply and NMOS transistors connect it toward ground. A NAND uses parallel PMOS and series NMOS; a NOR reverses those arrangements. A following inverter turns NAND into AND and NOR into OR.</p>
          <p>A combinational gate depends only on present inputs. Feedback adds memory: cross-coupled NAND gates form an SR latch with active-low S̄ and R̄. S̄ = 0 sets Q; R̄ = 0 resets Q; both 1 hold it. Both 0 force both outputs high, violating their normal complement relationship; simultaneous release has an unpredictable real-world result.</p>
          <p>Edge-triggered D, JK and T flip-flops update on a clock transition: D copies its input, JK can set/reset/hold/toggle, and T toggles when enabled. A latch is level-sensitive, not edge-triggered.</p>
          <p><Link to="/flip-flops" className="text-primary hover:underline">Explore stored state →</Link><span className="mx-3">·</span><Link to="/adders" className="text-primary hover:underline">Explore addition and carry →</Link></p>
        </Topic>
        <Topic id="electromagnetic-waves" n="09" title="Electromagnetic waves and antennas" formula="c = f · λ" lab="/antennas" labName="antennas lab" example={<>At 100 MHz, λ = 299,792,458 ÷ 100,000,000 = <b>{lambda.toFixed(2)} m</b>. An ideal half-wave dipole is { (lambda / 2).toFixed(2)} m end-to-end; the lab uses 0.48λ = <b>{resonantLength('dipole', 100).toFixed(2)} m</b> as a typical shortened resonant length. Each arm is half that length.</>}>
          <p>Accelerating charges can radiate energy. An alternating antenna current creates changing electric and magnetic fields; far from the antenna, these form a traveling wave. The electric field, magnetic field and direction of travel are mutually perpendicular. In vacuum the speed is c = 299,792,458 m/s; wavelength λ is the distance traveled in one cycle at frequency f.</p>
          <p>During transmission a source drives charge back and forth in the conductors. During reception the incoming wave’s electric field pushes charges along the antenna, generating a small alternating voltage; a loop responds to changing magnetic flux. A receiver selects a frequency and recovers the information carried by changes in amplitude, frequency or phase.</p>
          <p>Antenna length matters because currents and voltages form standing-wave patterns. A half-wave dipole has its largest current near the center and very little at the ends. A quarter-wave monopole uses a ground plane as its other half. Real resonant lengths depend on conductor thickness, surroundings and matching; small loops usually need a tuning capacitor.</p>
          <p>Polarization is the electric field’s orientation. A linear receiving antenna responds best when aligned with it. A dipole radiates strongest broadside and weakly along its axis; a Yagi uses passive elements to concentrate its pattern. For a passive reciprocal antenna, the same pattern describes transmission and reception. Nearby fields also store and return energy, so they are not all outgoing radiation.</p>
        </Topic>
      </div>
      <footer className="footer"><span>Ideal components · simplified for learning</span><span>circuit.playground / theory</span></footer>
    </main>
  </>;
}
