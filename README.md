# Circuit Playground

**Explore electronics—from a single resistor to digital logic and radio.**

Circuit Playground is a hands-on learning app for curious beginners. Change a voltage,
flip a bit, move a magnet or tune a radio, then follow the resulting currents,
voltages, fields and signals through interactive diagrams and live graphs.

[**Open Circuit Playground →**](https://circuit-playground-csaba.lovable.app)

**17 labs · 4 theory pages · No account required**

---

## Explore the playground

| Section | The journey |
| --- | --- |
| **Components** | Understand resistors, capacitors, inductors, diodes and transistors. |
| **Circuits** | Combine components and explore impedance, Kirchhoff’s laws, resonance and induction. |
| **Digital** | Build from gates to memory, addition and bit shifts. |
| **Radio** | Follow signals from antennas through modulation, reception and transmission. |
| **Theory** | Connect the experiments to equations, diagrams and worked examples. |

The [home page](https://circuit-playground-csaba.lovable.app/) links to every lab.
The shared dropdown menu keeps the four sections close at hand, and lab links lead
to the relevant theory chapters.

## Components

### [Resistors](https://circuit-playground-csaba.lovable.app/resistors) · `/resistors`

- Single-resistor, series and parallel arrangements with adjustable supply and resistance.
- Animated current flow and live current, resistance and power readouts.
- Current–voltage graph with the current operating point.
- Resistor color bands with color names and a link to the dedicated Kirchhoff lab.

### [Capacitors](https://circuit-playground-csaba.lovable.app/capacitors) · `/capacitors`

- **DC charge/discharge:** switch the source and watch the capacitor voltage evolve through a resistor.
- **AC response:** adjust source amplitude and frequency to explore phase and transient behavior.
- Animated plate charge, current flow, charge and energy readouts, and synchronized voltage/current traces.
- Capacitor voltage remains continuous when the source changes.
- **Capacitor Guide:** ask questions about the experiment’s current settings and sampled trace; receive streamed AI explanations in the page.

### [Inductors](https://circuit-playground-csaba.lovable.app/inductors) · `/inductors`

- **RL switching:** observe current build-up and decay as the source switches.
- **LC tank:** watch energy move between the capacitor’s electric field and the coil’s magnetic field.
- Live traces, current motion and energy bars drawn from the same simulation samples.
- **Lenz’s-law experiment:** move a magnet automatically or manually and follow the induced current and opposing field.
- A link to the separate series-RLC resonance lab.

### [Diodes](https://circuit-playground-csaba.lovable.app/diodes) · `/diodes`

- Rectifier, Schottky, red/green/blue LED and Zener experiments.
- Adjustable forward/reverse supply with current, voltage and power readouts.
- Semiconductor-junction views showing the barrier, emitted light and reverse breakdown.
- LED brightness indicator based on the modeled current.
- **I–V comparison:** overlay rectifier, Schottky, LED and Zener curves and probe their values using the same diode model as the circuit.

### [Transistors](https://circuit-playground-csaba.lovable.app/transistors) · `/transistors`

Three related views connect semiconductor behavior to working circuits:

| View | Implemented experiments |
| --- | --- |
| **BJT** | NPN and PNP in common-emitter, common-base and common-collector arrangements; adjustable drive/supply, terminal currents, gain, cutoff and saturation. |
| **FET** | N- and p-channel enhancement MOSFETs and JFETs in common-source, common-gate and common-drain arrangements; voltage-controlled channels solved with their resistive load line. |
| **Circuit builder** | Parameterized BJT switch, common-emitter amplifier, MOSFET switch, CMOS NOT, NAND and NOR templates. |

- Conventional current and electron/hole motion are distinguished; terminal colors and legends explain the flow.
- BJT emitter-dot contributions combine the base and collector streams to conserve the displayed current split.
- The builder includes typical models for **2N3904, BC547B, 2N2222A, 2N3906, BC557B, 2N7000 and BS250**, plus generic logic MOSFETs.
- Builder readouts include node voltages, current, gain/power where relevant, a device operating-region table, characteristic curves and rating warnings.
- PNP and p-channel parts mirror circuit polarity. Logic-gate links open the corresponding CMOS builder template with its input values.
- Builder state can be addressed through `/transistors?view=builder&template=…&a=…&b=…`.

## Circuits

| Lab | What is implemented |
| --- | --- |
| [**Combined R/L/C**](https://circuit-playground-csaba.lovable.app/circuits) · `/circuits` | Switch R, L and C into or out of one series AC circuit. Explore impedance, peak current, phase and power factor with the circuit and phasor diagram. |
| [**Kirchhoff’s laws**](https://circuit-playground-csaba.lovable.app/circuits/kirchhoff) · `/circuits/kirchhoff` | Live junction-current and loop-voltage diagrams with equations that track the selected resistor arrangement and settings. |
| [**Resonance**](https://circuit-playground-csaba.lovable.app/circuits/resonance) · `/circuits/resonance` | Series-RLC experiment with adjustable values, voltage/current traces, a resonance curve and a tune-to-resonance action. Observe coil/capacitor voltages exceeding the source near resonance. |
| [**Lenz’s law**](https://circuit-playground-csaba.lovable.app/circuits/lenz) · `/circuits/lenz` | The shared magnet-and-coil experiment with automatic/manual motion, induced-current meters, field direction and a live trace. |

Kirchhoff’s laws and RLC resonance have their own Circuits labs rather than being
embedded in the Resistors and Inductors pages. The Lenz experiment is also available
inside Inductors.

## Digital electronics

### [Logic gates](https://circuit-playground-csaba.lovable.app/logic-gates) · `/logic-gates`

- **AND, OR, NOT, NAND, NOR, XOR and XNOR**, with circuit symbols and switchable input bits.
- Live output and truth tables that highlight the current input combination.
- **Transistor-level construction:** CMOS pull-up/pull-down networks for NOT, NAND and NOR with conducting devices highlighted.
- AND/OR as NAND/NOR plus an inverter; XOR as four NAND gates; XNOR as that XOR plus an inverter.
- Transistor counts and direct links into the transistor builder.

### [Flip-flops](https://circuit-playground-csaba.lovable.app/flip-flops) · `/flip-flops`

- **SR NAND latch:** cross-coupled gates with active-low set/reset, held state, complementary outputs and the forbidden both-low condition.
- **D, JK and T flip-flops:** rising-edge state changes, including JK/T toggling.
- Interactive inputs, clock control, characteristic tables and signal-colored diagrams.
- Feedback crossings distinguish connected junctions from wires that merely cross.

### [Adders](https://circuit-playground-csaba.lovable.app/adders) · `/adders`

- Half adder, full adder and a **4-bit ripple-carry adder**.
- Editable input bits, sum/carry readouts and decimal results.
- Gate-level construction and animated carry stages.
- Carry-out/unsigned overflow indication, with explanations of binary addition and propagation delay.

### [Bit shifts](https://circuit-playground-csaba.lovable.app/bit-shifts) · `/bit-shifts`

- **8-bit logical left, logical right and arithmetic right shifts** by 0–8 positions.
- Numeric byte input and individually switchable bits.
- A source-to-output data-path diagram showing zero fill, sign fill and discarded bits.
- Simultaneous signed/unsigned results, power-of-two arithmetic and fixed-width overflow explanations.
- Apply the result repeatedly or reset the experiment.
- Explanations of two’s complement, clocked shift registers and combinational barrel shifters, with links to related digital labs.

## Radio

### [Antennas](https://circuit-playground-csaba.lovable.app/antennas) · `/antennas`

- **Dipole, monopole, loop and Yagi** antenna geometries with transmit/receive views.
- Adjustable frequency and length, plus a cut-to-resonance action.
- Animated currents and electromagnetic fields, wavelength/resonant-length readouts, matching/efficiency estimates and polar radiation patterns.
- Explanations of polarization, directivity and the physical relationship between current and radiated/received fields.
- Links onward to modulation, receiver and transmitter experiments.

### [AM & FM modulation](https://circuit-playground-csaba.lovable.app/radio/modulation) · `/radio/modulation`

- Compare **amplitude modulation** with **frequency modulation**.
- Adjustable message and modulation parameters; message, carrier and modulated-signal plots.
- AM envelope and overmodulation behavior; FM deviation and instantaneous frequency.
- Optional audio output for listening to the modeled signals.

### [Radio receiver](https://circuit-playground-csaba.lovable.app/radio/receiver) · `/radio/receiver`

- Tune simulated AM/FM stations and follow the receiver’s selected stages.
- Signal-chain and teaching-circuit diagrams for tuning, mixing, intermediate frequency, detection and audio recovery.
- Live signal plots and readouts tied to the shared radio model.
- Optional playback of the recovered audio.

### [Radio transmitter](https://circuit-playground-csaba.lovable.app/radio/transmitter) · `/radio/transmitter`

- Follow the message through the oscillator, AM/FM modulation, RF power amplifier and antenna matching stages.
- Adjustable signal/modulation/power settings with stage selection and corresponding plots/readouts.
- Circuit diagrams connecting the teaching signal model to practical radio topology.
- Optional audio output. Audio starts only after an explicit user action.

## Theory

Each chapter combines plain-language explanations, equations, diagrams, worked
examples and links back to experiments. Numerical examples reuse lab models where
available rather than introducing a second set of circuit calculations.

| Page | Topics |
| --- | --- |
| [**Foundations**](https://circuit-playground-csaba.lovable.app/theory) · `/theory` | Ohm’s law, Kirchhoff’s laws, capacitor/inductor energy storage, impedance/phase, Lenz’s law, digital foundations and electromagnetic waves; links to expanded chapters. |
| [**Circuits**](https://circuit-playground-csaba.lovable.app/theory/circuits) · `/theory/circuits` | KCL/KVL, complex impedance, voltage phasors, RMS power, power factor and resonance, with model-derived examples. |
| [**Digital**](https://circuit-playground-csaba.lovable.app/theory/digital) · `/theory/digital` | Boolean algebra, seven-gate truth tables, CMOS construction, latches/flip-flops, an interactive clocked D example and binary adders. |
| [**Radio**](https://circuit-playground-csaba.lovable.app/theory/radio) · `/theory/radio` | Electromagnetic waves and antennas, AM/FM equations and plots, LC tuning, superheterodyne mixing, detector/RC behavior and transmitter power. |

## Presentation and learning tools

- Purpose-built **SVG circuit, semiconductor, field and signal diagrams** rather than prerecorded video.
- Live readouts, graphs, legends and adjustable experiment controls.
- Play/pause, reset and speed controls on time-based experiments where applicable; reduced-motion support.
- Responsive layouts for desktop, tablet and phone screens.
- A warm light visual theme with teal signals, amber accents, Instrument Serif headings, Instrument Sans body text and IBM Plex Mono readouts.
- Enlargeable physical-component illustrations on component and digital labs, labeled **AI-generated illustrations**, not photographs. Generic chip pictures do not imply an exact part or pinout.
- Page-specific titles/social metadata, shared navigation, error/not-found pages and the **Created by Csaba Faragó** credit linking to [faragocsaba.hu](https://faragocsaba.hu).

## Models and architecture

Simulation logic lives in **browser-safe, pure TypeScript modules** with unit tests.
Diagrams, traces and readouts consume the same results to keep the displayed physics
consistent. React manages the experiments; TanStack Router provides file-based pages.

| Model | Responsibility |
| --- | --- |
| `resistor-model.ts` | Series/parallel resistance, Ohm’s law, color bands and Kirchhoff checks. |
| `capacitor-model.ts` | Exact RC steps and continuous capacitor voltage across source changes. |
| `inductor-model.ts` | Exact RL steps and fine RK4 substeps for LC/RLC dynamics; AC resonance response. |
| `diode-model.ts` | Diode I–V behavior shared by the circuit and comparison views. |
| `transistor-model.ts` | BJT terminal currents, operating regions and conserved carrier-flow representation. |
| `fet-model.ts` | MOSFET/JFET channel equations and resistive load-line solution. |
| `transistor-builder.ts` | Typical part parameters, Ebers–Moll BJT and square-law MOSFET models, and template solutions. |
| `circuit-model.ts` | Series-AC impedance, phase, power and phasor quantities. |
| `lenz-model.ts` | Magnet/coil flux, induced EMF/current and motion-direction conventions. |
| `logic-model.ts` | Gates, CMOS networks, latches, flip-flops and adders. |
| `bit-shift-model.ts` | Fixed-width shifts, signed-byte conversion and diagram bit mappings. |
| `antenna-model.ts` | Wavelength, antenna resonance/matching and radiation patterns. |
| `radio-model.ts` | AM/FM signals, tuning, detection, station models and shared analysis. |

All model paths above are under `src/lib/`. Additional tests cover capacitor-context
snapshots, diode comparisons and route matching.

```text
src/
├── routes/             Pages, theory chapters and capacitor-chat endpoint
├── components/         Shared UI, SVG diagrams and experiment views
├── lib/                Pure models, tests and server-only AI helpers
├── integrations/       Managed Lovable Cloud clients
├── assets/components/  Bundled component illustrations
└── test/               Test setup and navigation tests
```

### Capacitor Guide and data handling

The numerical labs do not require an account and run in the browser. The optional
Capacitor Guide uses **Lovable Cloud’s AI gateway** through a server-only streaming
helper. A question sends a frozen setup snapshot and recent sampled readings with
the conversation context so the explanation can refer to that experiment.

Conversations stay in React memory and disappear on reload; the application does
not save question/answer history. Its restricted AI-access-state record stores
terminal provider-denial state, not learner conversations. This is not a claim about
the AI provider’s own data-handling or retention policies. The helper requires its
configured cloud service; the numerical simulations do not.

## Technology

**TanStack Start v1 · React 19 · TanStack Router & Query · Vite · Tailwind CSS v4**

- shadcn/ui and Radix primitives for controls and dialogs; Lucide icons.
- Custom SVG for the educational visualizations and plots.
- AI SDK UI-message streaming and AI Elements for the Capacitor Guide.
- Web Audio for opt-in radio playback.
- Vitest, Testing Library and jsdom for automated tests.
- Lovable Cloud for the optional AI helper’s managed backend integration.

## Local development

Use **Bun** for the commands below, or the equivalent npm scripts. Consult
`package.json` for the current dependency versions.

```sh
bun install
bun run dev
```

In the Lovable development environment, the app runs at `http://localhost:8080`.
For another environment, use the address printed by the development server.

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the development server. |
| `bun run test` | Run all automated tests. |
| `bun run test:watch` | Run tests in watch mode. |
| `bun run lint` | Run ESLint. |
| `bun run format` | Format project files with Prettier. |
| `bun run build` | Create a production build. |
| `bun run preview` | Run the production-preview script. |

To run a focused check:

```sh
bunx vitest run src/lib/bit-shift-model.test.ts src/test/app-routing.test.tsx
```

**Validation:** 165 tests across 16 test files passed on 17 October 2026. Browser
checks have also exercised lab controls, navigation and desktop/mobile layouts;
they complement the unit tests rather than replacing them.

The configured build targets a Cloudflare-compatible runtime. Keep private AI
credentials server-side and do not commit secrets. Route generation and managed
Cloud integration files are generated; do not edit them by hand. See `AGENTS.md`
and `src/routes/README.md` for project conventions.

## Teaching boundaries

> This is an educational playground, not SPICE, a laboratory instrument or a
> construction guide. Do not use its outputs to certify a real circuit’s safety.

- Semiconductor parameters are simplified or rounded typical values, not a guarantee of any individual part’s performance. Rating warnings do not replace a datasheet or a full safety analysis.
- Carrier-dot counts compress current ratios to make them readable; they are not literal electrons or physical drift speeds. Conventional current and carrier motion have different meanings.
- Large inductances and adjustable animation speeds make fast processes observable on human timescales.
- Models omit various real-world effects such as component tolerances, parasitics, leakage, temperature dependence and noise.
- Radio plots use explicitly translated teaching carriers, not measured RF waveforms. Circuit views explain topology and are not complete, build-ready transmitter/receiver designs.
- Digital models use ideal bits. The SR forbidden state is identified, but analog metastability is not simulated; animated carry paths are not calibrated hardware timing.
- Bit shifts use a fixed eight-bit word: outgoing bits are discarded, not rotated or retained as a carry. Arithmetic right shifts round negative values downward.
- AI explanations can be wrong; compare them with the displayed values, equations and experiment behavior.

---

Created by **[Csaba Faragó](https://faragocsaba.hu)** · Built with [Lovable](https://lovable.dev)
