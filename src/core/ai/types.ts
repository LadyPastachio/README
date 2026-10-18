import type { Finding } from './codeReview';

export const MENTOR_MODES = ['socratic', 'explain', 'review', 'debug', 'quiz'] as const;
export type MentorMode = (typeof MENTOR_MODES)[number];

export const MODE_INFO: Record<MentorMode, { label: string; blurb: string; placeholder: string }> = {
  socratic: { label: 'Guide me', blurb: 'Asks questions that lead you to the answer, without giving it away.', placeholder: 'What are you stuck on? e.g. "My loop never stops"' },
  explain: { label: 'Explain', blurb: 'A short, plain explanation with an example.', placeholder: 'A term or idea, e.g. "What is JSON?"' },
  review: { label: 'Review code', blurb: 'Points out bugs, security and accessibility problems, most important first.', placeholder: 'Paste code to review, or describe what it should do' },
  debug: { label: 'Debug with me', blurb: 'A methodical approach: symptom, hypothesis, one experiment.', placeholder: 'What happens, what you expected, and any error message' },
  quiz: { label: 'Quiz me', blurb: 'One question on a topic, to check what you remember.', placeholder: 'A topic, e.g. "arrays" or "HTTP"' },
};

export interface CodeFiles {
  html: string;
  css: string;
  js: string;
}

export interface AIRequest {
  task: 'mentor' | 'prompt-test';
  mode?: MentorMode;
  input: string;
  context?: string;
  code?: CodeFiles;
}

export interface QuizQuestion {
  prompt: string;
  code?: string;
  options: { key: string; text: string; correct: boolean; why: string }[];
  from: string;
}

export interface AIResponse {
  text: string;
  source: 'simulated' | 'live';
  model?: string;
  usage?: { input: number; output: number };
  remainingToday?: number;
  /** Set when the response came from simulated mode because live failed. */
  notice?: string;
  findings?: Finding[];
  quiz?: QuizQuestion;
}

export interface AIStatus {
  live: boolean;
  model: string | null;
  remainingToday: number | null;
  dailyLimit: number | null;
  reason: string;
}

export interface AIProvider {
  readonly id: 'simulated' | 'local-server';
  complete(req: AIRequest): Promise<AIResponse>;
}
