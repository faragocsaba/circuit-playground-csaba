import { resistorModel, type ResistorSettings } from './resistor-model';

type Point = readonly [number, number];
const paths: Point[][] = [
  [[120, 170], [120, 90], [260, 90], [260, 300], [120, 300], [120, 220]],
  [[120, 170], [120, 90], [260, 90], [380, 90], [380, 300], [260, 300], [120, 300], [120, 220]],
];

/** Colored streams follow complete routes, so junctions neither create nor lose dots.
 * Equal charge per dot makes passage rates proportional to the actual branch currents.
 * One shared scale keeps high currents readable without distorting their ratio.
 */
export function parallelResistorFlow(settings: ResistorSettings, phase: number) {
  const model = resistorModel(settings);
  const scale = 0.12 * Math.min(1, 20 / Math.max(model.i1, model.i2, 20));
  return paths.map((path, branch) => {
    const lengths = path.slice(1).map((end, i) => {
      const start = path[i] ?? end;
      return Math.hypot(end[0] - start[0], end[1] - start[1]);
    });
    const length = lengths.reduce((sum, segment) => sum + segment, 0);
    const count = Math.round(length / 26);
    const current = branch === 0 ? model.i1 : model.i2;
    const rate = current * scale;
    const spacing = length / count;
    const offset = branch === 0 ? 0 : 0.25;
    const dots = rate <= 0 ? [] : Array.from({ length: count }, (_, i) => {
      let distance = (((i + phase * rate + offset) % count + count) % count) * spacing;
      for (let j = 0; j < lengths.length; j++) {
        const start = path[j];
        const end = path[j + 1];
        const segment = lengths[j] ?? 0;
        if (!start || !end || segment === 0) continue;
        if (distance <= segment) {
          const fraction = distance / segment;
          return { x: start[0] + (end[0] - start[0]) * fraction, y: start[1] + (end[1] - start[1]) * fraction };
        }
        distance -= segment;
      }
      return { x: 120, y: 220 };
    });
    return { branch, current, rate, speed: rate * spacing, dots };
  });
}