import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

export const Route = createFileRoute('/antennas')({
  head: () => ({ meta: [
    { title: 'Antennas — Circuit Playground' },
    { name: 'description', content: 'How dipole, monopole, loop and Yagi antennas radiate: radiation patterns, wavelength and resonance.' },
    { property: 'og:title', content: 'Antennas — Circuit Playground' },
    { property: 'og:description', content: 'Dipole, monopole, loop and Yagi antennas with live radiation patterns.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: () => <ComingSoon
    eyebrow="RADIO"
    title="Antennas"
    description="A piece of wire with the right length turns current into radio waves. Compare how the classic antenna shapes send energy into space."
    topics={[
      'Dipole, monopole, loop and Yagi antennas',
      'Live radiation pattern for each type',
      'Frequency slider with wavelength shown to scale',
      'Half-wave dipole resonance explained',
      'Animated waves leaving the antenna',
    ]}
  />,
});
