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
- Keep the transistor educational model in a browser-safe pure module with unit tests; visualizations consume the same results to keep circuit values and carrier flow consistent.
- Use purpose-built SVG circuit and semiconductor diagrams for the interactive lab; animation must remain adjustable and pausable rather than using prerecorded media.
- The first lab lives at the index route; this educational version is client-side and does not require persistence or authentication.
