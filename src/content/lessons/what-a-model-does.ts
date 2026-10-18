import type { LessonInput } from '../schema';

type LessonFile = Omit<LessonInput, 'alternatives'>;

export const lesson: LessonFile = {
  id: 'what-a-model-does',
  title: 'What a language model actually does',
  skill: 'ai-literacy',
  paths: ['web', 'finance', 'chess', 'automation'],
  minutes: 15,
  objective: 'Explain in plain terms how a language model produces text, why it can be confidently wrong, and when ordinary code is the better tool.',
  whyItMatters:
    'Your capstone is an AI sales agent, and two of your paths add AI features. Knowing what a model is good at, and what it can\'t be trusted with, decides where you put guardrails: which answers must come from approved sources, and which numbers must come from code.',
  prerequisites: [],
  sections: [
    {
      heading: 'Predicting the next piece of text',
      body: [
        'A large language model (LLM) was trained on huge amounts of text to predict what comes next. Your prompt is split into tokens (chunks of words), and the model produces a likely next token, then the next, one at a time.',
        'This simple-sounding process, at enormous scale, produces text that can explain, summarize, translate and write code.',
      ],
    },
    {
      heading: 'Plausible is not the same as true',
      body: [
        'A model generates what sounds right given patterns in its training. It isn\'t looking facts up in a database. When it doesn\'t know something, it can still produce a fluent, confident answer, sometimes called a hallucination.',
        'That\'s why your sales agent must answer only from approved knowledge, and say so when the answer isn\'t there.',
      ],
    },
    {
      heading: 'Models and code have different jobs',
      body: [
        'Ordinary code is deterministic: the same input always gives the same output, and you can test it. A model is flexible but variable: the same prompt can produce different wording each time.',
        'Use code for facts that must be exact: totals, dates, availability, prices. Use a model for language: understanding a message, drafting a reply, summarizing.',
      ],
    },
  ],
  activities: [
    {
      kind: 'order',
      id: 'order-generation',
      prompt: 'Put these steps in order: what happens when you send a prompt to a language model?',
      steps: [
        'Your text is split into tokens',
        'The model reads the tokens in its context',
        'It predicts a likely next token',
        'It adds that token and predicts again, one token at a time',
        'The tokens are turned back into text you can read',
      ],
      feedback: {
        correct: 'Yes. Generation is a loop: predict one token, add it, predict the next.',
        incorrect: 'The model can\'t predict anything until it has read your text as tokens. The answer is then built up one token at a time.',
      },
    },
    {
      kind: 'choice',
      id: 'choose-code',
      variant: 'concept',
      prompt: 'Your finance tracker needs the total of 40 transactions this month. What\'s the best approach?',
      options: [
        { id: 'a', text: 'Calculate the total in code, and optionally ask a model to describe the result in plain language.', correct: true, why: 'Right. Exact numbers come from tested code. The model can help with wording, never with the facts.' },
        { id: 'b', text: 'Paste the transactions into a model and ask for the total.', correct: false, why: 'Models generate likely text, not guaranteed arithmetic. A total that is slightly wrong looks just as confident as a correct one.', misconception: 'Trusts a model for exact arithmetic' },
        { id: 'c', text: 'Ask the model twice and use the answer if both match.', correct: false, why: 'Two matching answers can both be wrong. Code gives a correct, testable answer every time.' },
      ],
    },
    {
      kind: 'choice',
      id: 'why-invented',
      variant: 'concept',
      prompt: 'A chatbot confidently quotes a refund policy the business doesn\'t have. What\'s the best explanation?',
      options: [
        { id: 'a', text: 'It generated text that sounds like a typical refund policy, without checking any real source.', correct: true, why: 'Right. Fluency comes from patterns, not from facts. The fix is to give it approved knowledge and require it to escalate when the answer isn\'t there.' },
        { id: 'b', text: 'It is lying on purpose.', correct: false, why: 'The model has no intention. It produced plausible text, which is why guardrails must be designed in.', misconception: 'Thinks models intentionally deceive' },
        { id: 'c', text: 'Its internet connection failed.', correct: false, why: 'A typical model doesn\'t look things up unless it\'s given a tool to do so. Even then, it can ignore or misread results.' },
      ],
    },
    {
      kind: 'explain',
      id: 'explain-agent-split',
      prompt: 'Think about your sales follow-up agent. Name one job you would give the model and one you would keep in ordinary code, and explain why.',
      lookFor: ['Model: understanding or drafting messages (language)', 'Code: checking the calendar, booking, prices, logging (exact facts and actions)', 'Reason: models are flexible but can be wrong; code is exact and testable'],
    },
  ],
  review: [
    {
      kind: 'choice',
      id: 'review-variation',
      variant: 'concept',
      prompt: 'You send the same prompt twice and get differently worded answers. Why?',
      options: [
        { id: 'a', text: 'Generation includes some randomness in picking each next token.', correct: true, why: 'Right. That variability is useful for writing, and a reason not to rely on a model for exact, repeatable facts.' },
        { id: 'b', text: 'The model learned from your first message.', correct: false, why: 'A model doesn\'t retrain on your chats as you talk. Each answer is generated fresh from the same trained model.', misconception: 'Thinks the model learns from each chat in real time' },
        { id: 'c', text: 'The first answer was a bug.', correct: false, why: 'Variation is normal behavior, not a malfunction.' },
      ],
    },
    {
      kind: 'choice',
      id: 'review-availability',
      variant: 'concept',
      prompt: 'A lead asks "Are you free Thursday at 2pm?" How should the agent decide?',
      options: [
        { id: 'a', text: 'Code checks the real calendar; the model writes the reply using that result.', correct: true, why: 'Right. The fact comes from the calendar, and the model only phrases it.' },
        { id: 'b', text: 'The model answers based on what\'s typical for businesses.', correct: false, why: 'That invents a commitment the business may not be able to keep.', misconception: 'Trusts a model for exact facts' },
        { id: 'c', text: 'Always say yes, then sort it out later.', correct: false, why: 'Never promise something that hasn\'t been verified.' },
      ],
    },
  ],
  misconceptions: [
    { myth: 'A model looks up answers in a database of facts.', reality: 'It predicts likely text from patterns. It needs tools or approved documents to work from real facts.' },
    { myth: 'If it sounds confident, it\'s probably right.', reality: 'Confidence and correctness are unrelated in model output.' },
  ],
  hints: ['Everything starts with turning your text into tokens.', 'Ask whether the task needs an exact, checkable answer.', 'A model has no intentions; it produces plausible text.'],
  masteryRequirement: 'Describe the generation loop and correctly assign tasks to code or to a model, without hints.',
};
