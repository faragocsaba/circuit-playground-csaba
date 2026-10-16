import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it.each(['/resistors','/capacitors','/diodes','/transistors','/circuits','/circuits/kirchhoff','/circuits/resonance','/circuits/lenz'])('matches %s', (p) => { const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } }); expect(router.matchRoutes(p).at(-1)?.routeId).toBe(p); });
  it("matches the capacitor lab", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes('/capacitors').at(-1)?.routeId).toBe('/capacitors');
  });
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
