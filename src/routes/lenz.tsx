import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

export const Route = createFileRoute('/lenz')({
  head: () => ({ meta: [
    { title: "Lenz's law — Circuit Playground" },
    { name: 'description', content: "Watch a changing magnetic field induce a current that fights the change — Lenz's law in action." },
    { property: 'og:title', content: "Lenz's law — Circuit Playground" },
    { property: 'og:description', content: 'A changing magnetic field induces a current that opposes the change.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: () => <ComingSoon
    eyebrow="CIRCUITS"
    title="Lenz's law"
    description="A magnet moving toward a coil induces a current — and that current's own field pushes back against the magnet. Nature resists change."
    topics={[
      'Animated magnet moving in and out of a coil',
      'Induced current direction shown with moving dots',
      'Field arrows for the magnet and the induced field',
      'Adjustable magnet speed and coil turns',
      'Live graph of induced voltage vs. time',
    ]}
  />,
});
