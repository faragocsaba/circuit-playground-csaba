import { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import resistors from '@/assets/components/resistors.jpg';
import capacitors from '@/assets/components/capacitors.jpg';
import inductor from '@/assets/components/inductor.jpg';
import diode from '@/assets/components/diode.jpg';
import led from '@/assets/components/led.jpg';
import transistor from '@/assets/components/transistor.jpg';
import chip from '@/assets/components/chip.jpg';

type PartPicture = { src: string; title: string; alt: string; note: string };
const pictures = {
  resistors: [{ src: resistors, title: 'Axial resistors', alt: 'Three cylindrical resistors with color bands and a wire lead at each end', note: 'Two leads, with color bands identifying resistance and tolerance. These through-hole parts fit into a breadboard; tiny surface-mount resistors are common on circuit boards.' }],
  capacitors: [{ src: capacitors, title: 'Ceramic & electrolytic capacitors', alt: 'Orange ceramic disc capacitor beside a cylindrical electrolytic capacitor', note: 'Left: a ceramic disc, usually non-polarized. Right: an electrolytic can, usually polarized; its stripe marks the negative lead. Always check the voltage rating and polarity.' }],
  inductors: [{ src: inductor, title: 'Toroidal inductor', alt: 'Copper wire wound around a dark ring-shaped magnetic core, with two wire ends', note: 'The visible copper winding makes the coil. The ring-shaped core concentrates its magnetic field. Coils also come as air-core windings and small surface-mount parts.' }],
  diodes: [
    { src: diode, title: 'Axial diode', alt: 'Black axial diode with two metal leads and a silver cathode band', note: 'The band marks the cathode. Rectifier, Schottky and Zener diodes can look very similar: the part number, not the shape alone, tells you which type it is.' },
    { src: led, title: 'Through-hole LED', alt: 'Red domed LED with two metal leads', note: 'An LED is a light-emitting diode. Before trimming, the longer lead is usually the anode; a flat edge on the body usually marks the cathode. Use a current-limiting resistor.' },
  ],
  transistors: [{ src: transistor, title: 'TO-92 transistor package', alt: 'Small black transistor package with exactly three metal leads', note: 'Small parts such as the BC547 and 2N3904 often use this package. A BJT has base, collector and emitter; a FET has gate, drain and source. Pin order varies: consult the exact part’s datasheet.' }],
  gates: [{ src: chip, title: 'Logic gates inside a chip', alt: 'Illustration of a black dual-inline integrated circuit with two rows of metal pins', note: 'This is a generic DIP package, not a specific chip. A 74HC00 contains four NAND gates; a 74HC08 contains four AND gates. Inside the package, transistors implement the logic. Pins connect inputs, outputs and power.' }],
  flipFlops: [{ src: chip, title: 'Memory inside a chip', alt: 'Generic black dual-inline integrated circuit package with metal pins', note: 'A generic DIP package is shown. Two gates in a 74HC00 can form the NAND SR latch; a 74HC74 contains two D flip-flops, and a 74HC112 contains two falling-edge JK flip-flops. Edge polarity depends on the chip.' }],
  adders: [{ src: chip, title: 'Arithmetic inside a chip', alt: 'Generic dual-inline chip package containing an integrated circuit', note: 'The picture shows a generic package, not the pinout of an adder. A 74HC283 is a 16-pin, four-bit binary full-adder chip. XOR, AND and OR gate chips can also be wired together to build the smaller adders.' }],
} satisfies Record<string, PartPicture[]>;

export function PhysicalParts({ kind }: { kind: keyof typeof pictures }) {
  const [selected, setSelected] = useState<PartPicture | null>(null);
  return <section className="physical-parts" aria-label="Physical component examples">
    <div className="section-top"><h2>What it looks like in practice</h2><span className="text-[10px] font-mono text-muted-foreground">ILLUSTRATED EXAMPLES</span></div>
    <div className="physical-parts-grid">
      {pictures[kind].map(part => <figure key={part.title} className="physical-part">
        <div className="physical-part-image">
          <img src={part.src} alt={part.alt} width={1024} height={768} loading="lazy" />
          <Button variant="outline" size="icon" className="physical-part-enlarge" title={`Enlarge ${part.title}`} aria-label={`Enlarge ${part.title}`} onClick={() => setSelected(part)}><Maximize2 size={15} /></Button>
        </div>
        <figcaption><h3 className="text-sm font-semibold">{part.title}</h3><p className="mt-2 text-xs leading-6 text-muted-foreground">{part.note}</p><p className="mt-3 text-[10px] text-muted-foreground">AI-generated illustration of a typical component · not to scale</p></figcaption>
      </figure>)}
    </div>
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
      <DialogContent className="physical-part-dialog">
        <DialogTitle>{selected?.title ?? 'Component picture'}</DialogTitle>
        <DialogDescription>{selected?.note}</DialogDescription>
        {selected && <img src={selected.src} alt={selected.alt} width={1024} height={768} className="physical-part-detail" />}
        <p className="text-[10px] text-muted-foreground">AI-generated illustration · package and pin arrangements vary by part</p>
      </DialogContent>
    </Dialog>
  </section>;
}