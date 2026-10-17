import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site-header';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'Circuit Playground — Interactive electronics labs' },
    { name: 'description', content: 'Learn electronics hands-on with component, circuit, digital logic and radio labs, including AM/FM modulation, receivers and transmitters.' },
    { property: 'og:title', content: 'Circuit Playground — Interactive electronics labs' },
    { property: 'og:description', content: 'Interactive electronics from resistors to radio: circuits, logic, antennas, AM/FM modulation, receivers and transmitters.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Landing,
});

type Lab = { to: string; n: string; name: string; tag: string; text: string; icon: ReactNode; soon?: boolean };

const componentLabs: Lab[] = [
  { to: '/resistors', n: '01', name: 'Resistors', tag: 'Limit the flow. Share the voltage.', text: 'Ohm\'s law, series and parallel circuits, and the color code.', icon: <polyline points="4,30 14,30 18,20 26,40 34,20 42,40 50,20 54,30 64,30" /> },
  { to: '/capacitors', n: '02', name: 'Capacitors', tag: 'Store charge. Watch it change.', text: 'Charge and discharge with DC, then watch AC make the plates swap.', icon: <path d="M4 30H28M28 14V46M36 14V46M36 30H64" /> },
  { to: '/inductors', n: '03', name: 'Inductors', tag: 'Resist change. Store a field.', text: 'RL switching, an LC tank that rings, and a magnet-and-coil Lenz experiment.', icon: <path d="M4 30H14a5 6 0 0 1 10 0a5 6 0 0 1 10 0a5 6 0 0 1 10 0a5 6 0 0 1 10 0H64" /> },
  { to: '/diodes', n: '04', name: 'Diodes', tag: 'One way only.', text: 'Rectifier, Schottky, LED and Zener diodes with their curves.', icon: <path d="M4 30H22M22 16V44L44 30Z M44 16V44M44 30H64" /> },
  { to: '/transistors', n: '05', name: 'Transistors', tag: 'Small current. Big possibilities.', text: 'NPN and PNP in six arrangements with electron and hole flow.', icon: <path d="M4 30H24M24 14V46M24 22L48 8M24 38L48 52M40 47L48 52L42 44" /> },
];

const circuitLabs: Lab[] = [
  { to: '/circuits', n: '06', name: 'Combined R/L/C', tag: 'R, L and C together.', text: 'Switch components in and out of one AC circuit and meet impedance, phase and the phasor diagram.', icon: <path d="M4 30H12a5 6 0 0 1 10 0a5 6 0 0 1 10 0H40M40 14V46M48 14V46M48 30H64" /> },
  { to: '/circuits/kirchhoff', n: '07', name: 'Kirchhoff’s laws', tag: 'Nothing is lost.', text: 'Charge splits at junctions, voltage drops add up around loops — the two rules of every circuit.', icon: <><circle cx="34" cy="30" r="3" /><path d="M4 30H31M37 30H64M34 27V8M34 33V52" /></> },
  { to: '/circuits/resonance', n: '08', name: 'Resonance', tag: 'The peak frequency.', text: 'Tune an AC source until the coil and capacitor cancel and the current peaks.', icon: <path d="M4 44C14 44 18 12 34 12C50 12 54 44 64 44" /> },
  { to: '/circuits/lenz', n: '09', name: 'Lenz’s law', tag: 'Nature pushes back.', text: 'Move a magnet toward a coil and watch the induced current always fight the motion.', icon: <><rect x="4" y="22" width="18" height="16" rx="2" /><path d="M30 30h8a5 6 0 0 1 10 0a5 6 0 0 1 10 0h6" /></> },
];

const digitalLabs: Lab[] = [
  { to: '/logic-gates', n: '10', name: 'Logic gates', tag: 'The atoms of digital.', text: 'AND, OR, NOT, NAND, NOR, XOR — flip the inputs, watch the output, read the truth table.', icon: <><path d="M4 20H16M4 40H16M16 12H34a18 18 0 0 1 0 36H16Z M52 30H64" /></> },
  { to: '/flip-flops', n: '11', name: 'Flip-flops', tag: 'Gates that remember.', text: 'Wire NAND gates back into themselves and build SR, D, JK and T memory cells.', icon: <><rect x="16" y="12" width="32" height="36" rx="2" /><path d="M4 20H16M4 40H16M48 20H64M48 40H64" /></> },
  { to: '/adders', n: '12', name: 'Adders', tag: 'Addition is just gates.', text: 'Half adder, full adder, then a 4-bit ripple-carry adder with the carry animated.', icon: <><path d="M4 18H22M4 42H22M34 8V52M22 30H46M46 18H64M46 42H64" /></> },
];

const radioLabs: Lab[] = [
  { to: '/antennas', n: '13', name: 'Antennas', tag: 'Current becomes waves.', text: 'Dipole, monopole, loop and Yagi — see how each shape radiates into space.', icon: <><path d="M34 30V52M20 30H48M34 30L20 12M34 30L48 12" /><path d="M26 6a12 12 0 0 1 16 0M22 1a18 18 0 0 1 24 0" /></> },
  { to: '/radio/modulation', n: '14', name: 'AM & FM modulation', tag: 'Put a message on a wave.', text: 'Change the audio, compare amplitude and frequency modulation, and see why overmodulation distorts sound.', icon: <path d="M4 30q5-20 10 0t10 0t10 0t10 0t10 0t10 0M4 12q30-16 60 0M4 48q30 16 60 0" /> },
  { to: '/radio/receiver', n: '15', name: 'Radio receiver', tag: 'Find the station. Recover the sound.', text: 'Tune AM or FM, trace the mixer and detector, and listen to the recovered audio from a simulated station.', icon: <><rect x="8" y="17" width="52" height="35" rx="3" /><circle cx="25" cy="35" r="10" /><path d="M42 26h10M42 34h10M42 42h10M48 17L58 4" /></> },
  { to: '/radio/transmitter', n: '16', name: 'Radio transmitter', tag: 'From sound to a carrier.', text: 'Follow a message through the oscillator, modulator, RF power amplifier and antenna matching network.', icon: <><path d="M4 30H20M20 15V45L45 30ZM45 30H60M60 30V12M51 12l9 10 9-10" /></> },
];

function LabCard({ lab }: { lab: Lab }) {
  return <Link to={lab.to} className={lab.soon ? 'lab-card-soon group' : 'lab-card group'}>
    <div className="flex items-start justify-between">
      <span className="lab-card-num">{lab.n}</span>
      <span className="icon-chip"><svg viewBox="0 0 68 60" width="32" height="28" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{lab.icon}</svg></span>
    </div>
    <h2 className="mt-4 text-2xl font-semibold">{lab.name}</h2>
    <p className="mt-1 text-sm font-medium text-primary">{lab.tag}</p>
    <p className="mt-3 text-sm text-muted-foreground">{lab.text}</p>
    {lab.soon
      ? <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">Coming soon — see the plan <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
      : <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium">Open lab <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span>}
  </Link>;
}

function Section({ title, blurb, labs }: { title: string; blurb: string; labs: Lab[] }) {
  return <section className="mb-12">
    <h2 className="section-title">{title}</h2>
    <p className="mt-1 mb-5 max-w-xl text-sm text-muted-foreground">{blurb}</p>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {labs.map(l => <LabCard key={l.to} lab={l} />)}
    </div>
  </section>;
}

function Landing() {
  return <>
    <SiteHeader />
    <main className="shell">
      <div className="lab-heading max-w-2xl"><div className="eyebrow mb-3" style={{ color: 'var(--amber)' }}>INTERACTIVE ELECTRONICS</div><h1>See how circuits think<span className="text-primary">.</span></h1><p className="mt-4 text-base text-muted-foreground">Hands-on labs that grow from the simplest resistor all the way to digital logic and radio. Change the values, watch the charge move, and read what happens.</p></div>
      <Section title="Components" blurb="The basic building blocks, each with its own animated lab." labs={componentLabs} />
      <Section title="Circuits" blurb="The components working together: impedance, phase, resonance and Lenz's law." labs={circuitLabs} />
      <Section title="Digital electronics" blurb="From logic gates to memory and arithmetic — how computers are built from switches." labs={digitalLabs} />
      <Section title="Radio" blurb="How alternating current in a wire becomes waves that cross the room — or the ocean." labs={radioLabs} />
    </main>
  </>;
}
