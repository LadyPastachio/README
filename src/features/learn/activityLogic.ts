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

/** Checks a fill-the-gap answer. Spacing is ignored; case matters unless the activity says otherwise. */
export function checkFill(
  activity: { accepted: string[]; caseSensitive: boolean; commonWrong: { answer: string; why: string; misconception?: string }[] },
  input: string,
): { correct: boolean; why: string | null; misconception: string | null } {
  const norm = (s: string) => {
    const t = s.replace(/\s+/g, '');
    return activity.caseSensitive ? t : t.toLowerCase();
  };
  const given = norm(input);
  if (activity.accepted.some((a) => norm(a) === given)) return { correct: true, why: null, misconception: null };
  const known = activity.commonWrong.find((w) => norm(w.answer) === given);
  return { correct: false, why: known?.why ?? null, misconception: known?.misconception ?? null };
}
