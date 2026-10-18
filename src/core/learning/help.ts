import { experimentsForLesson } from '@/content/experiments';
import type { Lesson } from '@/content/schema';
import type { Profile } from '../settings/schema';
import type { LearningEvent } from './records';

/**
 * Lesson help: the alternative explanations behind the lesson controls,
 * and how the app decides which one to open for you.
 */

export const HELP_KINDS = ['simpler', 'analogy', 'steps', 'example', 'diagram', 'compare', 'experiment', 'challenge'] as const;
export type HelpKind = (typeof HELP_KINDS)[number];

export const HELP_LABELS: Record<HelpKind, string> = {
  simpler: 'Explain it more simply',
  analogy: 'Give me an analogy',
  steps: 'Walk me through it step by step',
  example: 'Give me another example',
  diagram: 'Show me a diagram',
  compare: 'Compare two approaches',
  experiment: 'Let me experiment',
  challenge: 'Challenge me',
};

/** Which controls a lesson can offer. Diagram and compare only appear where the lesson has them. */
export function availableHelp(lesson: Lesson): HelpKind[] {
  return HELP_KINDS.filter((k) => {
    if (k === 'diagram') return lesson.sections.some((s) => s.diagram);
    if (k === 'compare') return !!lesson.alternatives.compare;
    if (k === 'experiment') return lesson.sections.some((s) => s.code) || !!lesson.alternatives.example.code || experimentsForLesson(lesson.id).length > 0;
    return true;
  });
}

const FORMAT_TO_HELP: Partial<Record<Profile['preferredFormats'][number], HelpKind>> = {
  analogies: 'analogy',
  'step-by-step': 'steps',
  'worked-examples': 'example',
  'short-text': 'simpler',
  diagrams: 'diagram',
};

export interface HelpEffect {
  kind: HelpKind;
  uses: number;
  /** First-try accuracy on activities answered after this help, in the same visit. */
  after: number;
  /** First-try accuracy on lesson activities answered without any help in that visit. */
  baseline: number;
}

/**
 * Whether a kind of help seems to work for you: compares first answers that
 * came after opening it with first answers in visits where no help was used.
 */
export function helpEffects(events: LearningEvent[]): HelpEffect[] {
  const bySession = new Map<string, LearningEvent[]>();
  for (const e of events) if (e.context === 'lesson') bySession.set(e.sessionId, [...(bySession.get(e.sessionId) ?? []), e]);
  const stats = new Map<HelpKind, { uses: number; n: number; ok: number }>();
  let baseN = 0;
  let baseOk = 0;
  for (const list of bySession.values()) {
    const seen = new Set<string>();
    let lastHelp: HelpKind | null = null;
    const anyHelp = list.some((e) => e.type === 'help');
    for (const e of list) {
      if (e.type === 'help') {
        lastHelp = e.activityId.replace('help:', '') as HelpKind;
        const s = stats.get(lastHelp) ?? { uses: 0, n: 0, ok: 0 };
        s.uses++;
        stats.set(lastHelp, s);
        continue;
      }
      if (e.type !== 'answer' || e.correct === null || seen.has(e.activityId)) continue;
      seen.add(e.activityId);
      if (lastHelp) {
        const s = stats.get(lastHelp)!;
        s.n++;
        if (e.correct) s.ok++;
      } else if (!anyHelp) {
        baseN++;
        if (e.correct) baseOk++;
      }
    }
  }
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
  return [...stats].map(([kind, s]) => ({ kind, uses: s.uses, after: pct(s.ok, s.n), baseline: pct(baseOk, baseN), n: s.n }))
    .filter((x) => x.n >= 1)
    .map(({ kind, uses, after, baseline }) => ({ kind, uses, after, baseline }));
}

export interface AutoOpen { kind: HelpKind; because: 'you-said' | 'it-helped' }

/**
 * What to open automatically when a lesson starts. Evidence beats stated
 * preference: a kind of help you've used at least 3 times, with first-try
 * accuracy 15+ points above your baseline, wins. Otherwise your stated
 * preference, if this lesson offers it. Otherwise nothing.
 */
export function chooseAutoOpen(lesson: Lesson, profile: Profile, events: LearningEvent[]): AutoOpen | null {
  const offered = new Set(availableHelp(lesson));
  const effective = helpEffects(events)
    .filter((h) => h.uses >= 3 && h.after - h.baseline >= 15 && offered.has(h.kind) && h.kind !== 'challenge' && h.kind !== 'experiment')
    .sort((a, b) => b.after - b.baseline - (a.after - a.baseline));
  if (effective[0]) return { kind: effective[0].kind, because: 'it-helped' };
  // Stated preferences come next, skipping anything you said you find frustrating.
  const avoid = new Set(profile.frustratingFormats.map((f) => FORMAT_TO_HELP[f]).filter(Boolean));
  for (const f of profile.preferredFormats) {
    const kind = FORMAT_TO_HELP[f];
    if (kind && offered.has(kind) && !avoid.has(kind)) return { kind, because: 'you-said' };
  }
  return null;
}
