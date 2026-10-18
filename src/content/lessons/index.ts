import { lessonSchema, type Lesson, type LessonInput } from '../schema';
import { ALTERNATIVES } from './alternatives';
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
import { lesson as chessBoardAsData } from './chess-board-as-data';
import { lesson as gameState } from './game-state';
import { lesson as flexboxLayout } from './flexbox-layout';
import { lesson as responsiveDesign } from './responsive-design';
import { lesson as moneyMath } from './money-math';
import { lesson as filterMapReduce } from './filter-map-reduce';
import { lesson as httpAndApis } from './http-and-apis';
import { lesson as validatingInput } from './validating-input';
import { lesson as promptsAsSpecs } from './prompts-as-specs';
import { lesson as callingAModelApi } from './calling-a-model-api';
import { lesson as structuredOutputs } from './structured-outputs';
import { lesson as promptInjection } from './prompt-injection';
import { lesson as toolCallingLoop } from './tool-calling-loop';
import { lesson as evaluatingAi } from './evaluating-ai';
import { lesson as writingTests } from './writing-tests';
import { lesson as sqlBasics } from './sql-basics';
import { lesson as domEvents } from './dom-events';
import { lesson as accessibleForms } from './accessible-forms';
import { lesson as chessMoveRules } from './chess-move-rules';
import { lesson as budgetRules } from './budget-rules';
import { lesson as backendBasics } from './backend-basics';
import { lesson as secretsAndLeastPrivilege } from './secrets-and-least-privilege';

/** Lessons in suggested order: foundations first, then each path's lessons. Add new lesson files here. */
const BASE: Omit<LessonInput, 'alternatives'>[] = [
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
  chessBoardAsData,
  gameState,
  flexboxLayout,
  responsiveDesign,
  moneyMath,
  filterMapReduce,
  httpAndApis,
  validatingInput,
  promptsAsSpecs,
  callingAModelApi,
  structuredOutputs,
  promptInjection,
  toolCallingLoop,
  evaluatingAi,
  writingTests,
  sqlBasics,
  domEvents,
  accessibleForms,
  chessMoveRules,
  budgetRules,
  backendBasics,
  secretsAndLeastPrivilege,
];

/** Each lesson joined with its alternative explanations (kept in alternatives.ts). */
const RAW: LessonInput[] = BASE.map((l) => ({ ...l, alternatives: ALTERNATIVES[l.id]! }));

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
export const FOUNDATION_LESSONS: Lesson[] = LESSONS.filter((l) => !l.path);

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function pathLessons(pathId: string): Lesson[] {
  return LESSONS.filter((l) => l.path === pathId);
}
