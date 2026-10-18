/**
 * The prompt coach checks a prompt against the parts of a good specification.
 * Rule-based and explainable: each check says what it looked for. It can't
 * tell whether the content is right, only whether the pieces are there.
 */

export interface CoachCheck {
  id: 'task' | 'context' | 'constraints' | 'format' | 'examples' | 'criteria' | 'sources' | 'specific';
  label: string;
  passed: boolean;
  /** What was found, or what to add. */
  detail: string;
}

export interface CoachReport {
  checks: CoachCheck[];
  passed: number;
  vagueWords: string[];
  words: number;
  /** A skeleton of the prompt with missing parts added as placeholders. */
  skeleton: string;
}

const TASK_VERBS = /\b(write|draft|summari[sz]e|classify|extract|list|explain|translate|rewrite|review|generate|create|compare|answer|reply|describe|suggest|convert|categori[sz]e|find|check|plan)\b/i;
const CONTEXT = /\b(you are|act as|for (a|an|my|our)\b|audience|customer|user|reader|beginner|context|background|because|we are|i am|i'm building|our business|the business)\b/i;
const CONSTRAINTS = /\b(must|never|always|only|do not|don't|avoid|at most|no more than|under \d+|maximum|limit|keep it|without)\b/i;
const FORMAT = /\b(json|bullet|list|table|markdown|headings?|format|\d+\s*(words|sentences|paragraphs|items|bullets)|one (sentence|paragraph|word)|fields?|schema|csv|yaml)\b/i;
const EXAMPLES = /\b(for example|e\.g\.|example:|examples:|such as|like this|sample|input:|output:)/i;
const CRITERIA = /\b(should|success|acceptance|criteria|good answer|make sure|check that|so that|the goal|done when|must include|has to)\b/i;
const SOURCES = /\b(only (use|from|answer)|use only|only the (information|text|facts|data)|the (information|text|facts) (below|above)|based on|using the (text|document|information|data) (below|above)|if you (don't|do not) know|if (it's|it is) not (in|there)|say (so|you don't know)|approved|provided (text|information|knowledge)|cite|quote)\b/i;
const VAGUE = ['nice', 'good', 'better', 'great', 'some', 'stuff', 'things', 'etc', 'appropriate', 'professional', 'interesting', 'cool', 'awesome', 'properly', 'basically', 'somehow', 'a bit', 'kind of'];

function findVague(text: string): string[] {
  // "a good answer" describes success criteria, so it isn't vague here.
  const lower = text.toLowerCase().replace(/\bgood (answer|reply|result)\b/g, '');
  return VAGUE.filter((w) => new RegExp(`\\b${w.replace(' ', '\\s+')}\\b`).test(lower));
}

export function coachPrompt(prompt: string): CoachReport {
  const text = prompt.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const vagueWords = findVague(text);
  const m = (re: RegExp) => re.exec(text)?.[0];
  const checks: CoachCheck[] = [
    { id: 'task', label: 'A clear task', passed: !!m(TASK_VERBS), detail: m(TASK_VERBS) ? `Found the action “${m(TASK_VERBS)}”.` : 'Start with what you want done, as a verb: write, classify, summarize, extract…' },
    { id: 'context', label: 'Who it\'s for and why', passed: !!m(CONTEXT), detail: m(CONTEXT) ? `Found context (“${m(CONTEXT)}”).` : 'Say who the output is for and the situation. The same task for a beginner and an expert needs different answers.' },
    { id: 'constraints', label: 'Constraints', passed: !!m(CONSTRAINTS), detail: m(CONSTRAINTS) ? `Found a constraint (“${m(CONSTRAINTS)}”).` : 'Add limits: length, tone, what to avoid, what it must never do.' },
    { id: 'format', label: 'Output format', passed: !!m(FORMAT), detail: m(FORMAT) ? `Found a format (“${m(FORMAT)}”).` : 'Say the shape you want back: 3 bullets, a table, JSON with named fields, under 80 words.' },
    { id: 'examples', label: 'An example', passed: !!m(EXAMPLES), detail: m(EXAMPLES) ? `Found an example (“${m(EXAMPLES)}”).` : 'One short example of a good answer is often worth a paragraph of description.' },
    { id: 'criteria', label: 'What a good answer looks like', passed: !!m(CRITERIA), detail: m(CRITERIA) ? `Found success criteria (“${m(CRITERIA)}”).` : 'Describe how you\'ll judge the answer, so it can aim for that (and so you can test it).' },
    { id: 'sources', label: 'Where facts come from', passed: !!m(SOURCES), detail: m(SOURCES) ? `Found a source rule (“${m(SOURCES)}”).` : 'If facts matter, say which text to use and what to do when the answer isn\'t there ("say you don\'t know").' },
    { id: 'specific', label: 'Specific wording', passed: words >= 12 && vagueWords.length === 0, detail: words < 12 ? `Only ${words} word${words === 1 ? '' : 's'}. Short prompts leave the model to guess.` : vagueWords.length ? `Vague words: ${vagueWords.map((w) => `“${w}”`).join(', ')}. Replace each with something you could check.` : 'No vague words found.' },
  ];
  const missing = checks.filter((c) => !c.passed).map((c) => c.id);
  const skeleton = [
    text || '[Your task, starting with a verb]',
    missing.includes('context') ? '\nContext: [who this is for and the situation]' : '',
    missing.includes('sources') ? '\nUse only the information below. If the answer isn\'t there, say so.\n<information>\n[approved facts]\n</information>' : '',
    missing.includes('constraints') ? '\nConstraints: [length, tone, what to avoid]' : '',
    missing.includes('format') ? '\nFormat: [e.g. 3 bullet points, or JSON with fields …]' : '',
    missing.includes('examples') ? '\nExample of a good answer:\n[one short example]' : '',
    missing.includes('criteria') ? '\nA good answer: [how you\'ll judge it]' : '',
  ].join('');
  return { checks, passed: checks.filter((c) => c.passed).length, vagueWords, words, skeleton };
}
