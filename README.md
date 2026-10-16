# Circuit Playground

An interactive physics-lesson site: animated circuit diagrams that show how basic
electronic components actually behave. Every lab is a live simulation you can drive —
change the supply, the component values or the layout, and watch the currents,
voltages and fields respond.

**Live app**: https://circuit-playground-csaba.lovable.app

No account is needed and nothing is saved: all simulation runs in the browser.

## The labs

| Page | What you can explore |
| --- | --- |
| [`/`](https://circuit-playground-csaba.lovable.app/) | Start page linking to every lab. |
| [`/resistors`](https://circuit-playground-csaba.lovable.app/resistors) | One resistor, two in series or two in parallel. Adjustable supply and resistor values, colour-coded current flow, resistor colour bands with names, live current–voltage graph with the working point. Includes **Kirchhoff's current law** (how the current splits at a junction) and **Kirchhoff's voltage law** (how the voltage drops add up around each loop) as panels that track the sliders. |
| [`/capacitors`](https://circuit-playground-csaba.lovable.app/capacitors) | **Direct current**: charge and discharge through a resistor, watching the plate charge build and fade. **Alternating current**: adjustable frequency and amplitude, with the capacitor voltage lagging behind the source. Animated plate charges and live voltage/current traces, plus an in-page helper that answers questions about the setup you are looking at. |
| [`/inductors`](https://circuit-playground-csaba.lovable.app/inductors) | **RL switching**: current builds up slowly and keeps flowing when the supply is switched off. **LC tank**: energy swings between the capacitor and the coil's magnetic field, with bars for each store. **Series RLC resonance**: a current-versus-frequency curve with a sharp peak and a "tune to resonance" shortcut, showing how the coil and capacitor voltages can exceed the supply. |
| [`/diodes`](https://circuit-playground-csaba.lovable.app/diodes) | Rectifier, Schottky, LED (red/green/blue) and Zener. Sweep the supply from −12 V to +12 V, read current, voltage, power and LED brightness, look inside the junction (barrier zone, emitted light, Zener breakdown), and overlay all four current–voltage curves in a comparison view. |
| [`/transistors`](https://circuit-playground-csaba.lovable.app/transistors) | **BJT**: NPN and PNP in common-emitter, common-base and common-collector arrangements. **FET**: enhancement MOSFET and JFET, n- and p-channel, in common-source, common-gate and common-drain — the voltage-controlled counterpart to the BJT. Both show carrier motion and conventional current separately, with dot counts that follow the current split. |
| [`/theory`](https://circuit-playground-csaba.lovable.app/theory) | Ohm's law, Kirchhoff's current and voltage laws, and how capacitors and inductors store energy — formula, plain-language explanation, a worked example using each lab's own starting values, and a link straight back to the matching lab. |

Every lab has play/pause, a speed control and a reset, and respects the browser's
"reduce motion" setting by starting paused.

## How it is put together

Each component family has a **pure model module** that knows nothing about React or the
DOM — it just solves the circuit and returns currents, voltages, energy and the carrier
flow that the animation draws. Keeping the maths in one place means the numbers on the
readouts, the moving dots, the graphs and the diagrams can never disagree.

- `src/lib/resistor-model.ts` — series/parallel combinations, colour bands, Kirchhoff checks
- `src/lib/capacitor-model.ts` — exact RC time steps; capacitor voltage is retained across source changes
- `src/lib/inductor-model.ts` — one series R-L-C model: exact RL steps, fine RK4 substeps for LC and RLC
- `src/lib/diode-model.ts` — shared `ivCurve` used by both the junction view and the comparison graph
- `src/lib/transistor-model.ts` — terminal currents, gain, saturation and cutoff for all six BJT arrangements
- `src/lib/fet-model.ts` — square-law channel with a load line, threshold/cutoff voltages and operating regions

Each model has a matching `*.test.ts` file. The diagrams in `src/components/<family>/`
are purpose-built SVG (circuit symbols, cutaways, energy bars, graphs) rather than
prerecorded video, so they stay adjustable and pausable.

The capacitor helper streams answers from the AI gateway through a server-only route
(`src/routes/api.capacitor-chat.ts`). Each question carries a snapshot of the current
settings and recent readings so explanations are grounded in the model. Conversations
live in browser memory only — no question, answer or learner identity is stored; the
one backend record notes only whether the AI service refused access, so the helper can
stop retrying.

## Tech stack

TanStack Start v1 (React 19, Vite 7), TanStack Router and Query, Tailwind CSS v4,
shadcn/ui primitives, Recharts for the graphs, Vitest for the model tests. Lovable Cloud
provides the AI gateway used by the capacitor helper.

## Development

You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev        # http://localhost:8080
npm test           # model unit tests
npm run lint
```

## Worth knowing

- The transistor and FET views are simplified teaching models, not SPICE. The dot counts
  are an exaggerated ratio (roughly one base dot per ten collector dots) so the current
  split is visible; the readouts show the real gain.
- Inductor values are deliberately large (henries) so the transients unfold over seconds
  instead of microseconds.
- The pages are responsive down to phone widths, and animations pause for visitors who
  ask their browser to reduce motion.

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f0dd8a40-ecc4-484c-9faf-ceec9bbb2b5f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.
