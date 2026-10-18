// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';
import initSqlJs, { type SqlJsStatic } from 'sql.js';
import { LAB_EXERCISES } from '@/content/lab/exercises';
import { gradeSql, stripSqlComments } from './grade';
import type { ResultSet } from './sqlRunner';

let SQL: SqlJsStatic;
beforeAll(async () => {
  SQL = await initSqlJs();
});

function run(setup: string, query: string): ResultSet[] {
  const db = new SQL.Database();
  try {
    db.exec(setup);
    return db.exec(query) as ResultSet[];
  } finally {
    db.close();
  }
}

const SQL_EXERCISES = LAB_EXERCISES.filter((x) => x.language === 'sql');

describe('SQL exercises', () => {
  it('there are SQL exercises', () => {
    expect(SQL_EXERCISES.length).toBeGreaterThanOrEqual(3);
  });

  for (const ex of SQL_EXERCISES) {
    it(`${ex.id}: the reference solution passes every check, and the starter doesn't`, () => {
      const expected = run(ex.sql!.setup, ex.sql!.solution);
      expect(expected.length, 'solution returns rows').toBeGreaterThan(0);
      expect(gradeSql(ex.checks, ex.sql!.solution, expected, expected).every((c) => c.passed)).toBe(true);
      const starter = run(ex.sql!.setup, ex.sql!.starter);
      expect(gradeSql(ex.checks, ex.sql!.starter, starter, expected).some((c) => !c.passed)).toBe(true);
    });
  }
});

describe('grading', () => {
  const setup = "CREATE TABLE t (name TEXT, n INTEGER); INSERT INTO t VALUES ('a', 2), ('b', 1), ('c', 3);";
  const checks = [
    { id: 'columns', criterion: '', test: 'columns' },
    { id: 'rows', criterion: '', test: 'rows' },
    { id: 'order', criterion: '', test: 'order' },
    { id: 'uses', criterion: '', test: 'uses:\\border\\s+by\\b' },
  ];
  const expected = () => run(setup, 'SELECT name, n FROM t ORDER BY n');
  const grade = (q: string) => Object.fromEntries(gradeSql(checks, q, run(setup, q), expected()).map((c) => [c.id, c.passed]));

  it('accepts an equivalent query with different aliases in case and whitespace', () => {
    expect(grade('select NAME, n\nfrom t\norder   by n asc')).toEqual({ columns: true, rows: true, order: true, uses: true });
  });
  it('separates "right rows" from "right order"', () => {
    expect(grade('SELECT name, n FROM t')).toMatchObject({ rows: true, order: false, uses: false });
  });
  it('fails wrong columns and wrong rows', () => {
    expect(grade('SELECT n, name FROM t ORDER BY n')).toMatchObject({ columns: false, rows: false });
    expect(grade('SELECT name, n FROM t WHERE n > 1 ORDER BY n')).toMatchObject({ columns: true, rows: false, order: false });
  });
  it('ignores keywords hidden in comments', () => {
    expect(stripSqlComments('SELECT 1 -- ORDER BY\n/* JOIN */')).not.toMatch(/ORDER|JOIN/);
    expect(grade('SELECT name, n FROM t -- order by n')).toMatchObject({ uses: false });
  });
  it('treats an empty result as not matching', () => {
    expect(grade("SELECT name, n FROM t WHERE name = 'zzz'")).toMatchObject({ rows: false, order: false });
  });
});
