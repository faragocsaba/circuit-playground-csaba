import { createFileRoute, Link } from '@tanstack/react-router';
import { SiteHeader } from '@/components/site-header';
import { LenzExperiment } from '@/components/inductor/lenz-experiment';

export const Route = createFileRoute('/circuits_/lenz')({
  head: () => ({ meta: [
    { title: 'Lenz’s Law — Circuit Playground' },
    { name: 'description', content: 'Move a magnet toward and away from a coil and watch the induced current always fight the motion — Lenz’s law made visible.' },
    { property: 'og:title', content: 'Lenz’s Law — Circuit Playground' },
    { property: 'og:description', content: 'The induced current always opposes the change that creates it.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: LenzLab,
});

function LenzLab() {
  return <>
    <SiteHeader />
    <main className="shell">
      <div className="lab-heading"><div className="eyebrow mb-3 text-muted-foreground">CIRCUITS / MAGNETIC INDUCTION</div><h1>Lenz’s law<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">The induced field opposes the change in magnetic flux.</p></div>
      <LenzExperiment />
      <footer className="footer"><span>Simplified magnet &amp; coil · motion slowed to stay visible</span><Link to="/theory" hash="lenz" className="text-primary hover:underline">Theory →</Link></footer>
    </main>
  </>;
}
