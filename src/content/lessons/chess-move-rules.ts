import type { LessonInput } from "../schema";

type LessonFile = Omit<LessonInput, "alternatives">;

export const lesson: LessonFile = {
  id: "chess-move-rules",
  title: "Move rules as functions",
  skill: "js-functions",
  paths: ["chess"],
  path: "chess",
  minutes: 22,
  objective: "Write functions that return the legal destination squares for a piece, using direction lists, board edges and blocking, and test them on tricky positions.",
  whyItMatters:
    "Your board lets any piece go anywhere. Milestone two makes it a real game: only legal moves. Move rules are a perfect place to practice small, testable functions.",
  prerequisites: ["chess-board-as-data", "game-state", "writing-tests"],
  sections: [
    {
      heading: "One function per piece",
      body: [
        "movesFor(board, row, col) looks at the piece on that square and returns a list of [row, col] squares it may move to. Each piece type gets a helper: knightMoves, rookMoves and so on.",
        "Keep these functions pure: they read the board and return a list, never change anything. That makes them easy to test.",
      ],
    },
    {
      heading: "Directions and edges",
      body: [
        "A knight has eight fixed jumps: [-2,-1], [-2,1], [-1,-2] and so on. Add each to the current square, then drop squares off the board (row or column below 0 or above 7) and squares holding your own piece.",
        "Sliding pieces (rook, bishop, queen) walk one step at a time in each direction until they hit the edge or a piece. An enemy piece can be captured, so include it, then stop.",
      ],
      code: "function rookMoves(board, row, col) {\n  const color = board[row][col][0];\n  const moves = [];\n  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {\n    let r = row + dr, c = col + dc;\n    while (r >= 0 && r < 8 && c >= 0 && c < 8) {\n      const target = board[r][c];\n      if (target && target[0] === color) break;  // own piece: stop before it\n      moves.push([r, c]);\n      if (target) break;                          // enemy: capture, then stop\n      r += dr; c += dc;\n    }\n  }\n  return moves;\n}",
    },
    {
      heading: "Pawns are the tricky ones",
      body: [
        "White pawns move up (row decreases), black pawns down. One step forward if empty; two from the starting row if both squares are empty; diagonal only to capture.",
        "Check, castling, en passant and promotion come later. Get the basic moves right and tested first.",
      ],
    },
  ],
  activities: [
    {
      kind: "choice",
      id: "predict-knight-corner",
      variant: "predict",
      prompt: "On an empty board, how many squares can a knight on a1 (row 7, col 0) reach?",
      code: "const jumps = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];\nconst onBoard = ([r, c]) => r >= 0 && r < 8 && c >= 0 && c < 8;\nconst moves = jumps.map(([dr, dc]) => [7 + dr, 0 + dc]).filter(onBoard);\nconsole.log(moves.length);",
      options: [
        { id: "a", text: "2", correct: true, why: "Right: b3 and c2. Six jumps land off the board and are filtered out." },
        { id: "b", text: "8", correct: false, why: "That's from the middle of the board. In a corner most jumps leave the board.", misconception: "Forgets to filter squares off the board" },
        { id: "c", text: "4", correct: false, why: "Count the jumps with row 5 or 6 and column 1 or 2: only two qualify." },
      ],
    },
    {
      kind: "choice",
      id: "rook-blocked-bug",
      variant: "bug",
      prompt: "This rook can jump over pieces. What's the bug?",
      code: "while (r >= 0 && r < 8 && c >= 0 && c < 8) {\n  const target = board[r][c];\n  if (!target || target[0] !== color) moves.push([r, c]);\n  r += dr; c += dc;\n}",
      options: [
        { id: "a", text: "It never stops walking when it reaches a piece.", correct: true, why: "Right. Add break after an own piece (before adding it) and after an enemy piece (after adding it)." },
        { id: "b", text: "The board edge check is wrong.", correct: false, why: "0 to 7 inclusive is correct." },
        { id: "c", text: "It should use a for loop.", correct: false, why: "The loop type doesn't matter; stopping does." },
      ],
    },
    {
      kind: "fill",
      id: "fill-pawn-direction",
      prompt: "White pawns move up the board (towards row 0). Complete the direction.",
      code: "const dir = color === \"w\" ? ___ : 1;",
      accepted: ["-1"],
      explanation: "Row 0 is black's back rank, so white moves to smaller row numbers: -1.",
      commonWrong: [{ answer: "1", why: "That moves white pawns towards row 7, backwards for white." }],
    },
    {
      kind: "explain",
      id: "explain-tests",
      prompt: "List four test positions for your rook function, and say what bug each one would catch.",
      lookFor: ["Middle of an empty board: 14 moves (basic directions)", "Corner: edges handled", "Own piece adjacent: blocked, not included", "Enemy piece in the line: included as capture, nothing beyond it"],
    },
  ],
  review: [
    {
      kind: "choice",
      id: "review-capture",
      variant: "concept",
      prompt: "A rook's path hits an enemy pawn. What should the move list contain in that direction?",
      options: [
        { id: "a", text: "Every empty square up to the pawn, and the pawn's square, then nothing further.", correct: true, why: "Right. Capture is allowed; jumping isn't." },
        { id: "b", text: "Only the empty squares.", correct: false, why: "Then the rook could never capture." },
        { id: "c", text: "Everything to the edge.", correct: false, why: "That jumps over the pawn." },
      ],
    },
    {
      kind: "choice",
      id: "review-pure",
      variant: "concept",
      prompt: "Why should movesFor return a list instead of moving the piece?",
      options: [
        { id: "a", text: "A pure function is easy to test and reuse: highlight squares, validate clicks, and later let a computer player search moves.", correct: true, why: "Right. Asking and doing are separate jobs." },
        { id: "b", text: "Returning lists is faster.", correct: false, why: "Speed isn't the reason." },
        { id: "c", text: "JavaScript can't change arrays inside functions.", correct: false, why: "It can, which is why keeping it pure is a choice." },
      ],
    },
  ],
  misconceptions: [
    { myth: "Edge squares need special code for every piece.", reality: "One onBoard check handles every piece." },
    { myth: "Sliding pieces can be handled like knights with a longer jump list.", reality: "They must walk step by step so pieces can block them." },
  ],
  hints: ["Which jumps from a1 stay between 0 and 7?", "When should a sliding piece stop?", "Which row number is white's far side?"],
  masteryRequirement: "Predict and fix move-generation code, including edges and blocking, without hints.",
};
