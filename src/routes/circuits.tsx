import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

export const Route = createFileRoute('/circuits')({
  head: () => ({ meta: [
    { title: 'Circuits — Circuit Playground' },
    { name: 'description', content: 'Combine resistors, capacitors and inductors in one AC circuit and meet impedance, reactance and phase.' },
    { property: 'og:title', content: 'Circuits — Circuit Playground' },
    { property: 'og:description', content: 'R, L and C together: impedance, reactance, phase and resonance.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: () => <ComingSoon
    eyebrow="CIRCUITS"
    title="Circuits"
    description="One AC circuit where resistors, capacitors and inductors can each be switched in or out — the place where the component labs come together."
    topics={[
      'Series AC circuit with switchable R, L and C (RC, RL, RLC combinations)',
      'Impedance Z: magnitude and phase, with a phasor diagram',
      'Reactance Xₗ and X꜀, and how they cancel at resonance',
      'Readouts: total impedance, current, phase shift, power factor',
      "Kirchhoff's current and voltage law panels (moved from the resistor lab)",
      'RLC resonance curve (moved from the inductor lab)',
    ]}
  />,
});
