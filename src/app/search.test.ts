import { buildSearchIndex, search, slug } from './search';

describe('search', () => {
  const index = buildSearchIndex();
  it('finds glossary terms, skills, paths and pages', () => {
    expect(search(index, 'json').map((r) => r.kind)).toEqual(expect.arrayContaining(['Glossary', 'Skill']));
    expect(search(index, 'chess')[0]?.kind).toBe('Path');
    expect(search(index, 'settings')[0]).toMatchObject({ kind: 'Page', to: '/settings' });
  });
  it('ranks title matches above description matches', () => {
    const r = search(index, 'server');
    expect(r[0]?.title.toLowerCase()).toContain('server');
  });
  it('puts exact title matches first', () => {
    expect(search(index, 'prompt injection')[0]).toMatchObject({ kind: 'Glossary', title: 'Prompt injection' });
  });
  it('returns nothing for blank queries', () => {
    expect(search(index, '   ')).toEqual([]);
  });
  it('makes URL-safe anchors', () => {
    expect(slug('Large language model (LLM)')).toBe('large-language-model-llm');
  });
});
