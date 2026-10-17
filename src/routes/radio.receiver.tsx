import { createFileRoute } from '@tanstack/react-router';
import { RadioLab } from '@/components/radio/lab';
export const Route = createFileRoute('/radio/receiver')({
  head: () => ({ meta: [
    { title: 'AM & FM Receiver — Circuit Playground' },
    { name: 'description', content: 'Tune a simulated radio station and trace the antenna signal through RF selection, mixing, detection and audio recovery.' },
    { property: 'og:title', content: 'AM & FM Receiver — Circuit Playground' },
    { property: 'og:description', content: 'Explore a real radio architecture, an AM diode detector and ideal FM audio recovery.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: ReceiverPage,
});
function ReceiverPage() { return <RadioLab kind="receiver" />; }