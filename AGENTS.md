<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application architecture
- Keep each component's educational model (transistor, diode, …) in a browser-safe pure module under src/lib with unit tests; visualizations consume the same results to keep circuit values and carrier flow consistent.
- Derive transistor branch dot counts and a shared transit period from the pure transistor model; emitter dots combine both terminal contributions so displayed counts and rates conserve current across every arrangement.
- Keep the FET experiment inside the transistor family view; its pure model solves channel equations with the resistive load line and mirrored n/p voltages, and supplies both circuit and channel diagrams.
- Use purpose-built SVG circuit and semiconductor diagrams for the interactive lab; animation must remain adjustable and pausable rather than using prerecorded media.
- Each component type is its own route tab (/resistors, /capacitors, /inductors, /diodes, /transistors) with a landing page at / linking to each sharing SiteHeader; simulations remain browser-side without authentication.
- Capacitor experiments use exact RC time steps and retain capacitor voltage across source changes; circuit motion, plate charge and live traces consume the same sample so transient and AC views stay synchronized.
- The diode comparison is a separate view within the diode tab and uses ivCurve from the shared pure model for both plotted curves and probe readouts, keeping comparisons consistent without changing circuit behavior.
- The capacitor helper uses AI Elements and AI SDK UI-message streaming through a server-only Responses helper; every question carries a frozen setup snapshot and sampled trace to ground explanations in the pure RC model.
- Keep learner conversations in React memory only; the service-role-only AI access state stores terminal provider denials, never questions or answers.
- Inductor experiments (RL, LC tank, series RLC) share one pure series R-L-C model: RL steps are exact, LC/RLC use fine RK4 substeps; circuit, energy bars, traces and resonance curve consume the same samples.
- The transistor circuit builder is a third view of /transistors (?view=builder&template=…&a=&b=); its pure model solves fill-in templates with real part data (Ebers–Moll BJT, square-law MOSFET) so the schematic, device table and curves share one solution, and logic-gate pages deep-link into the matching CMOS template.
- Use the shared PhysicalParts gallery for physical component examples; label generated pictures as illustrations and generic chip packages as generic so learners do not infer an exact part or pinout from the image.
