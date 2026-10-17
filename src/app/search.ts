import { NAV_ITEMS } from './navigation';
import { PATHS } from '@/content/paths';
import { SKILLS } from '@/content/skills';
import { GLOSSARY } from '@/content/glossary';
import { LESSONS } from '@/content/lessons/how-the-web-works';

export interface SearchResult {
  kind: 'Page' | 'Path' | 'Lesson' | 'Skill' | 'Glossary';
  title: string;
  detail: string;
  to: string;
}

/** Everything the search box can find, built once from the content data. */
export function buildSearchIndex(): SearchResult[] {
  return [
    ...NAV_ITEMS.map((n) => ({ kind: 'Page' as const, title: n.label, detail: n.description, to: n.path })),
    ...PATHS.map((p) => ({ kind: 'Path' as const, title: p.name, detail: p.project, to: `/learn/path/${p.id}` })),
    ...LESSONS.map((l) => ({ kind: 'Lesson' as const, title: l.title, detail: l.objective, to: `/learn/lesson/${l.id}` })),
    ...SKILLS.map((s) => ({ kind: 'Skill' as const, title: s.name, detail: s.summary, to: `/progress#skill-${s.id}` })),
    ...GLOSSARY.map((g) => ({ kind: 'Glossary' as const, title: g.term, detail: g.definition, to: `/learn/glossary#${slug(g.term)}` })),
  ];
}

export function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Simple ranked match: exact title, then title starts-with, then title contains, then description. */
export function search(index: SearchResult[], query: string, limit = 12): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: { r: SearchResult; score: number }[] = [];
  for (const r of index) {
    const t = r.title.toLowerCase();
    const d = r.detail.toLowerCase();
    const score = t === q ? 4 : t.startsWith(q) ? 3 : t.includes(q) ? 2 : d.includes(q) ? 1 : 0;
    if (score) scored.push({ r, score });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.r);
}
