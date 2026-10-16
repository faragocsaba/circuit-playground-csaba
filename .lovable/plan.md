# Circuit Playground — growth plan

Grow the app from five component labs into four themed sections: **Components**, **Circuits**, **Digital electronics**, and **Radio**. Each step below is independently shippable and verifiable in the browser.

## Step 0 — Reorganize the site into sections

The landing page and the top menu become section-based.

- Landing page: four section groups, each with its lab cards.
  - **Components**: Resistors, Capacitors, Inductors, Diodes, Transistors (existing labs, unchanged).
  - **Circuits**: new labs from Steps 1–3.
  - **Digital electronics**: new labs from Steps 4–6.
  - **Radio**: new lab from Step 7.
- Top menu: today it has seven tabs; it will not fit eleven. Replace the flat tab row with four section dropdowns (or a compact menu), keeping direct links to every lab. The Theory tab stays.
- Every new lab follows the established pattern: a pure, unit-tested model in `src/lib/`, purpose-built SVG diagrams, adjustable/pausable animation, its own route, its own `head()` metadata, and a Theory link.

## Step 1 — Circuits section: combined circuits and impedance

New **Circuits** lab (`/circuits`):

- A series AC circuit where R, L and C can each be switched in or out, so the visitor builds RC, RL, RLC and mixed combinations in one place.
- Introduce **impedance** (Z): magnitude and phase, shown as a phasor diagram alongside the circuit. Explain reactance (Xₗ, X꜀) and how they cancel at resonance.
- Readouts: total impedance, current, phase shift between source voltage and current, power factor.
- Reuse the existing pure RLC model from the inductor lab rather than writing a new solver.

## Step 2 — Move existing pieces into the Circuits section

- The Kirchhoff junction/loop panels currently inside the resistor lab get a dedicated **Kirchhoff** view in the Circuits section (the resistor lab keeps a short version plus a link).
- The RLC resonance experiment moves from the inductor lab into the Circuits section (inductor lab keeps RL switching and the LC tank). Old URLs keep working via redirect or a link.
- Theory page gains an **Impedance and phase** topic with a worked example.

## Step 3 — Lenz's law

New lab in the Circuits section (or the inductor lab — decide when building):

- A magnet moving toward/away from a coil, or a switch changing current in one coil coupled to another.
- Show the induced current's direction and the magnetic field it creates, opposing the change — the "opposes the change" idea made visible with field rings and an arrow that always fights the motion.
- Tie-in to the existing inductor material: self-induction is Lenz's law applied to one coil.

## Step 4 — Logic gates

New **Logic gates** lab (`/logic-gates`):

- AND, OR, NOT, NAND, NOR, XOR, XNOR with switchable inputs, live output, truth table, and the standard symbol.
- Signal animation: high/low levels travel along the wires as colored states.
- Pure model: gate truth tables + a small circuit evaluator, unit-tested.

## Step 5 — Flip-flops from NAND gates

New **Flip-flops** lab (`/flip-flops`):

- Build up: NAND latch (SR) → gated latch → D flip-flop → JK → T, each shown as an interactive wiring of the gates from Step 4.
- The visitor toggles inputs and watches the stored bit survive input changes; forbidden states (SR with both inputs active) are shown and explained.
- Pure model: gate-level simulation with propagation steps so the feedback settling is visible, unit-tested.

## Step 6 — Adder

New **Adder** lab (`/adders`):

- Half adder → full adder → 4-bit ripple-carry adder built from the gates of Step 4.
- Two binary inputs the visitor sets, carry bits animated propagating stage by stage, decimal readout of inputs and sum.
- Reuses the gate evaluator from Steps 4–5.

## Step 7 — Antennas

New **Antennas** lab (`/antennas`) in the Radio section:

- How a changing current in a wire launches an electromagnetic wave: animated field lines detaching from a dipole.
- Antenna types: dipole, monopole (with ground plane), loop, Yagi — each with its radiation pattern the visitor can rotate/compare.
- Wavelength vs. antenna length slider; show why a half-wave dipole resonates.
- Simplified educational model, clearly labeled as such.

## Step 8 — Theory page and polish

- New Theory topics: impedance/phase, Lenz's law, digital logic basics, electromagnetic waves — each with a worked example and a link to its lab.
- Final pass: menu, landing page, footer numbering, and metadata consistent across all sections.

## Technical notes

- Every lab keeps the project rule: pure browser-safe model in `src/lib/` with vitest tests; diagrams consume the same model so readouts, dots and graphs always agree.
- Digital labs (Steps 4–6) share one gate-simulation engine so gates, flip-flops and adders behave identically.
- No backend or auth changes needed; everything stays browser-side.
- Verified each step with Playwright on desktop and a phone-width viewport before moving to the next.

## Open questions

1. Lenz's law: its own lab, or a third experiment inside the inductor lab? (Plan assumes its own view in Circuits.)
2. Antennas: one lab with a type switcher, or separate small labs? (Plan assumes one lab with a switcher.)
3. Should the top menu become dropdowns, or a single "All labs" page plus a minimal menu?
