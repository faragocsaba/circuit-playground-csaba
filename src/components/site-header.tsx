import { Link } from '@tanstack/react-router';
import { Zap } from 'lucide-react';
import type { ReactNode } from 'react';

export function SiteHeader({ children }: { children?: ReactNode }) {
  return <header className="topbar"><div className="shell flex h-full items-center justify-between gap-4">
    <div className="flex items-center gap-8">
      <Link to="/" className="flex items-center gap-3" aria-label="Circuit playground home"><span className="brand-icon"><Zap size={20} strokeWidth={1.7} /></span><span className="brand-word">circuit<span className="brand-dot">.</span>playground</span></Link>
      <nav className="tabs" aria-label="Components">
        <Link to="/resistors" className="tab" activeProps={{ 'aria-current': 'page' }}>Resistors</Link>
        <Link to="/capacitors" className="tab" activeProps={{ 'aria-current': 'page' }}>Capacitors</Link>
        <Link to="/inductors" className="tab" activeProps={{ 'aria-current': 'page' }}>Inductors</Link>
        <Link to="/diodes" className="tab" activeProps={{ 'aria-current': 'page' }}>Diodes</Link>
        <Link to="/transistors" className="tab" activeProps={{ 'aria-current': 'page' }}>Transistors</Link>
        <Link to="/theory" className="tab" activeProps={{ 'aria-current': 'page' }}>Theory</Link>
      </nav>
    </div>
    <div className="flex items-center gap-2">{children}</div>
  </div></header>;
}
