import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { radioSamples, type RadioSettings } from '@/lib/radio-model';

export function RadioAudio({ settings, receiving }: { settings: RadioSettings; receiving: boolean }) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const context = useRef<AudioContext | null>(null);
  useEffect(() => {
    if (!listening) return;
    const ctx = new AudioContext(); context.current = ctx;
    const samples = radioSamples(settings, receiving, 2400);
    const duration = 3 / settings.audioHz;
    const buffer = ctx.createBuffer(1, Math.round(ctx.sampleRate * duration), ctx.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < channel.length; i++) {
      const index = Math.min(samples.length - 1, Math.floor(i / channel.length * samples.length));
      channel[i] = Math.max(-1, Math.min(1, samples[index]?.audio ?? 0)) * settings.volume * 0.25;
    }
    const source = ctx.createBufferSource(); source.buffer = buffer; source.loop = true; source.connect(ctx.destination); source.start();
    void ctx.resume().catch(() => { setError('Audio could not start in this browser.'); setListening(false); });
    return () => { source.stop(); void ctx.close(); context.current = null; };
  }, [listening, settings, receiving]);
  return <div className="flex flex-wrap items-center gap-3"><Button variant={listening ? 'default' : 'outline'} onClick={() => { setError(''); setListening(v => !v); }} aria-pressed={listening}>{listening ? <VolumeX /> : <Volume2 />}{listening ? 'Stop audio' : 'Listen to audio'}</Button>{error && <span role="alert" className="text-sm text-destructive">{error}</span>}</div>;
}