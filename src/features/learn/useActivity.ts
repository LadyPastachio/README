import { useState } from 'react';
import type { GradedActivity, ExplainActivity } from '@/content/schema';
import type { Confidence } from '@/core/learning/records';
import { useLearning } from '@/core/learning/LearningContext';
import { useSettings } from '@/core/settings/SettingsContext';

export interface ActivityContext {
  lessonId: string;
  context: 'lesson' | 'review';
  sessionId: string;
  hintsShown: number;
  lessonOrder: 'explain-first' | 'try-first' | null;
}

/** Shared state for one activity: records answers and decides when "Show solution" appears. */
export function useActivity(ctx: ActivityContext, activity: GradedActivity | ExplainActivity) {
  const { record, saveFailed } = useLearning();
  const { settings } = useSettings();
  const [wrong, setWrong] = useState(0);
  const [solved, setSolved] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [confidence, setConfidence] = useState<Confidence | null>(null);

  const base = {
    context: ctx.context,
    sessionId: ctx.sessionId,
    lessonId: ctx.lessonId,
    activityId: activity.id,
    kind: activity.kind,
    hintsShown: ctx.hintsShown,
    lessonOrder: ctx.lessonOrder,
  };

  const submit = (answer: string, correct: boolean | null, misconception: string | null = null, selfCheck: { covered: number; of: number } | null = null) => {
    record({ ...base, type: 'answer', answer, correct, confidence, misconception, selfCheck });
    if (correct === true) setSolved(true);
    if (correct === false) setWrong((n) => n + 1);
    setConfidence(null);
  };

  const reveal = () => {
    record({ ...base, type: 'reveal', answer: 'Solution shown', correct: null, confidence: null, misconception: null, selfCheck: null });
    setRevealed(true);
  };

  const policy = settings.learning.solutionReveal;
  const canReveal = !solved && !revealed && policy !== 'never' && wrong >= (policy === 'after-1' ? 1 : 2);

  return {
    submit,
    reveal,
    canReveal,
    wrong,
    solved,
    revealed,
    done: solved || revealed,
    confidence,
    setConfidence,
    askConfidence: settings.learning.askConfidence,
    saveFailed,
  };
}
