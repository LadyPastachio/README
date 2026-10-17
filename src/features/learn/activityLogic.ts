/** Pure helpers for lesson activities, kept separate so they're easy to test. */

/** Same input always gives the same order, and never the original order (for 2+ items). */
export function stableShuffle<T>(items: readonly T[], seedText: string): T[] {
  let seed = 0;
  for (const ch of seedText) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  if (out.length > 1 && out.every((x, i) => x === items[i])) out.push(out.shift()!);
  return out;
}

export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return [...items];
  const out = [...items];
  const [item] = out.splice(from, 1);
  out.splice(to, 0, item!);
  return out;
}

/** Counts items in the right position, so feedback can say "4 of 6 are in place". */
export function countInPlace<T>(current: readonly T[], correct: readonly T[]): number {
  return current.reduce((n, x, i) => n + (x === correct[i] ? 1 : 0), 0);
}
