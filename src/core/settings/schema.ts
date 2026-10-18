import { z } from 'zod';

/**
 * Settings shape and defaults.
 *
 * Every field has a default, so a missing or damaged value falls back
 * safely instead of crashing the app. Only settings that actually do
 * something are listed here — see "Every displayed setting must work".
 */

export const ACCENTS = ['teal', 'clay', 'indigo', 'moss', 'plum'] as const;
export const EDITOR_FONTS = ['jetbrains', 'system'] as const;

export const appearanceSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']).catch('system'),
  accent: z.enum(ACCENTS).catch('teal'),
  density: z.enum(['comfortable', 'compact']).catch('comfortable'),
  editorFont: z.enum(EDITOR_FONTS).catch('jetbrains'),
  editorFontSize: z.number().int().min(12).max(22).catch(14),
});

export const accessibilitySchema = z.object({
  /** 'system' follows the operating system's reduce-motion preference. */
  reducedMotion: z.enum(['system', 'reduce', 'allow']).catch('system'),
  /** Percent of the default text size. */
  textScale: z.number().int().min(90).max(130).catch(100),
  highContrast: z.boolean().catch(false),
});

export const learningSchema = z.object({
  /** How many activities Home suggests per day. Never changes what counts as mastery. */
  dailyLoad: z.number().int().min(1).max(3).catch(2),
  /** When the hint button becomes available in a lesson. */
  hintTiming: z.enum(['anytime', 'after-attempt']).catch('anytime'),
  /** When "Show solution" appears. Using it is recorded and means the skill needs another challenge. */
  solutionReveal: z.enum(['after-1', 'after-2', 'never']).catch('after-2'),
  /** Read the explanation first, or try a question before reading. */
  lessonOrder: z.enum(['explain-first', 'try-first']).catch('explain-first'),
  /** Ask "how sure are you?" before checking an answer. */
  askConfidence: z.boolean().catch(true),
  /** The project path you're focusing on. null = not chosen yet; switch any time. */
  currentPath: z.enum(['web', 'finance', 'chess', 'automation']).nullable().catch(null),
  /** Hours a week you expect to study. Only used for time estimates. */
  weeklyHours: z.number().int().min(1).max(40).catch(6),
});

export const EXPLANATION_FORMATS = ['diagrams', 'worked-examples', 'step-by-step', 'analogies', 'experiments', 'short-text'] as const;
export const FORMAT_LABELS: Record<(typeof EXPLANATION_FORMATS)[number], string> = {
  diagrams: 'Diagrams',
  'worked-examples': 'Worked examples',
  'step-by-step': 'Step-by-step walkthroughs',
  analogies: 'Real-world analogies',
  experiments: 'Hands-on experiments',
  'short-text': 'Short written explanations',
};

/** What the learner says about how they learn. Observed evidence is calculated separately. */
export const profileSchema = z.object({
  preferredFormats: z.array(z.enum(EXPLANATION_FORMATS)).catch([]),
  confusingTopics: z.string().max(1000).catch(''),
  notes: z.string().max(1000).catch(''),
});

export const settingsSchema = z.object({
  version: z.literal(1).catch(1),
  appearance: appearanceSchema.catch(appearanceSchema.parse({})),
  accessibility: accessibilitySchema.catch(accessibilitySchema.parse({})),
  learning: learningSchema.catch(learningSchema.parse({})),
  profile: profileSchema.catch(profileSchema.parse({})),
});

export type Settings = z.infer<typeof settingsSchema>;
export type Appearance = Settings['appearance'];
export type Accessibility = Settings['accessibility'];
export type LearningPrefs = Settings['learning'];
export type Profile = Settings['profile'];

export const DEFAULT_SETTINGS: Settings = settingsSchema.parse({});

/** Turns anything (including garbage) into valid settings, keeping what is valid. */
export function normalizeSettings(input: unknown): Settings {
  const base = typeof input === 'object' && input !== null ? input : {};
  const withSections = {
    ...base,
    appearance: (base as Record<string, unknown>).appearance ?? {},
    accessibility: (base as Record<string, unknown>).accessibility ?? {},
    learning: (base as Record<string, unknown>).learning ?? {},
    profile: (base as Record<string, unknown>).profile ?? {},
  };
  return settingsSchema.parse(withSections);
}
