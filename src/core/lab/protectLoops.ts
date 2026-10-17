import { parse } from 'acorn';
import { simple } from 'acorn-walk';
import type { Node } from 'acorn';

/**
 * Two safety steps before learner JavaScript runs:
 *
 * 1. Parse it. A syntax error is reported with its exact line and column,
 *    without running anything.
 * 2. Add a call to __guard() at the start of every loop body. The guard
 *    stops a loop that keeps running for more than a second, so a mistake
 *    like `while (true) {}` can't freeze the whole app.
 *
 * Insertions never add new lines, so line numbers in errors stay correct.
 */

export interface SyntaxProblem {
  message: string;
  line: number;
  column: number;
}

export type ProtectResult = { ok: true; code: string } | { ok: false; error: SyntaxProblem };

type LoopNode = Node & { body: Node };

export function protectLoops(source: string): ProtectResult {
  let ast: Node;
  try {
    ast = parse(source, { ecmaVersion: 'latest', sourceType: 'script', locations: true, allowAwaitOutsideFunction: true });
  } catch (e) {
    const err = e as SyntaxError & { loc?: { line: number; column: number } };
    return {
      ok: false,
      error: {
        // acorn appends " (line:col)"; we report the position separately.
        message: err.message.replace(/\s*\(\d+:\d+\)$/, ''),
        line: err.loc?.line ?? 1,
        column: (err.loc?.column ?? 0) + 1,
      },
    };
  }

  const inserts: { at: number; text: string }[] = [];
  const guardLoop = (node: Node) => {
    const body = (node as LoopNode).body;
    if (body.type === 'BlockStatement') {
      inserts.push({ at: body.start + 1, text: '__guard();' });
    } else {
      inserts.push({ at: body.start, text: '{__guard();' });
      inserts.push({ at: body.end, text: '}' });
    }
  };
  simple(ast, {
    ForStatement: guardLoop,
    ForInStatement: guardLoop,
    ForOfStatement: guardLoop,
    WhileStatement: guardLoop,
    DoWhileStatement: guardLoop,
  });

  let code = source;
  for (const ins of inserts.sort((a, b) => b.at - a.at)) {
    code = code.slice(0, ins.at) + ins.text + code.slice(ins.at);
  }
  return { ok: true, code };
}
