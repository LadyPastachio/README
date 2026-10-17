import { lessonSchema, type Lesson, type LessonInput } from '../schema';
import { lesson as howAPageReachesYou } from './how-a-page-reaches-you';
import { lesson as valuesAndVariables } from './values-and-variables';
import { lesson as conditions } from './conditions';
import { lesson as functions } from './functions';
import { lesson as arraysAndObjects } from './arrays-and-objects';
import { lesson as readingErrors } from './reading-errors';
import { lesson as jsonBasics } from './json-basics';
import { lesson as htmlStructure } from './html-structure';
import { lesson as whatAModelDoes } from './what-a-model-does';
import { lesson as describingRequirements } from './describing-requirements';

/** Lessons in suggested order. Add new lesson files here. */
const RAW: LessonInput[] = [
  howAPageReachesYou,
  valuesAndVariables,
  whatAModelDoes,
  describingRequirements,
  conditions,
  arraysAndObjects,
  functions,
  htmlStructure,
  readingErrors,
  jsonBasics,
];

/** Validates every lesson. A broken lesson fails loudly with its id and the problem. */
export function parseLessons(raw: LessonInput[]): Lesson[] {
  return raw.map((l) => {
    const result = lessonSchema.safeParse(l);
    if (!result.success) {
      const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      throw new Error(`Lesson "${l.id}" is invalid: ${issues}`);
    }
    return result.data;
  });
}

export const LESSONS: Lesson[] = parseLessons(RAW);

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
