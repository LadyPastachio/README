import type { LessonInput } from '../schema';

export const lesson: LessonInput = {
  id: 'chess-board-as-data',
  title: 'A chess board as data',
  skill: 'data-structures',
  path: 'chess',
  paths: ['chess'],
  minutes: 20,
  objective: 'Represent a chess board as an array of rows, read and change any square, and convert between square names like "e4" and array positions.',
  whyItMatters:
    'Before a computer can play chess, it needs a way to hold the position in memory. Every later step in your chess game (drawing the board, legal moves, the computer opponent) reads and changes this one structure, so getting it clear now saves pain later.',
  prerequisites: ['arrays-and-objects'],
  sections: [
    {
      heading: 'Rows of squares',
      body: [
        'A chess board is 8 rows of 8 squares, so a natural shape is an array of 8 arrays: board[row][col]. Row 0 is the top of the board (Black\'s back rank) and column 0 is the a-file on the left.',
        'Each square holds a piece code such as "wP" (white pawn) or "bK" (black king), or null when it\'s empty. Keeping empty squares as null means every row is always exactly 8 long, so positions never shift.',
      ],
      code: 'const board = [\n  ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],\n  ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],\n  [null, null, null, null, null, null, null, null],\n  // … four more empty rows …\n  ["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],\n  ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"],\n];\nboard[7][4]; // "wK": row 7, column 4',
    },
    {
      heading: 'From "e4" to [row][col]',
      body: [
        'Players name squares by file (a–h) and rank (1–8). To find the column, look up the letter\'s position in "abcdefgh". Ranks count up from White\'s side, but our rows count down from the top, so row = 8 - rank.',
        'So e4 is column 4 (e is the fifth letter, index 4) and row 8 - 4 = 4.',
      ],
      code: 'function toIndex(square) {\n  const col = "abcdefgh".indexOf(square[0]);\n  const row = 8 - Number(square[1]);\n  return [row, col];\n}\ntoIndex("e4"); // [4, 4]\ntoIndex("a8"); // [0, 0]',
    },
  ],
  activities: [
    {
      kind: 'choice',
      id: 'predict-rows',
      variant: 'predict',
      prompt: 'What does this print?',
      code: 'const board = [\n  ["r", "n", "b"],\n  ["p", "p", "p"],\n  [null, null, null],\n];\nconsole.log(board[1][2], board[2][0]);',
      options: [
        { id: 'a', text: 'p null', correct: true, why: 'Right. board[1] is the second row (all "p"), and its index 2 is "p". board[2][0] is the first square of the empty row: null.' },
        { id: 'b', text: 'b null', correct: false, why: '"b" is board[0][2]. The first index picks the row, the second picks the column.', misconception: 'Swaps row and column indexes' },
        { id: 'c', text: 'p undefined', correct: false, why: 'The square exists and holds null on purpose. undefined would mean there\'s no square there at all.' },
        { id: 'd', text: 'n p', correct: false, why: 'Count from 0: board[1] is the second row, not the first.', misconception: 'Thinks arrays start counting at 1' },
      ],
    },
    {
      kind: 'fill',
      id: 'fill-indexof',
      prompt: 'Find the column number for a file letter.',
      code: 'const col = "abcdefgh".___("e");\nconsole.log(col); // 4',
      accepted: ['indexOf'],
      explanation: 'indexOf returns the position of the first match in a string or array, starting from 0.',
      commonWrong: [
        { answer: 'find', why: 'find works on arrays and needs a function. For "where is this letter?" use indexOf.' },
        { answer: 'includes', why: 'includes only answers yes or no. You need the position.' },
      ],
    },
    {
      kind: 'choice',
      id: 'why-null',
      variant: 'concept',
      prompt: 'Why store empty squares as null instead of leaving them out of the row?',
      options: [
        { id: 'a', text: 'Every row stays 8 long, so board[row][col] always points at the same square.', correct: true, why: 'Right. If empty squares were removed, the pieces after them would shift left and every position would be wrong.' },
        { id: 'b', text: 'null takes less memory than a string.', correct: false, why: 'Memory isn\'t the point here. Keeping positions stable is.' },
        { id: 'c', text: 'JavaScript arrays can\'t have gaps.', correct: false, why: 'They can, which is exactly why you choose to fill them explicitly with null.' },
      ],
    },
    {
      kind: 'explain',
      id: 'explain-board',
      prompt: 'Explain how you would find which piece is on f7 using this board structure.',
      lookFor: ['Column: "abcdefgh".indexOf("f") is 5', 'Row: 8 - 7 = 1', 'Read board[1][5]'],
    },
  ],
  review: [
    {
      kind: 'choice',
      id: 'review-row',
      variant: 'predict',
      prompt: 'Using row = 8 - rank, which row index holds rank 1 (White\'s back rank)?',
      options: [
        { id: 'a', text: '7', correct: true, why: 'Right: 8 - 1 = 7, the bottom row.' },
        { id: 'b', text: '1', correct: false, why: 'That ignores the flip. Our rows count down from the top.', misconception: 'Swaps row and column indexes' },
        { id: 'c', text: '0', correct: false, why: 'Row 0 is the top: rank 8.' },
      ],
    },
    {
      kind: 'fill',
      id: 'review-empty',
      prompt: 'Empty the square a piece just moved from.',
      code: 'board[fromRow][fromCol] = ___;',
      accepted: ['null'],
      explanation: 'null marks an empty square, keeping the row 8 long.',
      commonWrong: [{ answer: 'undefined', why: 'Use null to say "empty on purpose". undefined usually means something is missing by mistake.' }],
    },
  ],
  misconceptions: [
    { myth: 'board[x][y] means column then row.', reality: 'With an array of rows, the first index is the row and the second is the column.' },
    { myth: 'Rank 1 is row 1.', reality: 'Our rows count from the top, so rank 1 is row 7: row = 8 - rank.' },
  ],
  hints: ['The first index picks the row, the second picks the column.', 'Count from 0: the first row is board[0].', 'For rows, flip the rank: row = 8 - rank.'],
  masteryRequirement: 'Read squares from a 2D board, convert square names to indexes, and explain why empty squares are null, without hints.',
};
