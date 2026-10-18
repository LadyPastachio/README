import type { Lesson } from '@/content/schema';
import { isGraded } from '@/content/schema';
import { getSkill } from '@/content/skills';
import type { Profile } from '../settings/schema';
import type { LabExercise } from '@/content/lab/schema';
import { FORMAT_LABELS } from '../settings/schema';
import type { LearningEvent } from './records';
import { lessonResult, skillResult, type ActivityOutcome } from './mastery';
import { reviewPlan } from './schedule';

/**
 * Learning Evidence: a portable record of one lesson, as JSON and Markdown,
 * plus a prompt you can paste into a separate AI conversation to be quizzed
 * by an independent assessor.
 */

const OUTCOME_TEXT: Record<ActivityOutcome, string> = {
  unattempted: 'Not attempted',
  'first-try': 'Correct on the first try',
  retried: 'Correct after a retry',
  revealed: 'Solution shown',
  failed: 'Not solved yet',
};

export interface LessonEvidence {
  format: 'atelier-academy-evidence';
  version: 1;
  createdAt: string;
  lesson: { id: string; title: string; skill: string; objective: string; masteryRequirement: string };
  status: { lesson: string; skill: string; reason: string };
  activities: {
    id: string;
    kind: string;
    prompt: string;
    outcome: string;
    attempts: number;
    answers: { at: string; answer: string; correct: boolean | null; confidence: string | null }[];
  }[];
  explanations: { prompt: string; text: string; selfCheck: string | null; lookFor: string[] }[];
  independence: { hintsUsed: boolean; solutionsShown: number; retries: number };
  misconceptions: string[];
  strengths: string[];
  toWorkOn: string[];
  followUp: string[];
  learnerProfile: { preferredFormats: string[]; confusingTopics: string; lessonOrder: string | null; helpUsed: string[] };
  codeReview: string;
}

export function buildEvidence(events: LearningEvent[], lesson: Lesson, lessons: Lesson[], profile: Profile, now = new Date(), labs: LabExercise[] = []): LessonEvidence {
  const mine = events.filter((e) => e.lessonId === lesson.id && e.context === 'lesson');
  const result = lessonResult(events, lesson);
  const skill = skillResult(events, lesson.skill, lessons, labs);
  const skillName = getSkill(lesson.skill)?.name ?? lesson.skill;

  const graded = lesson.activities.filter(isGraded);
  const activities = graded.map((a) => {
    const r = result.activities.find((x) => x.activityId === a.id)!;
    return {
      id: a.id,
      kind: a.kind === 'choice' ? `${a.kind}:${a.variant}` : a.kind,
      prompt: a.prompt,
      outcome: OUTCOME_TEXT[r.outcome],
      attempts: r.attempts,
      answers: mine
        .filter((e) => e.activityId === a.id && e.type === 'answer')
        .map((e) => ({ at: e.at, answer: e.answer, correct: e.correct, confidence: e.confidence })),
    };
  });

  const explanations = lesson.activities
    .filter((a) => a.kind === 'explain')
    .map((a) => {
      const last = mine.filter((e) => e.activityId === a.id && e.type === 'answer').at(-1);
      return {
        prompt: a.prompt,
        text: last?.answer ?? '',
        selfCheck: last?.selfCheck ? `Learner says they covered ${last.selfCheck.covered} of ${last.selfCheck.of} key points (self-assessed)` : null,
        lookFor: a.kind === 'explain' ? a.lookFor : [],
      };
    })
    .filter((x) => x.text);
  const transfer = mine.filter((e) => e.activityId === 'transfer' && e.type === 'answer').at(-1);
  if (transfer) {
    explanations.push({
      prompt: `Transfer challenge: ${lesson.alternatives.challenge.prompt}`,
      text: transfer.answer,
      selfCheck: transfer.selfCheck ? `Learner says they covered ${transfer.selfCheck.covered} of ${transfer.selfCheck.of} key points (self-assessed)` : null,
      lookFor: lesson.alternatives.challenge.lookFor,
    });
  }
  const helpUsed = [...new Set(mine.filter((e) => e.type === 'help').map((e) => e.answer))];

  const misconceptions = [...new Set(mine.map((e) => e.misconception).filter((m): m is string => !!m))];
  const strengths = graded.filter((a) => result.activities.find((r) => r.activityId === a.id)?.outcome === 'first-try').map((a) => `Solved first time: ${a.prompt}`);
  const toWorkOn = graded
    .filter((a) => ['retried', 'revealed', 'failed'].includes(result.activities.find((r) => r.activityId === a.id)!.outcome))
    .map((a) => `${OUTCOME_TEXT[result.activities.find((r) => r.activityId === a.id)!.outcome]}: ${a.prompt}`);

  const plan = reviewPlan(events, lesson);
  const followUp: string[] = [];
  if (!result.complete) followUp.push('Finish the remaining activities in this lesson.');
  if (result.status === 'challenge') followUp.push('Retry the unsolved activities without hints or solutions.');
  if (plan) followUp.push(`Spaced review due ${plan.dueAt.toISOString().slice(0, 10)}.`);
  for (const m of misconceptions) followUp.push(`Revisit: ${m.toLowerCase()}.`);

  return {
    format: 'atelier-academy-evidence',
    version: 1,
    createdAt: now.toISOString(),
    lesson: { id: lesson.id, title: lesson.title, skill: skillName, objective: lesson.objective, masteryRequirement: lesson.masteryRequirement },
    status: { lesson: result.status, skill: skill.status, reason: skill.reason },
    activities,
    explanations,
    independence: {
      hintsUsed: result.hintsUsed,
      solutionsShown: result.activities.filter((a) => a.outcome === 'revealed').length,
      retries: result.activities.filter((a) => a.outcome === 'retried').length,
    },
    misconceptions,
    strengths,
    toWorkOn,
    followUp,
    learnerProfile: {
      preferredFormats: profile.preferredFormats.map((f) => FORMAT_LABELS[f]),
      confusingTopics: profile.confusingTopics,
      lessonOrder: mine.at(-1)?.lessonOrder ?? null,
      helpUsed,
    },
    codeReview: 'No code was submitted in this lesson. Code review findings appear once Code Lab exercises are available.',
  };
}

const STATUS_WORDS: Record<string, string> = {
  none: 'Not introduced',
  supported: 'Practiced with support',
  challenge: 'Needs another challenge',
  independent: 'Demonstrated independently',
  retained: 'Retained over time',
};

export function evidenceToMarkdown(ev: LessonEvidence): string {
  const lines: string[] = [];
  const list = (items: string[], empty = 'None recorded.') => (items.length ? items.map((i) => `- ${i}`) : [`- ${empty}`]);
  lines.push(`# Learning Evidence: ${ev.lesson.title}`, '');
  lines.push(`Created ${ev.createdAt.slice(0, 16).replace('T', ' ')} UTC · Skill: ${ev.lesson.skill}`, '');
  lines.push('## Status', `- Lesson: ${STATUS_WORDS[ev.status.lesson]}`, `- Skill: ${STATUS_WORDS[ev.status.skill]} (${ev.status.reason})`, '');
  lines.push('## Objective and mastery requirement', `- Objective: ${ev.lesson.objective}`, `- Mastery requirement: ${ev.lesson.masteryRequirement}`, '');
  lines.push('## Independence', `- Hints used: ${ev.independence.hintsUsed ? 'yes' : 'no'}`, `- Solutions shown: ${ev.independence.solutionsShown}`, `- Activities needing a retry: ${ev.independence.retries}`, '');
  lines.push('## Activities');
  for (const a of ev.activities) {
    lines.push(`### ${a.prompt}`, `- Type: ${a.kind}`, `- Result: ${a.outcome} (${a.attempts} attempt${a.attempts === 1 ? '' : 's'})`);
    for (const ans of a.answers) {
      lines.push(`  - ${ans.correct ? '✓' : '✗'} ${ans.answer}${ans.confidence ? ` (confidence: ${ans.confidence})` : ''}`);
    }
    lines.push('');
  }
  lines.push('## Explanations in the learner\'s own words');
  if (ev.explanations.length === 0) lines.push('- None written.');
  for (const x of ev.explanations) {
    lines.push(`### ${x.prompt}`, '', `> ${x.text.replace(/\n/g, '\n> ')}`, '');
    if (x.selfCheck) lines.push(`- ${x.selfCheck}`);
    lines.push(`- A strong answer mentions: ${x.lookFor.join('; ')}`, '');
  }
  lines.push('## Errors and misconceptions', ...list(ev.misconceptions), '');
  lines.push('## Strengths', ...list(ev.strengths), '');
  lines.push('## To work on', ...list(ev.toWorkOn, 'Nothing outstanding in this lesson.'), '');
  lines.push('## Recommended follow-up', ...list(ev.followUp), '');
  lines.push('## Code review', `- ${ev.codeReview}`, '');
  lines.push('## Learning approach', `- Lesson order used: ${ev.learnerProfile.lessonOrder ?? 'not recorded'}`, `- Learner says these help: ${ev.learnerProfile.preferredFormats.join(', ') || 'not stated'}`, `- Other explanations opened: ${ev.learnerProfile.helpUsed.join('; ') || 'none'}`);
  if (ev.learnerProfile.confusingTopics) lines.push(`- Learner finds confusing: ${ev.learnerProfile.confusingTopics}`);
  return lines.join('\n') + '\n';
}

/** A prompt for a separate AI conversation that acts as an independent assessor. */
export function assessorPrompt(ev: LessonEvidence): string {
  return `You are an independent assessor for a beginner learning software engineering. Below is a Learning Evidence record exported from their learning app. It is the ONLY evidence you have. Do not claim to have seen anything that isn't in it.

Please:
1. Quiz me with 3–5 new questions on "${ev.lesson.title}" (skill: ${ev.lesson.skill}). Ask ONE question at a time and wait for my answer before revealing anything. Include at least one question that asks me to explain in my own words and one that applies the idea to a situation not mentioned in the record.
2. After each answer, tell me whether it's right and why, briefly.
3. Evaluate the explanation I wrote in the record: what is accurate, what is missing or wrong.
4. Give me one practical transfer challenge I can try on my own, without the solution.
5. Finish with a recommendation: ready to move on, or what to practice first, and why. Base it on the record and my answers, not on how confident I sound.

Be honest and specific. Do not praise answers that are vague or partly wrong.

---

${evidenceToMarkdown(ev)}`;
}
