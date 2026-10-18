import type { LearningPath, PathId } from './types';

export const PATH_NAMES: Record<PathId, string> = {
  web: 'Website',
  finance: 'Finance tracker',
  chess: 'Chess',
  automation: 'Business automation',
};

/**
 * The four project paths. Timelines are the provisional ranges from the
 * master plan (5–7 hours a week). The first milestone of each path has its
 * full content; later milestones list no requirements yet and show as planned.
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
      {
        id: 'web-1', title: 'A page that works on any screen', deliverable: 'A semantic, responsive profile page with a card layout', estimate: '2–3 weeks', skills: ['how-web-works', 'html', 'css-layout'],
        requires: { lessons: ['how-a-page-reaches-you', 'html-structure', 'flexbox-layout', 'responsive-design'], labs: ['first-page', 'style-a-card', 'responsive-nav', 'profile-page'] },
        project: 'profile-page',
        acceptance: ['Uses header, main and footer', 'Has the viewport tag and a mobile-first media query', 'Cards lay out with grid or flex and never overflow on a phone'],
      },
      {
        id: 'web-2', title: 'Make it respond', deliverable: 'Interactive elements and an accessible form', estimate: '2–4 weeks', skills: ['js-basics', 'dom-events', 'accessibility'],
        requires: { lessons: ['values-and-variables', 'conditions', 'functions', 'reading-errors'], labs: ['counter-button', 'label-the-form', 'fix-the-total'] },
        acceptance: ['Buttons respond to clicks and update the page', 'Every form field has a label', 'You can find and fix an error using the console'],
      },
      { id: 'web-3', title: 'Rebuild with components', deliverable: 'The site as a React + TypeScript app', estimate: '6–10 weeks', skills: ['react', 'typescript'], requires: { lessons: [], labs: [] }, acceptance: [] },
      { id: 'web-4', title: 'AI design assistant', deliverable: 'Description → validated spec → rendered layout', estimate: '4–8 weeks', skills: ['prompt-spec', 'structured-outputs'], requires: { lessons: [], labs: [] }, acceptance: [] },
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
      {
        id: 'fin-1', title: 'Track transactions', deliverable: 'Add transactions with a correct total, and a sorted monthly summary', estimate: '3–4 weeks', skills: ['js-basics', 'data-structures', 'dom-events'],
        requires: { lessons: ['values-and-variables', 'arrays-and-objects', 'money-math', 'filter-map-reduce'], labs: ['fix-the-total', 'add-transaction-form', 'monthly-summary'] },
        project: 'monthly-summary',
        acceptance: ['Amounts are stored and added as whole cents', 'Invalid entries are rejected', 'Spending is totalled by category and sorted'],
      },
      { id: 'fin-2', title: 'Budgets you can trust', deliverable: 'Tested calculations, filters and monthly summaries', estimate: '4–6 weeks', skills: ['js-functions', 'testing'], requires: { lessons: [], labs: [] }, acceptance: [] },
      { id: 'fin-3', title: 'A real database', deliverable: 'Data stored with SQL behind a small server', estimate: '6–10 weeks', skills: ['sql', 'backend', 'http-apis'], requires: { lessons: [], labs: [] }, acceptance: [] },
      { id: 'fin-4', title: 'Accounts and AI help', deliverable: 'Login, per-user data, and AI category suggestions you approve', estimate: '8–12 weeks', skills: ['auth', 'security', 'model-apis'], requires: { lessons: [], labs: [] }, acceptance: [] },
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
      {
        id: 'chess-1', title: 'Board and pieces', deliverable: 'A board you can move pieces on with clicks', estimate: '1–3 weeks', skills: ['data-structures', 'dom-events', 'state'],
        requires: { lessons: ['arrays-and-objects', 'chess-board-as-data', 'game-state'], labs: ['chess-board-row', 'chess-full-board', 'chess-place-pieces', 'chess-click-move'] },
        project: 'chess-click-move',
        acceptance: ['The position lives in a 2D array, the single source of truth', 'All 64 squares and 32 pieces are drawn from that array', 'Click a piece, click a square, and it moves'],
      },
      { id: 'chess-2', title: 'Legal moves only', deliverable: 'Move rules, check and checkmate, with tests', estimate: '4–8 weeks', skills: ['js-functions', 'testing', 'debugging'], requires: { lessons: [], labs: [] }, acceptance: [] },
      { id: 'chess-3', title: 'A first opponent', deliverable: 'A computer player that picks reasonable moves', estimate: '3–6 weeks', skills: ['algorithms'], requires: { lessons: [], labs: [] }, acceptance: [] },
      { id: 'chess-4', title: 'Thinking ahead', deliverable: 'Minimax with alpha-beta pruning and evaluation', estimate: '6–12 weeks', skills: ['algorithms'], requires: { lessons: [], labs: [] }, acceptance: [] },
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
      {
        id: 'auto-1', title: 'A simulated lead workflow', deliverable: 'Synthetic lead in → validated data → reply from approved knowledge, or handoff → logged', estimate: '8–12 weeks', skills: ['http-apis', 'json', 'security'],
        requires: { lessons: ['json-basics', 'http-and-apis', 'validating-input', 'what-a-model-does'], labs: ['parse-lead-webhook', 'lead-workflow'] },
        project: 'lead-workflow',
        acceptance: ['Invalid or malformed leads are rejected, never crash the workflow', 'Answers come only from approved knowledge; anything else goes to a person', 'Every step is logged; instructions inside messages change nothing'],
      },
      { id: 'auto-2', title: 'A small service', deliverable: 'A backend that receives webhooks and stores leads', estimate: '6–10 weeks', skills: ['backend', 'sql', 'security'], requires: { lessons: [], labs: [] }, acceptance: [] },
      {
        id: 'auto-3', title: 'Model calls with structure', deliverable: 'Validated structured outputs with retries and fallbacks', estimate: '6–10 weeks', skills: ['model-apis', 'structured-outputs', 'prompt-injection'],
        requires: { lessons: ['prompts-as-specs', 'calling-a-model-api', 'structured-outputs', 'prompt-injection'], labs: ['validate-model-output', 'injection-guard'] },
        project: 'validate-model-output',
        acceptance: ['Any model output becomes checked data or a clear error, never a crash', 'Unknown fields and values outside the schema are rejected', 'Replies with unapproved links, prices or offers are blocked before sending'],
      },
      {
        id: 'auto-4', title: 'A controlled agent', deliverable: 'Tool calls, stopping rules, logs and human handoff on synthetic data', estimate: '10–16 weeks', skills: ['tool-calling', 'agent-loops', 'ai-evaluation'],
        requires: { lessons: ['tool-calling-loop', 'evaluating-ai'], labs: ['tool-dispatcher', 'eval-harness'] },
        project: 'tool-dispatcher',
        acceptance: ['Only listed tools run, and only with valid arguments', 'Risky actions wait for a person; every call is logged', 'Changes are scored against an evaluation set, and regressions are found case by case'],
      },
    ],
  },
];

export function getPath(id: string): LearningPath | undefined {
  return PATHS.find((p) => p.id === id);
}
