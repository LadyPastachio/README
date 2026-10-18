import type { ResultSet } from './sqlRunner';

/**
 * Grades a SQL answer by comparing its result with the reference query's
 * result on the same data. Check tests are keywords:
 *   columns      same number of columns, with the same names (case-insensitive)
 *   rows         same rows, in any order
 *   order        same rows in the same order
 *   uses:<re>    the query text matches a regular expression (e.g. uses:\bJOIN\b)
 *   avoids:<re>  the query text does not match it
 */

export interface SqlCheck {
  id: string;
  criterion: string;
  test: string;
}

const last = (r: ResultSet[]): ResultSet => r[r.length - 1] ?? { columns: [], values: [] };
const norm = (v: unknown) => (typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v);
const rowKey = (row: unknown[]) => JSON.stringify(row.map(norm));

/** Strips comments so "uses:" checks aren't fooled by a keyword in a comment. */
export function stripSqlComments(q: string): string {
  return q.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

export function gradeSql(checks: SqlCheck[], query: string, got: ResultSet[], expected: ResultSet[]): { id: string; passed: boolean }[] {
  const a = last(got);
  const b = last(expected);
  const text = stripSqlComments(query);
  const sameColumns = a.columns.length === b.columns.length && a.columns.every((c, i) => c.toLowerCase() === b.columns[i]!.toLowerCase());
  const sameCount = a.values.length === b.values.length;
  const sorted = (rs: ResultSet) => rs.values.map(rowKey).sort();
  const sameRows = sameCount && a.values[0]?.length === b.values[0]?.length && JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));
  const sameOrder = sameCount && a.values.every((row, i) => rowKey(row) === rowKey(b.values[i]!));
  return checks.map((c) => {
    let passed = false;
    if (c.test === 'columns') passed = sameColumns;
    else if (c.test === 'rows') passed = got.length > 0 && sameRows;
    else if (c.test === 'order') passed = got.length > 0 && sameOrder;
    else if (c.test.startsWith('uses:')) passed = new RegExp(c.test.slice(5), 'i').test(text);
    else if (c.test.startsWith('avoids:')) passed = !new RegExp(c.test.slice(7), 'i').test(text);
    return { id: c.id, passed };
  });
}
