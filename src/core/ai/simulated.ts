import { GLOSSARY } from '@/content/glossary';
import { LESSONS } from '@/content/lessons';
import { explainError } from '@/core/lab/explainError';
import { reviewCode, SEVERITY_LABEL } from './codeReview';
import { coachPrompt } from './promptCoach';
import type { AIProvider, AIRequest, AIResponse, QuizQuestion } from './types';

/**
 * The simulated provider. It is not a model and never pretends to be: every
 * answer comes from fixed rules and the academy's own content, and the screen
 * labels it "Simulated". It needs no network and costs nothing.
 */

const TOPICS: { test: RegExp; questions: string[] }[] = [
  { test: /\b(loop|for|while|forever|infinite|never stops?)\b/i, questions: ['What has to become false for the loop to stop? Point to the exact condition.', 'Does anything inside the loop change the value that condition checks? Add a console.log to see it each time round.'] },
  { test: /\b(function|return|undefined|argument|parameter)\b/i, questions: ['What do you expect this function to give back? Is there a return line on every path through it?', 'If you call it with the simplest possible input, what happens? Try it on its own.'] },
  { test: /\b(array|list|index|map|filter|reduce)\b/i, questions: ['What\'s at index 0, and what\'s the last index? (Hint: count the items.)', 'Does the method you\'re using change the original array, or return a new one?'] },
  { test: /\b(object|property|key|dot)\b/i, questions: ['Log the whole object. Does the key you\'re reading exist, spelled exactly the same way?', 'Is the value you need nested one level deeper than you\'re looking?'] },
  { test: /\b(css|style|layout|flex|grid|center|align|margin|padding)\b/i, questions: ['Which element is the container, and which are the items? Flex and grid rules go on the container.', 'Open the preview and add a temporary outline: 1px solid red to see each box. Which one is a different size than you expected?'] },
  { test: /\b(click|event|button|listener|submit|form)\b/i, questions: ['Is the listener attached to the element you\'re actually clicking? Log something at the very top of the handler.', 'For forms: what does the browser do by default on submit, and how do you stop it?'] },
  { test: /\b(json|parse|stringify)\b/i, questions: ['Is the thing you\'re parsing really text? What does typeof say?', 'Paste the exact text into the console: does JSON.parse fail? Which character does the error point to?'] },
  { test: /\b(api|fetch|request|response|status|webhook|http)\b/i, questions: ['What status code came back, and what does that number mean?', 'Are you reading the response body (await response.json()) before using it?'] },
  { test: /\b(prompt|model|ai|llm|token)\b/i, questions: ['Could two people read your prompt and expect different answers? Which words could they read differently?', 'How would you check whether the answer is right, without trusting the model?'] },
];
const GENERIC = ['What did you expect to happen, and what happened instead? Be as specific as you can.', 'What\'s the smallest piece you could test on its own to narrow it down?'];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function socratic(input: string): string {
  const topic = TOPICS.find((t) => t.test.test(input));
  const qs = topic?.questions ?? GENERIC;
  return `Let's work it out together. Two questions:\n\n1. ${qs[0]}\n2. ${qs[1]}\n\nTry one, then tell me what you found.`;
}

function explain(input: string): string {
  const q = input.toLowerCase();
  const term = GLOSSARY.filter((g) => new RegExp(`\\b${g.term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?\\b`).test(q)).sort((a, b) => b.term.length - a.term.length)[0];
  if (!term) {
    const some = GLOSSARY.slice(0, 6).map((g) => g.term).join(', ');
    return `The simulated mentor can only explain terms from the academy's glossary, and I didn't find one in your question. Try a term such as ${some}, or open the glossary in Learn. A connected model can answer free-form questions.`;
  }
  const lesson = LESSONS.find((l) => l.sections.some((s) => s.body.some((b) => b.toLowerCase().includes(term.term.toLowerCase()))));
  const related = term.related?.length ? `\n\nRelated: ${term.related.join(', ')}.` : '';
  const more = lesson ? `\n\nIt comes up in the lesson "${lesson.title}".` : '';
  return `${term.term}: ${term.definition}${related}${more}\n\nCheck yourself: can you describe it in one sentence without looking?`;
}

function debug(input: string): string {
  const errLine = /(\w*Error\b:?[^\n]*|is not defined|is not a function|Cannot read propert[^\n]*)/.exec(input)?.[0];
  const explained = errLine ? explainError(errLine.replace(/^Uncaught\s+/, '').replace(/^\w*Error:\s*/, '')) : null;
  const err = explained && explained.title !== 'Something went wrong' ? explained : null;
  const symptom = input.trim().replace(/\s+/g, ' ').slice(0, 140);
  return [
    `1. The symptom: “${symptom}${input.trim().length > 140 ? '…' : ''}”`,
    err ? `2. A likely cause: ${err.title}. ${err.explanation}` : '2. A hypothesis: name one specific thing that could cause this. If you can\'t, add console.log lines before and after the spot where it goes wrong.',
    err ? `3. One experiment: ${err.tip}` : '3. One experiment: change one thing, run it, and see whether the symptom changes. If not, undo it and try the next idea.',
    '\nWhat did the experiment show?',
  ].join('\n');
}

function quiz(input: string): QuizQuestion {
  const q = input.toLowerCase();
  const words = q.split(/\W+/).filter((w) => w.length > 2);
  const pool = LESSONS.flatMap((l) => l.review.filter((r) => r.kind === 'choice').map((r) => ({ l, r })));
  const scored = pool.map((p) => ({ p, score: words.filter((w) => `${p.l.title} ${p.l.skill} ${p.r.prompt}`.toLowerCase().includes(w)).length })).sort((a, b) => b.score - a.score);
  const best = scored[0]!.score > 0 ? scored.filter((s) => s.score === scored[0]!.score) : scored;
  const { l, r } = best[hash(q) % best.length]!.p;
  if (r.kind !== 'choice') throw new Error('unreachable');
  return { prompt: r.prompt, code: r.code, options: r.options.map((o, i) => ({ key: String.fromCharCode(65 + i), text: o.text, correct: o.correct, why: o.why })), from: l.title };
}

export function simulate(req: AIRequest): AIResponse {
  if (req.task === 'prompt-test') {
    const report = coachPrompt(req.input);
    const missing = report.checks.filter((c) => !c.passed).map((c) => c.label.toLowerCase());
    return {
      source: 'simulated',
      text: `No model is connected, so nothing was generated. Connect the local server (Settings → AI) to see a real answer.\n\nThe coach's read: ${report.passed} of ${report.checks.length} parts present.${missing.length ? ` Missing: ${missing.join(', ')}.` : ' A model has everything it needs.'}`,
    };
  }
  switch (req.mode ?? 'socratic') {
    case 'socratic':
      return { source: 'simulated', text: socratic(req.input) };
    case 'explain':
      return { source: 'simulated', text: explain(req.input) };
    case 'debug':
      return { source: 'simulated', text: debug(req.input) };
    case 'quiz': {
      const question = quiz(req.input);
      return { source: 'simulated', text: `From "${question.from}":`, quiz: question };
    }
    case 'review': {
      const files = req.code ?? { html: '', css: '', js: /[;{}()=]/.test(req.input) ? req.input : '' };
      if (!files.html.trim() && !files.css.trim() && !files.js.trim()) return { source: 'simulated', text: 'Paste some code to review (or open the reviewer from the Code Lab, which reviews your current files).' };
      const findings = reviewCode(files);
      if (!findings.length) return { source: 'simulated', text: 'The rule checks found nothing. That means none of the common problems it knows about, not that the code is correct: run it and check it does what the task asks.', findings };
      const lines = findings.slice(0, 5).map((f, i) => `${i + 1}. [${SEVERITY_LABEL[f.severity]}] ${f.title} (${f.file}, line ${f.line}). ${f.why}`);
      return { source: 'simulated', text: `${findings.length} finding${findings.length === 1 ? '' : 's'} from the rule checks, most important first:\n\n${lines.join('\n')}`, findings };
    }
  }
}

export const simulatedProvider: AIProvider = {
  id: 'simulated',
  async complete(req) {
    return simulate(req);
  },
};
