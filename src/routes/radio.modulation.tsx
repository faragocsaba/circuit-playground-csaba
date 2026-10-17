import { createFileRoute } from '@tanstack/react-router';
import { RadioLab } from '@/components/radio/lab';
export const Route = createFileRoute('/radio/modulation')({
  head: () => ({ meta: [
    { title: 'AM & FM Modulation — Circuit Playground' },
    { name: 'description', content: 'Compare amplitude and frequency modulation with adjustable audio, depth, deviation and live radio signal waveforms.' },
    { property: 'og:title', content: 'AM & FM Modulation — Circuit Playground' },
    { property: 'og:description', content: 'Put an audio message onto a carrier and compare AM envelopes with FM frequency changes.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: ModulationPage,
});
function ModulationPage() { return <RadioLab kind="modulation" />; }