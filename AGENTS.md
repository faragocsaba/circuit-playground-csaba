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
- Use purpose-built SVG circuit and semiconductor diagrams for the interactive lab; animation must remain adjustable and pausable rather than using prerecorded media.
- Each component type is its own route tab (transistors at /, diodes at /diodes) sharing SiteHeader for navigation; this educational version is client-side and does not require persistence or authentication.
- The diode comparison is a separate view within the diode tab and uses ivCurve from the shared pure model for both plotted curves and probe readouts, keeping comparisons consistent without changing circuit behavior.
