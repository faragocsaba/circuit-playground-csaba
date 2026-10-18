// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    plugins: [{
      name: 'circuit-localized-presentation',
      enforce: 'post',
      transform(code, id) {
        if (!id.includes('/src/') || !id.split('?')[0]?.endsWith('.tsx') || /\/lib\/localization\/|\/components\/ui\/|\/components\/ai-elements\//.test(id)) return;
        return code.replace(/(["'])react\/(jsx(?:-dev)?-runtime)\1/g, '"@/lib/localization/$2"');
      },
    }],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
