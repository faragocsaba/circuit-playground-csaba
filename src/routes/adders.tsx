import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

export const Route = createFileRoute('/adders')({
  head: () => ({ meta: [
    { title: 'Adders — Circuit Playground' },
    { name: 'description', content: 'From half adder to full adder to a 4-bit ripple-carry adder — watch the carry bits ripple stage by stage.' },
    { property: 'og:title', content: 'Adders — Circuit Playground' },
    { property: 'og:description', content: 'How a computer adds numbers: half adder, full adder and ripple-carry.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: () => <ComingSoon
    eyebrow="DIGITAL ELECTRONICS"
    title="Adders"
    description="Addition is just gates. Start with half an adder, grow it to a full adder, then chain four together and watch the carry ripple through."
    topics={[
      'Half adder: sum and carry from XOR and AND',
      'Full adder with carry-in',
      '4-bit ripple-carry adder with two number inputs',
      'Carry bits animated stage by stage',
      'Binary and decimal readouts side by side',
    ]}
  />,
});
