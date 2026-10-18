import { experimentSchema, type Experiment, type ExperimentInput } from './schema';
import { experiment as firstWebpage } from './firstWebpage';

/** Add new experiment files here. Each is validated when the app loads. */
const RAW: ExperimentInput[] = [firstWebpage];

export function parseExperiments(raw: ExperimentInput[]): Experiment[] {
  return raw.map((x) => {
    const r = experimentSchema.safeParse(x);
    if (!r.success) throw new Error(`Experiment "${x.id}" is invalid: ${r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
    return r.data;
  });
}

export const EXPERIMENTS: Experiment[] = parseExperiments(RAW);

export function getExperiment(id: string): Experiment | undefined {
  return EXPERIMENTS.find((x) => x.id === id);
}

export function experimentsForLesson(lessonId: string): Experiment[] {
  return EXPERIMENTS.filter((x) => x.lessons.includes(lessonId));
}
