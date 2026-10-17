import type { Skill, SkillArea } from './types';

export const AREA_NAMES: Record<SkillArea, string> = {
  foundations: 'Programming foundations',
  frontend: 'Frontend',
  data: 'Data, backend and security',
  algorithms: 'Algorithms',
  ai: 'AI engineering',
  communication: 'Technical communication',
};

/** The shared competency framework. Every path draws from this one list. */
export const SKILLS: Skill[] = [
  { id: 'how-web-works', name: 'How the web works', area: 'foundations', summary: 'Browsers, servers, requests and responses.', prerequisites: [], paths: ['web', 'finance', 'chess', 'automation'] },
  { id: 'js-basics', name: 'JavaScript basics', area: 'foundations', summary: 'Values, variables, types and expressions.', prerequisites: [], paths: ['web', 'finance', 'chess', 'automation'] },
  { id: 'js-functions', name: 'Functions and logic', area: 'foundations', summary: 'Functions, conditions, loops and return values.', prerequisites: ['js-basics'], paths: ['web', 'finance', 'chess', 'automation'] },
  { id: 'data-structures', name: 'Arrays and objects', area: 'foundations', summary: 'Grouping and looking up data.', prerequisites: ['js-basics'], paths: ['web', 'finance', 'chess', 'automation'] },
  { id: 'debugging', name: 'Debugging', area: 'foundations', summary: 'Reading errors and finding causes methodically.', prerequisites: ['js-basics'], paths: ['web', 'finance', 'chess', 'automation'] },
  { id: 'testing', name: 'Automated testing', area: 'foundations', summary: 'Writing checks that prove code behaves as intended.', prerequisites: ['js-functions'], paths: ['finance', 'chess', 'automation'] },
  { id: 'git', name: 'Git and version control', area: 'foundations', summary: 'Saving history, branching and undoing safely.', prerequisites: [], paths: ['web', 'finance', 'chess', 'automation'] },
  { id: 'html', name: 'HTML structure', area: 'frontend', summary: 'Semantic page structure.', prerequisites: ['how-web-works'], paths: ['web', 'finance', 'chess'] },
  { id: 'css-layout', name: 'CSS and layout', area: 'frontend', summary: 'Styling, flexbox, grid and responsive design.', prerequisites: ['html'], paths: ['web', 'finance', 'chess'] },
  { id: 'dom-events', name: 'DOM and events', area: 'frontend', summary: 'Changing the page in response to people.', prerequisites: ['html', 'js-functions'], paths: ['web', 'finance', 'chess'] },
  { id: 'accessibility', name: 'Accessibility', area: 'frontend', summary: 'Interfaces everyone can use, including by keyboard and screen reader.', prerequisites: ['html'], paths: ['web', 'finance'] },
  { id: 'typescript', name: 'TypeScript', area: 'frontend', summary: 'Types that catch mistakes before code runs.', prerequisites: ['js-functions', 'data-structures'], paths: ['web', 'finance', 'automation'] },
  { id: 'react', name: 'React components', area: 'frontend', summary: 'Building interfaces from reusable pieces with state.', prerequisites: ['dom-events'], paths: ['web', 'finance', 'chess'] },
  { id: 'json', name: 'JSON', area: 'data', summary: 'The text format most systems use to exchange data.', prerequisites: ['data-structures'], paths: ['web', 'finance', 'automation'] },
  { id: 'http-apis', name: 'HTTP and APIs', area: 'data', summary: 'Requests, responses, status codes, webhooks.', prerequisites: ['how-web-works', 'json'], paths: ['web', 'finance', 'automation'] },
  { id: 'sql', name: 'SQL and databases', area: 'data', summary: 'Tables, relationships and queries.', prerequisites: ['data-structures'], paths: ['finance', 'automation'] },
  { id: 'backend', name: 'Backend services', area: 'data', summary: 'Server code that stores data and does privileged work.', prerequisites: ['http-apis'], paths: ['finance', 'automation'] },
  { id: 'auth', name: 'Authentication and authorization', area: 'data', summary: 'Who someone is, and what they are allowed to do.', prerequisites: ['backend'], paths: ['finance', 'automation'] },
  { id: 'security', name: 'Secure design', area: 'data', summary: 'Secrets, validation, least privilege and threat thinking.', prerequisites: ['backend'], paths: ['finance', 'automation'] },
  { id: 'algorithms', name: 'Search algorithms', area: 'algorithms', summary: 'Recursion, minimax, pruning and performance.', prerequisites: ['js-functions', 'data-structures'], paths: ['chess'] },
  { id: 'ai-literacy', name: 'AI literacy', area: 'ai', summary: 'What models do, why they err, and how they differ from ordinary code.', prerequisites: [], paths: ['web', 'finance', 'chess', 'automation'] },
  { id: 'prompt-spec', name: 'Prompts as specifications', area: 'ai', summary: 'Precise instructions, constraints, examples and acceptance criteria.', prerequisites: ['ai-literacy'], paths: ['web', 'finance', 'automation'] },
  { id: 'model-apis', name: 'Model APIs', area: 'ai', summary: 'Calling models: tokens, context, cost, latency, errors.', prerequisites: ['http-apis', 'prompt-spec'], paths: ['web', 'finance', 'automation'] },
  { id: 'structured-outputs', name: 'Structured outputs', area: 'ai', summary: 'Getting data in a known shape, then validating it.', prerequisites: ['model-apis', 'json'], paths: ['web', 'finance', 'automation'] },
  { id: 'prompt-injection', name: 'Prompt injection defense', area: 'ai', summary: 'Keeping untrusted text from overriding your rules.', prerequisites: ['model-apis'], paths: ['automation'] },
  { id: 'tool-calling', name: 'Tool calling', area: 'ai', summary: 'Letting a model request actions your code performs and verifies.', prerequisites: ['structured-outputs'], paths: ['automation'] },
  { id: 'agent-loops', name: 'Controlled agent loops', area: 'ai', summary: 'Plans, state, stopping conditions, approval and recovery.', prerequisites: ['tool-calling'], paths: ['automation'] },
  { id: 'ai-evaluation', name: 'AI evaluation', area: 'ai', summary: 'Measuring whether an AI system does the job, and catching regressions.', prerequisites: ['structured-outputs', 'testing'], paths: ['finance', 'automation'] },
  { id: 'csharp', name: 'C# and .NET', area: 'foundations', summary: 'A typed language for backends and business software (later in the roadmap).', prerequisites: ['js-functions', 'typescript'], paths: ['finance', 'automation'] },
  { id: 'tech-communication', name: 'Describing what you want', area: 'communication', summary: 'Requirements, acceptance criteria, bug reports and trade-offs.', prerequisites: [], paths: ['web', 'finance', 'chess', 'automation'] },
];

export function getSkill(id: string): Skill | undefined {
  return SKILLS.find((s) => s.id === id);
}
