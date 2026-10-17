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

export const settingsSchema = z.object({
  version: z.literal(1).catch(1),
  appearance: appearanceSchema.catch(appearanceSchema.parse({})),
  accessibility: accessibilitySchema.catch(accessibilitySchema.parse({})),
});

export type Settings = z.infer<typeof settingsSchema>;
export type Appearance = Settings['appearance'];
export type Accessibility = Settings['accessibility'];

export const DEFAULT_SETTINGS: Settings = settingsSchema.parse({});

/** Turns anything (including garbage) into valid settings, keeping what is valid. */
export function normalizeSettings(input: unknown): Settings {
  const base = typeof input === 'object' && input !== null ? input : {};
  const withSections = {
    ...base,
    appearance: (base as Record<string, unknown>).appearance ?? {},
    accessibility: (base as Record<string, unknown>).accessibility ?? {},
  };
  return settingsSchema.parse(withSections);
}
