import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'Circuit Playground — Interactive electronics labs' },
    { name: 'description', content: 'Learn how resistors, capacitors, inductors, diodes and transistors work through five interactive, animated circuit labs.' },
    { property: 'og:title', content: 'Circuit Playground — Interactive electronics labs' },
    { property: 'og:description', content: 'Five hands-on labs: resistors, capacitors, inductors, diodes and transistors.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Landing,
});

const labs = [
  { to: '/resistors', n: '01', name: 'Resistors', tag: 'Limit the flow. Share the voltage.', text: 'Ohm\'s law, series and parallel circuits, and the color code.', icon: <polyline points="4,30 14,30 18,20 26,40 34,20 42,40 50,20 54,30 64,30" /> },
  { to: '/capacitors', n: '02', name: 'Capacitors', tag: 'Store charge. Watch it change.', text: 'Charge and discharge with DC, then watch AC make the plates swap.', icon: <path d="M4 30H28M28 14V46M36 14V46M36 30H64" /> },
  { to: '/inductors', n: '03', name: 'Inductors', tag: 'Resist change. Store a field.', text: 'RL switching, an LC tank that rings, and RLC resonance.', icon: <path d="M4 30H14a5 6 0 0 1 10 0a5 6 0 0 1 10 0a5 6 0 0 1 10 0a5 6 0 0 1 10 0H64" /> },
  { to: '/diodes', n: '04', name: 'Diodes', tag: 'One way only.', text: 'Rectifier, Schottky, LED and Zener diodes with their curves.', icon: <path d="M4 30H22M22 16V44L44 30Z M44 16V44M44 30H64" /> },
  { to: '/transistors', n: '05', name: 'Transistors', tag: 'Small current. Big possibilities.', text: 'NPN and PNP in six arrangements with electron and hole flow.', icon: <path d="M4 30H24M24 14V46M24 22L48 8M24 38L48 52M40 47L48 52L42 44" /> },
] as const;

function Landing() {
  return <>
    <SiteHeader />
    <main className="shell">
      <div className="lab-heading max-w-2xl"><div className="eyebrow mb-3" style={{ color: 'var(--amber)' }}>INTERACTIVE ELECTRONICS</div><h1>See how circuits think<span className="text-primary">.</span></h1><p className="mt-4 text-base text-muted-foreground">Five hands-on labs. Change the values, watch the charge move, and read what happens — from the simplest resistor to the transistor.</p></div>
      <div className="grid gap-4 pb-12 sm:grid-cols-2">
        {labs.map(l => <Link key={l.to} to={l.to} className="lab-card group">
          <div className="flex items-start justify-between"><span className="lab-card-num">{l.n}</span><span className="icon-chip"><svg viewBox="0 0 68 60" width="32" height="28" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{l.icon}</svg></span></div>
          <h2 className="mt-4 text-2xl font-semibold">{l.name}</h2><p className="mt-1 text-sm font-medium text-primary">{l.tag}</p><p className="mt-3 text-sm text-muted-foreground">{l.text}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium">Open lab <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
        </Link>)}
      </div>
    </main>
  </>;
}
