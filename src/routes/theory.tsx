import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site-header';

export const Route = createFileRoute('/theory')({
  head: () => ({ meta: [
    { title: 'Theory — Circuit Playground' },
    { name: 'description', content: 'Plain explanations of Ohm\'s law, Kirchhoff\'s current and voltage laws, and how capacitors and inductors store energy.' },
    { property: 'og:title', content: 'Circuit theory — Circuit Playground' },
    { property: 'og:description', content: 'The few rules behind every circuit lab: Ohm, Kirchhoff, and energy in electric and magnetic fields.' },
    { property: 'og:type', content: 'article' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Theory,
});

type LabPath = '/resistors' | '/capacitors' | '/inductors';
function Topic({ id, n, title, formula, lab, labName, children, example }: { id: string; n: string; title: string; formula: string; lab: LabPath; labName: string; children: ReactNode; example: ReactNode }) {
  return <section id={id} className="scroll-mt-24 rounded-lg border border-border bg-card p-6 sm:p-8" style={{ boxShadow: 'var(--shadow)' }}>
    <div className="font-mono text-xs text-primary">{n}</div>
    <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
    <div className="my-5 rounded-md bg-secondary px-5 py-4 text-center font-mono text-xl">{formula}</div>
    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    <div className="mt-5 rounded-md border border-border p-4 text-sm"><div className="eyebrow mb-2 text-muted-foreground">WORKED EXAMPLE</div>{example}</div>
    <Link to={lab} className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">Try it in the {labName} <ArrowRight size={15} /></Link>
  </section>;
}

const contents = [['ohm', "Ohm's law"], ['kcl', "Kirchhoff's current law"], ['kvl', "Kirchhoff's voltage law"], ['capacitor-energy', 'Energy in a capacitor'], ['inductor-energy', 'Energy in an inductor']] as const;

function Theory() {
  return <>
    <SiteHeader />
    <main className="shell">
      <div className="lab-heading max-w-2xl"><div className="eyebrow mb-3 text-muted-foreground">THE RULES BEHIND THE LABS</div><h1>Theory<span className="text-primary">.</span></h1><p className="mt-4 text-muted-foreground">Five ideas explain almost everything you see in the labs. Each one has a worked example using the labs' starting values, so you can check the numbers yourself.</p></div>
      <nav aria-label="Theory contents" className="mb-8 flex flex-wrap gap-2">{contents.map(([id, name]) => <a key={id} href={`#${id}`} className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium hover:text-primary">{name}</a>)}</nav>
      <div className="grid gap-6 pb-12">
        <Topic id="ohm" n="01" title="Ohm's law" formula="V = I × R" lab="/resistors" labName="resistor lab" example={<>9 V across 470 Ω gives I = 9 ÷ 470 = <b>19.1 mA</b>. The power turned into heat is P = V × I = 9 × 0.0191 = <b>172 mW</b>.</>}>
          <p>Voltage (V, in volts) is the push. Resistance (R, in ohms) is how hard the component resists. Current (I, in amperes) is how much charge flows each second.</p>
          <p>Double the voltage and the current doubles. Double the resistance and the current halves. That straight-line relationship is why a resistor's current-versus-voltage graph is a straight line.</p>
          <p>Series resistors add: R = R₁ + R₂. Parallel resistors combine as 1/R = 1/R₁ + 1/R₂, so the total is always smaller than the smallest one.</p>
        </Topic>
        <Topic id="kcl" n="02" title="Kirchhoff's current law (junction rule)" formula="Σ I in = Σ I out" lab="/resistors" labName="resistor lab" example={<>In parallel, 9 V across 470 Ω and 1 kΩ: I₁ = 19.15 mA, I₂ = 9.00 mA, so the source supplies I = 19.15 + 9.00 = <b>28.15 mA</b>.</>}>
          <p>Charge cannot pile up in a wire or vanish. So at any junction, the current flowing in equals the current flowing out.</p>
          <p>In a single loop with no junctions, this simply means the same current flows everywhere. In a transistor it is why the emitter current is the sum of the base and collector currents: Iₑ = I꜀ + Iᵦ.</p>
        </Topic>
        <Topic id="kvl" n="03" title="Kirchhoff's voltage law (loop rule)" formula="Σ V around a loop = 0" lab="/resistors" labName="resistor lab" example={<>In series, 9 V across 470 Ω + 1 kΩ: I = 6.12 mA, V₁ = 2.88 V, V₂ = 6.12 V, and 9 − 2.88 − 6.12 = <b>0 V</b>.</>}>
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
      </div>
      <footer className="footer"><span>Ideal components · simplified for learning</span><span>circuit.playground / theory</span></footer>
    </main>
  </>;
}
