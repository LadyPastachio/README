import { Eye, Bug, TextCursorInput, ListOrdered, Lightbulb, MessageSquareText, type LucideIcon } from 'lucide-react';
import type { Activity } from '@/content/schema';

export type ActivityType = 'predict' | 'bug' | 'fill' | 'order' | 'concept' | 'explain';

export const ACTIVITY_META: Record<ActivityType, { label: string; icon: LucideIcon; hint: string }> = {
  predict: { label: 'Predict the output', icon: Eye, hint: 'Read the code and work out what it does before running anything.' },
  bug: { label: 'Find the bug', icon: Bug, hint: 'Something is wrong. Work out what, and why.' },
  fill: { label: 'Fill the gap', icon: TextCursorInput, hint: 'Type the missing piece of code.' },
  order: { label: 'Put it in order', icon: ListOrdered, hint: 'Arrange the steps in the order they happen.' },
  concept: { label: 'Check your understanding', icon: Lightbulb, hint: 'Choose the best answer.' },
  explain: { label: 'Explain it yourself', icon: MessageSquareText, hint: 'Put the idea into your own words.' },
};

export function activityType(a: Activity): ActivityType {
  return a.kind === 'choice' ? a.variant : a.kind;
}

export function ActivityBadge({ type }: { type: ActivityType }) {
  const { label, icon: Icon } = ACTIVITY_META[type];
  return (
    <span className="activity-badge" data-type={type}>
      <span className="activity-badge__icon" aria-hidden="true"><Icon size={14} strokeWidth={2.2} /></span>
      {label}
    </span>
  );
}
