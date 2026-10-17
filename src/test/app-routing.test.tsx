import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it('matches the bit shifts lab', () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes('/bit-shifts').at(-1)?.routeId).toBe('/bit-shifts');
  });
  it.each(['circuits', 'digital', 'radio'])('matches Theory chapter %s', chapter => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes(`/theory/${chapter}`).at(-1)?.routeId).toBe(`/theory_/${chapter}`);
  });
  it.each(['/radio/modulation', '/radio/receiver', '/radio/transmitter'])('matches radio lab %s', p => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes(p).at(-1)?.routeId).toBe(p);
  });
  // circuits_*.tsx files use the trailing-underscore convention: their route IDs keep the underscore.
  it.each([['/resistors'],['/capacitors'],['/diodes'],['/transistors'],['/circuits'],['/circuits/kirchhoff','/circuits_/kirchhoff'],['/circuits/resonance','/circuits_/resonance'],['/circuits/lenz','/circuits_/lenz'],['/logic-gates'],['/flip-flops'],['/adders'],['/antennas']])('matches %s', (p, id = p) => { const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } }); expect(router.matchRoutes(p).at(-1)?.routeId).toBe(id); });
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
