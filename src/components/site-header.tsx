import { Link } from '@tanstack/react-router';
import { ChevronDown, Zap } from 'lucide-react';
import type { ReactNode } from 'react';

const componentLabs = [
  { to: '/resistors', name: 'Resistors' },
  { to: '/capacitors', name: 'Capacitors' },
  { to: '/inductors', name: 'Inductors' },
  { to: '/diodes', name: 'Diodes' },
  { to: '/transistors', name: 'Transistors' },
] as const;

const soonSections = [
  { name: 'Circuits', note: 'Impedance · Kirchhoff · Lenz' },
  { name: 'Digital', note: 'Gates · Flip-flops · Adders' },
  { name: 'Radio', note: 'Antennas' },
] as const;

export function SiteHeader({ children }: { children?: ReactNode }) {
  return <header className="topbar"><div className="shell flex h-full items-center justify-between gap-4">
    <div className="flex items-center gap-8">
      <Link to="/" className="flex items-center gap-3" aria-label="Circuit playground home"><span className="brand-icon"><Zap size={20} strokeWidth={1.7} /></span><span className="brand-word">circuit<span className="brand-dot">.</span>playground</span></Link>
      <nav className="tabs" aria-label="Labs">
        <div className="nav-group">
          <button type="button" className="tab nav-group-trigger" aria-haspopup="true">Components <ChevronDown size={13} /></button>
          <div className="nav-menu" role="menu">
            {componentLabs.map(l => <Link key={l.to} to={l.to} className="nav-item" activeProps={{ 'aria-current': 'page' }}>{l.name}</Link>)}
          </div>
        </div>
        {soonSections.map(s => <div key={s.name} className="nav-group">
          <button type="button" className="tab nav-group-trigger" aria-haspopup="true">{s.name} <ChevronDown size={13} /></button>
          <div className="nav-menu" role="menu"><span className="nav-soon">Coming soon<span className="nav-soon-note">{s.note}</span></span></div>
        </div>)}
        <Link to="/theory" className="tab" activeProps={{ 'aria-current': 'page' }}>Theory</Link>
      </nav>
    </div>
    <div className="flex items-center gap-2">{children}</div>
  </div></header>;
}
