import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site-header';

export function ComingSoon({ eyebrow, title, description, topics, children }: {
  eyebrow: string;
  title: string;
  description: string;
  topics: string[];
  children?: ReactNode;
}) {
  return <>
    <SiteHeader />
    <main className="shell">
      <div className="lab-heading max-w-2xl">
        <div className="eyebrow mb-3 text-muted-foreground">{eyebrow}</div>
        <h1>{title}<span className="text-primary">.</span></h1>
        <p className="mt-4 text-muted-foreground">{description}</p>
      </div>
      <div className="mb-8 rounded-lg border border-dashed border-border bg-card p-6 sm:p-8" style={{ boxShadow: 'var(--shadow)' }}>
        <div className="eyebrow mb-3" style={{ color: 'var(--amber)' }}>PLANNED — NOT YET IMPLEMENTED</div>
        <p className="mb-4 text-sm text-muted-foreground">This lab is on the roadmap. It will include:</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {topics.map(t => <li key={t} className="flex gap-2 text-sm text-muted-foreground"><span className="text-primary">•</span>{t}</li>)}
        </ul>
        {children}
      </div>
      <footer className="footer"><span>Coming soon</span><span>circuit.playground</span></footer>
    </main>
  </>;
}
