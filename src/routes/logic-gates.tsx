import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

export const Route = createFileRoute('/logic-gates')({
  head: () => ({ meta: [
    { title: 'Logic gates — Circuit Playground' },
    { name: 'description', content: 'AND, OR, NOT, NAND, NOR, XOR and XNOR gates with switchable inputs, live outputs and truth tables.' },
    { property: 'og:title', content: 'Logic gates — Circuit Playground' },
    { property: 'og:description', content: 'The building blocks of digital electronics, with truth tables and signal animation.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: () => <ComingSoon
    eyebrow="DIGITAL ELECTRONICS"
    title="Logic gates"
    description="The atoms of digital electronics. Flip the input switches and watch each gate's output respond, with its truth table alongside."
    topics={[
      'AND, OR, NOT, NAND, NOR, XOR and XNOR gates',
      'Standard symbols with switchable inputs and live output',
      'Truth table for every gate, highlighting the current row',
      'Signal animation showing 0s and 1s flowing through the gate',
      'A shared gate engine that the flip-flop and adder labs build on',
    ]}
  />,
});
