import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site-header';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'Circuit Playground — Interactive electronics labs' },
    { name: 'description', content: 'Learn how resistors, capacitors, inductors, diodes and transistors work through interactive, animated circuit labs.' },
    { property: 'og:title', content: 'Circuit Playground — Interactive electronics labs' },
    { property: 'og:description', content: 'Hands-on labs: components, circuits, digital electronics and radio.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Landing,
});

type Lab = { to: string; n: string; name: string; tag: string; text: string; icon: ReactNode };

const componentLabs: Lab[] = [
  { to: '/resistors', n: '01', name: 'Resistors', tag: 'Limit the flow. Share the voltage.', text: 'Ohm\'s law, series and parallel circuits, and the color code.', icon: <polyline points="4,30 14,30 18,20 26,40 34,20 42,40 50,20 54,30 64,30" /> },
  { to: '/capacitors', n: '02', name: 'Capacitors', tag: 'Store charge. Watch it change.', text: 'Charge and discharge with DC, then watch AC make the plates swap.', icon: <path d="M4 30H28M28 14V46M28 14V46M36 14V46M36 30H64" /> },
  { to: '/inductors', n: '03', name: 'Inductors', tag: 'Resist change. Store a field.', text: 'RL switching, an LC tank that rings, and RLC resonance.', icon: <path d="M4 30H14a5 6 0 0 1 10 0a5 6 0 0 1 10 0a5 6 0 0 1 10 0a5 6 0 0 1 10 0H64" /> },
  { to: '/diodes', n: '04', name: 'Diodes', tag: 'One way only.', text: 'Rectifier, Schottky, LED and Zener diodes with their curves.', icon: <path d="M4 30H22M22 16V44L44 30Z M44 16V44M44 30H64" /> },
  { to: '/transistors', n: '05', name: 'Transistors', tag: 'Small current. Big possibilities.', text: 'NPN and PNP in six arrangements with electron and hole flow.', icon: <path d="M4 30H24M24 14V46M24 22L48 8M24 38L48 52M40 47L48 52L42 44" /> },
];

const plannedSections = [
  { name: 'Circuits', text: 'Combine resistors, coils and capacitors in one AC circuit. Impedance, phase, Kirchhoff\'s laws and Lenz\'s law.' },
  { name: 'Digital electronics', text: 'Logic gates, flip-flops built from NAND gates, and a working binary adder.' },
  { name: 'Radio', text: 'How antennas launch electromagnetic waves, and why their shape matters.' },
] as const;

function LabCard({ l }: { l: Lab }) {
  return <Link to={l.to} className="lab-card group">
    <div className="flex items-start justify-between"><span className="lab-card-num">{l.n}</span><span className="icon-chip"><svg viewBox="0 0 68 60" width="32" height="28" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{l.icon}</svg></span></div>
    <h2 className="mt-4 text-2xl font-semibold">{l.name}</h2><p className="mt-1 text-sm font-medium text-primary">{l.tag}</p><p className="mt-3 text-sm text-muted-foreground">{l.text}</p>
    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium">Open lab <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
  </Link>;
}

function Landing() {
  return <>
    <SiteHeader />
    <main className="shell">
      <div className="lab-heading max-w-2xl"><div className="eyebrow mb-3" style={{ color: 'var(--amber)' }}>INTERACTIVE ELECTRONICS</div><h1>See how circuits think<span className="text-primary">.</span></h1><p className="mt-4 text-base text-muted-foreground">Hands-on labs in four parts: the basic components, the circuits they build, digital electronics, and radio. Change the values, watch the charge move, and read what happens.</p></div>

      <section aria-label="Components" className="pb-10">
        <div className="section-top"><h2 className="section-title">Components</h2><span className="text-xs text-muted-foreground">The building blocks</span></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {componentLabs.map(l => <LabCard key={l.to} l={l} />)}
        </div>
      </section>

      {plannedSections.map(s => <section key={s.name} aria-label={s.name} className="pb-10">
        <div className="section-top"><h2 className="section-title">{s.name}</h2><span className="eyebrow text-muted-foreground">COMING SOON</span></div>
        <div className="lab-card-soon"><p className="text-sm text-muted-foreground">{s.text}</p></div>
      </section>)}
    </main>
  </>;
}
