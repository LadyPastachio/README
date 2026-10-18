import type { LessonInput } from '../schema';

type LessonFile = Omit<LessonInput, 'alternatives'>;

export const lesson: LessonFile = {
  id: 'conditions',
  title: 'Making decisions with if and else',
  skill: 'js-functions',
  paths: ['web', 'finance', 'chess', 'automation'],
  minutes: 15,
  objective: 'Trace which branch of an if / else if / else chain runs, and spot conditions written in the wrong order.',
  whyItMatters:
    'Programs constantly choose: is this move legal, is this category over budget, should this lead go to a human? An if statement is how code makes those choices, and getting the order of checks wrong is a classic source of bugs.',
  prerequisites: ['values-and-variables'],
  sections: [
    {
      heading: 'Run this only if…',
      body: [
        'An if statement checks a condition. If the condition is true, the code inside its braces runs. If it\'s false, that code is skipped.',
        'Comparisons produce true or false: === (equal), !== (not equal), <, >, <= and >=. Note that = stores a value, while === compares two values.',
      ],
      code: 'const spent = 480;\nconst budget = 400;\n\nif (spent > budget) {\n  console.log("Over budget");\n}',
    },
    {
      heading: 'Choosing one of several',
      body: [
        'else if adds another check, and else catches everything that didn\'t match. JavaScript tests the conditions from top to bottom and runs only the first one that is true. The rest are skipped, even if they would also be true.',
        'That means order matters. Put the most specific checks first.',
      ],
      code: 'if (score >= 90) {\n  grade = "A";\n} else if (score >= 70) {\n  grade = "B";\n} else {\n  grade = "C";\n}',
    },
  ],
  activities: [
    {
      kind: 'choice',
      id: 'predict-chain',
      variant: 'predict',
      prompt: 'What does this print?',
      code: 'const score = 75;\n\nif (score >= 90) {\n  console.log("A");\n} else if (score >= 70) {\n  console.log("B");\n} else {\n  console.log("C");\n}',
      options: [
        { id: 'a', text: 'B', correct: true, why: 'Right. 75 >= 90 is false, so the first branch is skipped. 75 >= 70 is true, so "B" prints and the chain stops.' },
        { id: 'b', text: 'A', correct: false, why: '75 is not greater than or equal to 90, so the first branch is skipped.' },
        { id: 'c', text: 'B, then C', correct: false, why: 'else only runs when none of the earlier conditions matched. Once a branch runs, the rest of the chain is skipped.', misconception: 'Thinks every branch of an if/else chain can run' },
        { id: 'd', text: 'C', correct: false, why: 'else is the fallback, and it\'s only reached if every condition above it is false. 75 >= 70 is true.' },
      ],
    },
    {
      kind: 'choice',
      id: 'bug-order',
      variant: 'bug',
      prompt: 'This should print "Hot" when temp is 30, but it prints "Mild". What\'s wrong?',
      code: 'const temp = 30;\n\nif (temp >= 10) {\n  console.log("Mild");\n} else if (temp >= 25) {\n  console.log("Hot");\n}',
      options: [
        { id: 'a', text: 'The checks are in the wrong order: 30 >= 10 matches first, so the "Hot" check is never reached.', correct: true, why: 'Right. Swap them so the more specific check (>= 25) comes first.' },
        { id: 'b', text: 'It should use === instead of >=.', correct: false, why: '=== checks for exactly one value. The problem is which check runs first.' },
        { id: 'c', text: 'It needs an else at the end.', correct: false, why: 'An else would add a fallback, but the first branch would still catch 30.' },
        { id: 'd', text: 'temp should be the string "30".', correct: false, why: 'Comparing numbers is exactly right here. Making it a string would cause new problems.', misconception: 'Treats a number in quotes as a number' },
      ],
    },
    {
      kind: 'fill',
      id: 'fill-password',
      prompt: 'Passwords must be at least 8 characters. Fill in the comparison so the message only appears when a password is too short.',
      code: 'if (password.length ___ 8) {\n  console.log("Too short");\n}',
      accepted: ['<'],
      explanation: 'A length of 7 or less is too short, which is exactly "less than 8". A password of exactly 8 is allowed.',
      commonWrong: [
        { answer: '<=', why: 'That would reject a password of exactly 8 characters, which meets the rule "at least 8".', misconception: 'Off-by-one at a boundary' },
        { answer: '>', why: 'That shows "Too short" for long passwords, the opposite of what we want.' },
        { answer: '=', why: '= stores a value; it doesn\'t compare. Comparisons use <, >, <=, >=, === or !==.', misconception: 'Confuses = (assign) with === (compare)' },
      ],
    },
    {
      kind: 'explain',
      id: 'explain-order',
      prompt: 'Why does the order of else if branches matter? Use an example from one of your projects.',
      lookFor: ['Only the first true condition runs', 'More specific checks must come before general ones', 'A concrete example (budget levels, move rules, lead priority…)'],
    },
  ],
  review: [
    {
      kind: 'choice',
      id: 'review-two-ifs',
      variant: 'predict',
      prompt: 'What does this print?',
      code: 'const x = 5;\n\nif (x > 3) {\n  console.log("big");\n}\nif (x > 1) {\n  console.log("positive");\n}',
      options: [
        { id: 'a', text: '"big", then "positive"', correct: true, why: 'Right. These are two separate if statements, not a chain, so each one is checked on its own.' },
        { id: 'b', text: 'Only "big"', correct: false, why: 'Only an else if chain stops at the first match. Two separate ifs are both checked.', misconception: 'Treats separate if statements like an else if chain' },
        { id: 'c', text: 'Only "positive"', correct: false, why: '5 > 3 is true, so "big" prints too.' },
      ],
    },
    {
      kind: 'fill',
      id: 'review-adult',
      prompt: 'Print "Adult" for anyone aged 18 or over.',
      code: 'if (age ___ 18) {\n  console.log("Adult");\n}',
      accepted: ['>='],
      explanation: '>= includes 18 itself.',
      commonWrong: [{ answer: '>', why: 'That leaves out people who are exactly 18.', misconception: 'Off-by-one at a boundary' }],
    },
  ],
  misconceptions: [
    { myth: 'Every matching branch in an if / else if chain runs.', reality: 'Only the first true one runs. The rest are skipped.' },
    { myth: '= and === do the same thing.', reality: '= stores a value. === compares two values and gives true or false.' },
  ],
  hints: [
    'Test each condition from the top, using the actual value of the variable.',
    'As soon as one condition is true, run that branch and skip the rest of the chain.',
    'At a boundary, try the exact value (like 8) and check whether it should pass.',
  ],
  masteryRequirement: 'Trace an if / else chain correctly, fix a branch-order bug, and write a correct boundary comparison, without hints.',
};
