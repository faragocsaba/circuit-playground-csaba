import { Link } from '@tanstack/react-router';
import { ChevronDown, Zap } from 'lucide-react';
import type { ReactNode } from 'react';

type NavItem = { to: string; label: string; soon?: boolean };

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  return <div className="nav-group">
    <button type="button" className="tab flex items-center gap-1">{label}<ChevronDown size={13} /></button>
    <div className="nav-menu">
      {items.map(i => <Link key={i.to} to={i.to} className="nav-item" activeProps={{ 'aria-current': 'page' }}>
        {i.label}{i.soon && <span className="nav-soon">Soon</span>}
      </Link>)}
    </div>
  </div>;
}

export function SiteHeader({ children }: { children?: ReactNode }) {
  return <header className="topbar"><div className="shell flex h-full items-center justify-between gap-4">
    <div className="flex items-center gap-8">
      <Link to="/" className="flex items-center gap-3" aria-label="Circuit playground home"><span className="brand-icon"><Zap size={20} strokeWidth={1.7} /></span><span className="brand-word">circuit<span className="brand-dot">.</span>playground</span></Link>
      <nav className="tabs" aria-label="Labs">
        <NavGroup label="Components" items={[
          { to: '/resistors', label: 'Resistors' },
          { to: '/capacitors', label: 'Capacitors' },
          { to: '/inductors', label: 'Inductors' },
          { to: '/diodes', label: 'Diodes' },
          { to: '/transistors', label: 'Transistors' },
        ]} />
        <NavGroup label="Circuits" items={[
          { to: '/circuits', label: 'Combined R/L/C' },
          { to: '/circuits/kirchhoff', label: 'Kirchhoff’s laws' },
          { to: '/circuits/resonance', label: 'Resonance' },
          { to: '/circuits/lenz', label: 'Lenz’s law' },
        ]} />
        <NavGroup label="Digital" items={[
          { to: '/logic-gates', label: 'Logic gates', soon: true },
          { to: '/flip-flops', label: 'Flip-flops', soon: true },
          { to: '/adders', label: 'Adders', soon: true },
        ]} />
        <NavGroup label="Radio" items={[
          { to: '/antennas', label: 'Antennas' },
        ]} />
        <Link to="/theory" className="tab" activeProps={{ 'aria-current': 'page' }}>Theory</Link>
      </nav>
    </div>
    <div className="flex items-center gap-2">{children}</div>
  </div></header>;
}
