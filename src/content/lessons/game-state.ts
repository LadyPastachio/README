import type { LessonInput } from '../schema';

type LessonFile = Omit<LessonInput, 'alternatives'>;

export const lesson: LessonFile = {
  id: 'game-state',
  title: 'Game state: one source of truth',
  skill: 'state',
  path: 'chess',
  paths: ['chess', 'web', 'finance'],
  minutes: 20,
  objective: 'Keep everything the game needs to remember in one state object, change it in response to clicks, and redraw the screen from it.',
  whyItMatters:
    'A chess game has to remember whose turn it is, which piece is selected and where every piece stands. If that information is scattered (some in variables, some only on screen) it drifts out of sync. The same pattern runs a finance tracker\'s transactions and a website\'s menus.',
  prerequisites: ['chess-board-as-data', 'functions'],
  sections: [
    {
      heading: 'What the game remembers',
      body: [
        'State is everything your program needs to remember to draw the screen and decide what happens next. For chess: the board, whose turn it is, and which square (if any) is selected.',
        'Put it in one object. Then there is exactly one place to look when you ask "what is true right now?"',
      ],
      code: 'const state = {\n  board: startingBoard(),\n  turn: "white",\n  selected: null, // e.g. [6, 4] once a square is clicked\n};',
    },
    {
      heading: 'Change the state, then redraw',
      body: [
        'When something happens, like a click, update the state first. Then call one render function that redraws the whole board from the state.',
        'Never treat the screen as the truth. If you read "is there a piece here?" from the page instead of from state, the two will eventually disagree.',
      ],
      code: 'function onSquareClick(row, col) {\n  if (state.selected === null) {\n    state.selected = [row, col];\n  } else {\n    movePiece(state.selected, [row, col]);\n    state.selected = null;\n    state.turn = state.turn === "white" ? "black" : "white";\n  }\n  render(state);\n}',
    },
  ],
  activities: [
    {
      kind: 'order',
      id: 'order-click-flow',
      prompt: 'Put the steps of making a move in order.',
      steps: [
        'The player clicks a square with one of their pieces',
        'The game stores that square as selected in state',
        'The player clicks the destination square',
        'The game moves the piece in the board array and clears the selection',
        'The game switches whose turn it is',
        'render() redraws the board from state',
      ],
      feedback: {
        correct: 'Yes: every step changes state, and only the last one touches the screen.',
        incorrect: 'Think about it as "update the data, then draw". Drawing always comes last.',
      },
    },
    {
      kind: 'choice',
      id: 'predict-turns',
      variant: 'predict',
      prompt: 'What does this print?',
      code: 'const state = { turn: "white" };\n\nfunction endTurn(s) {\n  s.turn = s.turn === "white" ? "black" : "white";\n}\n\nendTurn(state);\nendTurn(state);\nendTurn(state);\nconsole.log(state.turn);',
      options: [
        { id: 'a', text: 'black', correct: true, why: 'Right. It flips three times: black, white, black. The function changes the same object each time.' },
        { id: 'b', text: 'white', correct: false, why: 'Three flips from white land on black. Count them: black, white, black.' },
        { id: 'c', text: 'white, because a function can\'t change an object passed to it', correct: false, why: 'Objects are passed by reference: the function receives the same object and can change its properties.', misconception: 'Thinks functions get a copy of objects' },
      ],
    },
    {
      kind: 'choice',
      id: 'bug-shadow',
      variant: 'bug',
      prompt: 'After a move, the turn should be "black", but this prints "white". Why?',
      code: 'let turn = "white";\n\nfunction finishMove() {\n  // … move the piece …\n  let turn = "black";\n}\n\nfinishMove();\nconsole.log(turn);',
      options: [
        { id: 'a', text: 'let inside the function creates a new, separate variable, so the outer turn never changes.', correct: true, why: 'Right. Remove let inside the function: turn = "black"; then it updates the outer variable. Better still, keep turn in a state object.' },
        { id: 'b', text: 'Functions can\'t change variables at all.', correct: false, why: 'They can change outer variables. This one creates a new one by accident.' },
        { id: 'c', text: 'console.log runs before finishMove.', correct: false, why: 'finishMove() runs first. The problem is which variable it changes.' },
      ],
    },
    {
      kind: 'explain',
      id: 'explain-source',
      prompt: 'Why is it safer to redraw the board from state after every change, instead of moving the piece on screen directly?',
      lookFor: ['The state stays the single source of truth', 'The screen can\'t drift out of sync with the data', 'One render function is easier to test and debug'],
    },
  ],
  review: [
    {
      kind: 'choice',
      id: 'review-truth',
      variant: 'concept',
      prompt: 'To decide whether a click lands on a piece, where should the code look?',
      options: [
        { id: 'a', text: 'In the state\'s board array', correct: true, why: 'Right. The state is the truth; the screen is just a picture of it.' },
        { id: 'b', text: 'At the text shown in the clicked square', correct: false, why: 'The screen can be out of date or styled differently. Read from state.' },
        { id: 'c', text: 'In a separate list of pieces kept just for clicks', correct: false, why: 'A second copy will eventually disagree with the first.' },
      ],
    },
    {
      kind: 'fill',
      id: 'review-ternary',
      prompt: 'Switch the turn to the other player.',
      code: 'state.turn = state.turn === "white" ? ___ : "white";',
      accepted: ['"black"', "'black'"],
      explanation: 'If it\'s white\'s turn, it becomes black\'s; otherwise white\'s.',
      commonWrong: [{ answer: 'black', why: 'Without quotes, black is a variable name, not the text "black".', misconception: 'Treats a number in quotes as a number' }],
    },
  ],
  misconceptions: [
    { myth: 'What\'s on screen is the truth.', reality: 'The state is the truth. The screen is redrawn from it.' },
    { myth: 'let inside a function changes the variable outside.', reality: 'It creates a new variable that only exists inside the function.' },
  ],
  hints: ['Every change updates the data first.', 'Drawing (render) always comes last.', 'Watch for let or const creating a second variable with the same name.'],
  masteryRequirement: 'Order the update-then-render flow, predict changes to a shared state object, and spot a shadowed variable, without hints.',
};
