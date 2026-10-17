import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site-header';

export function TheoryChapter({ title, description, contents, children }: { title: string; description: string; contents: readonly (readonly [string, string])[]; children: ReactNode }) {
  return <><SiteHeader /><main className="shell"><div className="lab-heading"><div className="eyebrow mb-3 text-muted-foreground">THE RULES BEHIND THE LABS</div><h1>{title}<span className="text-primary">.</span></h1><p className="mt-4 max-w-2xl text-muted-foreground">{description}</p></div>
    <nav aria-label="Theory chapters" className="mb-4 flex flex-wrap gap-5 border-y border-border py-3 text-sm text-primary"><Link to="/theory" activeOptions={{ exact: true }}>Foundations</Link><Link to="/theory/circuits">Circuits</Link><Link to="/theory/digital">Digital</Link><Link to="/theory/radio">Radio</Link></nav>
    <nav aria-label="Chapter contents" className="mb-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-muted-foreground">{contents.map(([id, label]) => <a key={id} href={`#${id}`} className="hover:text-primary">{label}</a>)}</nav><div className="max-w-5xl">{children}</div><footer className="footer"><span>Idealized teaching models · SI units unless stated</span><Link to="/theory" className="text-primary">All theory <ArrowRight size={13} className="inline" /></Link></footer></main></>;
}

export function TheorySection({ id, title, equations, children }: { id: string; title: string; equations: string[]; children: ReactNode }) {
  return <section id={id} className="scroll-mt-8 border-t border-border py-5"><h2 className="text-2xl font-semibold">{title}</h2><div className="my-3 space-y-2 border-l-2 border-primary bg-secondary p-4 font-mono text-sm leading-relaxed break-words">{equations.map(e => <p key={e}>{e}</p>)}</div><div className="space-y-3 text-sm leading-7 text-muted-foreground">{children}</div></section>;
}

export function WorkedExample({ children }: { children: ReactNode }) {
  return <div className="border-l-2 border-current pl-5"><div className="eyebrow mb-2 text-primary">WORKED EXAMPLE</div>{children}</div>;
}