/**
 * Turns JavaScript error messages into plain language with a next step.
 * Messages differ slightly between browsers, so patterns are loose.
 */

export interface Explanation {
  title: string;
  explanation: string;
  tip: string;
}

const RULES: { test: RegExp; name?: string; explain: (m: RegExpMatchArray) => Explanation }[] = [
  {
    test: /ran for more than|infinite loop/i,
    explain: () => ({
      title: 'A loop never stopped',
      explanation: 'A loop kept running for over a second, so the lab stopped it to keep the page responsive.',
      tip: 'Check that the loop\'s condition eventually becomes false, for example that a counter actually increases.',
    }),
  },
  {
    test: /^(\S+) is not defined/,
    explain: (m) => ({
      title: `JavaScript doesn't know “${m[1]}”`,
      explanation: `The code uses the name ${m[1]}, but no variable or function with that exact name exists at this point.`,
      tip: 'Check the spelling and capital letters, and that it is declared (with let, const or function) before this line runs.',
    }),
  },
  {
    test: /Cannot read propert(?:y|ies) of (undefined|null)(?: \(reading '([^']+)'\))?|(?:undefined|null) is not an object/i,
    explain: (m) => ({
      title: `Reading from ${m[1] ?? 'nothing'}`,
      explanation: `The code tried to read ${m[2] ? `“${m[2]}” ` : 'a property '}from a value that is ${m[1] ?? 'undefined or null'}, which has no properties.`,
      tip: 'Find the value before the dot on that line. Log it with console.log to see why it is empty. A querySelector that matched nothing returns null.',
    }),
  },
  {
    test: /(\S+) is not a function/,
    explain: (m) => ({
      title: `“${m[1]}” isn't a function`,
      explanation: 'The code tried to call something with () that is not a function. It may be misspelled, or it may be a different type of value.',
      tip: 'Check the name and the type of value. For example, toFixed works on numbers but not on strings.',
    }),
  },
  {
    test: /Assignment to constant variable/i,
    explain: () => ({
      title: 'Changing a const',
      explanation: 'A variable created with const was given a new value. const values can\'t be reassigned.',
      tip: 'If the value really needs to change, create it with let instead.',
    }),
  },
  {
    test: /Unexpected end of input|Unexpected token \(\d+:\d+\)$|Unterminated/i,
    explain: () => ({
      title: 'Something isn\'t closed',
      explanation: 'The code ends before every bracket, brace or quote has been closed.',
      tip: 'Check that every ( has a ), every { has a }, and every quote has a matching quote.',
    }),
  },
  {
    test: /Unexpected token|Unexpected character|missing \)|expected/i,
    explain: () => ({
      title: 'JavaScript couldn\'t read this line',
      explanation: 'There is a typing mistake that stops the code from being understood, so none of it ran.',
      tip: 'Look at the line shown and the one before it: a missing comma, bracket or quote is the usual cause.',
    }),
  },
  {
    test: /has already been declared/i,
    explain: () => ({
      title: 'The same name declared twice',
      explanation: 'Two let or const declarations use the same name in the same place.',
      tip: 'Rename one of them, or remove the second let/const and just assign the new value.',
    }),
  },
];

export function explainError(message: string): Explanation {
  for (const r of RULES) {
    const m = message.match(r.test);
    if (m) return r.explain(m);
  }
  return {
    title: 'Something went wrong',
    explanation: message,
    tip: 'Read the message carefully, go to the line it names, and change one thing at a time.',
  };
}
