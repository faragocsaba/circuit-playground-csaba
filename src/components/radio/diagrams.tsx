import { formatRadioFrequency, radioAnalysis, type RadioLabKind, type RadioSample, type RadioSettings } from '@/lib/radio-model';

export function SignalPlot({ samples, field, title, secondary }: { samples: RadioSample[]; field: 'message' | 'rf' | 'audio' | 'frequency'; title: string; secondary?: 'envelope' | 'message' }) {
  const last = samples.at(-1)?.time ?? 1;
  const values = samples.map(s => field === 'frequency' ? s.frequency - (samples[0]?.frequency ?? 0) : s[field]);
  const max = Math.max(field === 'frequency' ? 1 : 1.6, ...values.map(Math.abs));
  const path = (vals: number[]) => vals.map((v, i) => `${i ? 'L' : 'M'}${(40 + i / (vals.length - 1) * 660).toFixed(2)} ${(108 - v / max * 72).toFixed(2)}`).join(' ');
  return <svg className="radio-plot" viewBox="0 0 740 216" role="img" aria-label={title}>
    {[0, 1, 2, 3, 4, 5, 6].map(i => <path key={i} d={`M${40 + i * 110} 20V180`} className="trace-grid" />)}
    <path d="M40 108H700" className="comparison-axis" />
    <path d={path(values)} className={field === 'rf' ? 'radio-rf-line' : 'radio-audio-line'} />
    {secondary && <path d={path(samples.map(s => s[secondary]))} className="radio-reference-line" />}
    {secondary === 'envelope' && <path d={path(samples.map(s => -s.envelope))} className="radio-reference-line" />}
    <text x="40" y="202">0 ms</text><text x="700" y="202" textAnchor="end">{(last * 1000).toFixed(1)} ms</text>
    <text x="40" y="14">{field === 'frequency' ? 'frequency change (Hz)' : 'normalized amplitude'}</text>
  </svg>;
}

export const stageNames = (kind: RadioLabKind, fm: boolean) => kind === 'receiver'
  ? ['Antenna', 'Tuned RF', 'Mixer + LO', 'IF filter', fm ? 'Limiter + FM detector' : 'Diode + RC detector', 'Audio + speaker']
  : kind === 'transmitter' ? ['Microphone', 'Audio preamp', 'RF oscillator', fm ? 'FM modulator' : 'AM modulator', 'Power + matching', 'Antenna']
  : ['Message', 'Carrier oscillator', fm ? 'Frequency modulator' : 'Amplitude modulator', 'Radio signal'];

export function RadioChain({ kind, settings, selected, phase }: { kind: RadioLabKind; settings: RadioSettings; selected: number; phase: number }) {
  const names = stageNames(kind, settings.mode === 'fm');
  const a = radioAnalysis(settings);
  const hints = kind === 'receiver' ? ['RF voltage', 'LC selects a band', formatRadioFrequency(a.loHz), formatRadioFrequency(a.ifHz), 'Recover message', `${settings.audioHz} Hz tone`]
    : kind === 'transmitter' ? [`${settings.audioHz} Hz tone`, 'Baseband', formatRadioFrequency(settings.carrierHz), settings.mode.toUpperCase(), `${a.averagePower.toFixed(2)} W average`, 'Radiated field'] : ['Low frequency', 'High frequency', settings.mode.toUpperCase(), 'Message on carrier'];
  return <svg className="radio-chain" viewBox="0 0 840 220" role="img" aria-label={`${settings.mode.toUpperCase()} ${kind} signal path`}>
    {names.map((name, i) => {
      const width = 760 / names.length, x = 40 + i * width;
      return <g key={name}>
        <rect x={x} y="65" width={width - 16} height="85" rx="5" className={selected === i ? 'radio-stage-selected' : 'radio-stage'} />
        <text x={x + (width - 16) / 2} y="49" textAnchor="middle" className="radio-number">0{i + 1}</text>
        <text x={x + (width - 16) / 2} y="93" textAnchor="middle">{name.split(' + ')[0]}</text>
        {name.includes(' + ') && <text x={x + (width - 16) / 2} y="110" textAnchor="middle">+ {name.split(' + ')[1]}</text>}
        <text x={x + (width - 16) / 2} y="132" textAnchor="middle" className="radio-hint">{hints[i]}</text>
        {i < names.length - 1 && <><path d={`M${x + width - 16} 108h16m-5-4 5 4-5 4`} className="wire" /><circle cx={x + width - 16 + (phase % 1) * 16} cy="108" r="3" className="current-particle" /></>}
      </g>;
    })}
    <text x="40" y="190">{kind === 'receiver' ? 'RADIO FREQUENCY → INTERMEDIATE FREQUENCY → AUDIO' : 'AUDIO → MODULATED RADIO FREQUENCY → ELECTROMAGNETIC WAVE'}</text>
  </svg>;
}

/** Real component topology, deliberately not advertised as a component-level solver. */
export function RadioCircuit({ settings, kind }: { settings: RadioSettings; kind: RadioLabKind }) {
  const a = radioAnalysis(settings), fm = settings.mode === 'fm';
  if (kind === 'transmitter' || fm) return <svg className="radio-circuit" viewBox="0 0 820 310" role="img" aria-label={kind === 'transmitter' ? `${settings.mode.toUpperCase()} transmitter circuit architecture` : 'FM superheterodyne receiver circuit architecture'}>
    <path d="M30 145H70M750 145H790" className="wire" />
    {(kind === 'transmitter' ? ['Mic + preamp', fm ? 'Varactor VCO' : 'Oscillator + AM mixer', 'RF transistor PA', 'LC matching', 'Antenna'] : ['LC tuned input', 'RF mixer', '10.7 MHz IF', 'Limiter / discriminator', 'Audio amplifier']).map((name, i) => <g key={name}>
      <rect x={70 + i * 136} y="105" width="120" height="80" rx="4" className="radio-stage" />
      <text x={130 + i * 136} y="138" textAnchor="middle">{name === 'Oscillator + AM mixer' ? 'Oscillator' : name.split(' / ')[0]}</text>
      <text x={130 + i * 136} y="157" textAnchor="middle">{name === 'Oscillator + AM mixer' ? '+ AM modulator' : name.split(' / ')[1] ?? (kind === 'transmitter' ? ['Audio signal', 'RF generation', 'Power gain', 'Impedance match', 'Radiated field'] : ['Input signal', 'Frequency conversion', 'Gain / filtering', 'Signal processing', 'Output'])[i]}</text>
      {i < 4 && <path d={`M${190 + i * 136} 145h16`} className="wire" />}
    </g>)}
    {kind === 'receiver' && <><rect x="216" y="220" width="120" height="40" className="radio-stage" /><text x="276" y="244" textAnchor="middle">LO {formatRadioFrequency(a.loHz)}</text><path d="M276 220V185" className="wire" /></>}
    <text x="40" y="40">{kind === 'transmitter' ? fm ? 'FM: audio varies oscillator frequency; a linearized varactor VCO is represented.' : 'AM: audio controls carrier amplitude before a linear RF output stage.' : 'FM: amplitude limiting precedes frequency discrimination.'}</text>
    <text x="40" y="290">Circuit architecture of a practical radio · functional blocks, not a wiring or construction guide</text>
  </svg>;
  return <svg className="radio-circuit" viewBox="0 0 820 360" role="img" aria-label="AM tuned LC, diode envelope detector, RC filter and audio amplifier schematic">
    <path d="M65 55V95H160H320M65 55L45 35M65 55L85 35M160 95V135M160 215V280H590M230 95V160M230 190V280M320 95H385M405 95H480H570M480 95V160M480 190V280M570 95V140M570 215V280" className="wire" />
    <path d="M160 135a10 10 0 1 1 0 20a10 10 0 1 1 0 20a10 10 0 1 1 0 20a10 10 0 1 1 0 20" className="symbol" />
    <path d="M212 160H248M212 190H248M215 199l30-47" className="symbol" />
    <path d="M385 80V110L405 95ZM405 80V110" className="symbol" />
    <path d="M462 160H498M462 190H498M570 140l-8 8 16 12-16 12 16 12-16 12 8 8v11" className="symbol" />
    <path d="M570 95H625M625 70V120L690 95ZM690 95H740M740 72V118L765 132V58Z" className="symbol" />
    <path d="M590 280H605V285M590 285h30M595 292h20M600 299h10" className="wire" />
    <circle cx="160" cy="95" r="3" className="node" /><circle cx="480" cy="95" r="3" className="node" />
    <text x="40" y="24">ANTENNA</text><text x="110" y="242">L · 250 µH</text><text x="200" y="242">C · {a.tankCapPf.toFixed(1)} pF</text>
    <text x="338" y="60">D · rectifier</text><text x="455" y="242">Cdet</text><text x="585" y="180">Rdet</text><text x="632" y="150">Audio amp</text><text x="726" y="160">Speaker</text>
    <text x="310" y="325">RC = {settings.detectorMs.toFixed(2)} ms · diode charges C; R discharges it</text>
    <text x="40" y="350">Simplified powered AM receiver · coupling, bias and supply details omitted</text>
  </svg>;
}