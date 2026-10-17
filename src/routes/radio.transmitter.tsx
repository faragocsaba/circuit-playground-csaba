import { createFileRoute } from '@tanstack/react-router';
import { RadioLab } from '@/components/radio/lab';
export const Route = createFileRoute('/radio/transmitter')({
  head: () => ({ meta: [
    { title: 'Radio Transmitter — Circuit Playground' },
    { name: 'description', content: 'Follow a message through an AM or FM transmitter, from microphone and oscillator to RF power, matching and antenna.' },
    { property: 'og:title', content: 'Radio Transmitter — Circuit Playground' },
    { property: 'og:description', content: 'Build a wave conceptually: audio, carrier modulation, power amplification and antenna radiation.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: TransmitterPage,
});
function TransmitterPage() { return <RadioLab kind="transmitter" />; }