import type { LearningPath, PathId } from './types';

export const PATH_NAMES: Record<PathId, string> = {
  web: 'Website',
  finance: 'Finance tracker',
  chess: 'Chess',
  automation: 'Business automation',
};

/**
 * The four project paths. Timelines are the provisional ranges from the
 * master plan (5–7 hours a week). Milestones are the first draft and will be
 * refined when each path's lessons are written in Phase 4.
 */
export const PATHS: LearningPath[] = [
  {
    id: 'web',
    name: 'Interactive website',
    project: 'An attractive, accessible website that grows into a React app',
    pitch: 'Learn how pages are structured, styled and made interactive, then rebuild them with reusable components.',
    aiFeature: 'An AI design assistant that turns a written description into a structured interface spec, rendered by ordinary code.',
    timeline: { early: '4–8 weeks', capable: '3–6 months', advanced: '9–18+ months' },
    milestones: [
      { id: 'web-1', title: 'A page that works on any screen', deliverable: 'A semantic, responsive single page', estimate: '2–3 weeks', skills: ['how-web-works', 'html', 'css-layout'] },
      { id: 'web-2', title: 'Make it respond', deliverable: 'Interactive sections and a validated form', estimate: '2–4 weeks', skills: ['js-basics', 'dom-events', 'accessibility'] },
      { id: 'web-3', title: 'Rebuild with components', deliverable: 'The site as a React + TypeScript app', estimate: '6–10 weeks', skills: ['react', 'typescript'] },
      { id: 'web-4', title: 'AI design assistant', deliverable: 'Description → validated spec → rendered layout', estimate: '4–8 weeks', skills: ['prompt-spec', 'structured-outputs'] },
    ],
  },
  {
    id: 'finance',
    name: 'Finance tracker',
    project: 'Transactions, categories, budgets and summaries with saved data',
    pitch: 'Learn to model data, calculate correctly, store it in a database and protect it behind a login.',
    aiFeature: 'AI-suggested categories and plain-language summaries. The numbers themselves stay deterministic and tested.',
    timeline: { early: '8–12 weeks', capable: '5–9 months', advanced: '12–24+ months' },
    milestones: [
      { id: 'fin-1', title: 'Track transactions', deliverable: 'Add, edit and list transactions in the browser', estimate: '3–4 weeks', skills: ['js-basics', 'data-structures', 'dom-events'] },
      { id: 'fin-2', title: 'Budgets you can trust', deliverable: 'Tested calculations, filters and monthly summaries', estimate: '4–6 weeks', skills: ['js-functions', 'testing'] },
      { id: 'fin-3', title: 'A real database', deliverable: 'Data stored with SQL behind a small server', estimate: '6–10 weeks', skills: ['sql', 'backend', 'http-apis'] },
      { id: 'fin-4', title: 'Accounts and AI help', deliverable: 'Login, per-user data, and AI category suggestions you approve', estimate: '8–12 weeks', skills: ['auth', 'security', 'model-apis'] },
    ],
  },
  {
    id: 'chess',
    name: 'Chess game',
    project: 'A real, playable chess game with a computer opponent',
    pitch: 'Learn program logic, data structures and testing by encoding the rules of chess, then teach the computer to play.',
    aiFeature: 'A classic game-playing AI: minimax search, alpha-beta pruning and position evaluation.',
    timeline: { early: '1–3 weeks to playable basics', capable: 'Complete game and opponent over the following months', advanced: '9–18+ months' },
    milestones: [
      { id: 'chess-1', title: 'Board and pieces', deliverable: 'A board you can move pieces on', estimate: '1–3 weeks', skills: ['js-basics', 'data-structures', 'dom-events'] },
      { id: 'chess-2', title: 'Legal moves only', deliverable: 'Move rules, check and checkmate, with tests', estimate: '4–8 weeks', skills: ['js-functions', 'testing', 'debugging'] },
      { id: 'chess-3', title: 'A first opponent', deliverable: 'A computer player that picks reasonable moves', estimate: '3–6 weeks', skills: ['algorithms'] },
      { id: 'chess-4', title: 'Thinking ahead', deliverable: 'Minimax with alpha-beta pruning and evaluation', estimate: '6–12 weeks', skills: ['algorithms'] },
    ],
  },
  {
    id: 'automation',
    name: 'Business automation',
    project: 'Automated workflows that grow into an AI sales follow-up agent',
    pitch: 'Learn how systems talk to each other, then build controlled, logged, testable AI agents with human handoffs.',
    aiFeature: 'Capstone: a white-label lead follow-up agent with approved knowledge, tools, guardrails and human approval.',
    timeline: { early: '8–12 weeks to a simulated workflow', capable: '6–12 months', advanced: '12–24+ months' },
    milestones: [
      { id: 'auto-1', title: 'A simulated lead workflow', deliverable: 'Fake lead in → validated data → logged reply draft', estimate: '8–12 weeks', skills: ['http-apis', 'json', 'js-functions'] },
      { id: 'auto-2', title: 'A small service', deliverable: 'A backend that receives webhooks and stores leads', estimate: '6–10 weeks', skills: ['backend', 'sql', 'security'] },
      { id: 'auto-3', title: 'Model calls with structure', deliverable: 'Validated structured outputs with retries and fallbacks', estimate: '6–10 weeks', skills: ['model-apis', 'structured-outputs', 'prompt-injection'] },
      { id: 'auto-4', title: 'A controlled agent', deliverable: 'Tool calls, stopping rules, logs and human handoff on synthetic data', estimate: '10–16 weeks', skills: ['tool-calling', 'agent-loops', 'ai-evaluation'] },
    ],
  },
];

export function getPath(id: string): LearningPath | undefined {
  return PATHS.find((p) => p.id === id);
}
