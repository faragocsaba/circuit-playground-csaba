import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

export const Route = createFileRoute('/flip-flops')({
  head: () => ({ meta: [
    { title: 'Flip-flops — Circuit Playground' },
    { name: 'description', content: 'Build memory from NAND gates: SR latch, gated latch, D, JK and T flip-flops, wired up interactively.' },
    { property: 'og:title', content: 'Flip-flops — Circuit Playground' },
    { property: 'og:description', content: 'How gates gain memory: SR, D, JK and T flip-flops built from NAND gates.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: () => <ComingSoon
    eyebrow="DIGITAL ELECTRONICS"
    title="Flip-flops"
    description="Wire gates back into themselves and something new appears: memory. Each flip-flop is built from the gates you already know."
    topics={[
      'SR latch from two cross-coupled NAND gates',
      'Gated latch, then edge-triggered D flip-flop',
      'JK and T flip-flops',
      'The forbidden SR state shown and explained',
      'Clock input with a step-by-step signal animation',
    ]}
  />,
});
