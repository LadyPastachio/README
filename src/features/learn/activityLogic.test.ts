import { stableShuffle, moveItem, countInPlace } from './activityLogic';

describe('stableShuffle', () => {
  const items = ['a', 'b', 'c', 'd', 'e', 'f'];
  it('is repeatable for the same seed and keeps every item', () => {
    expect(stableShuffle(items, 'x')).toEqual(stableShuffle(items, 'x'));
    expect([...stableShuffle(items, 'x')].sort()).toEqual(items);
  });
  it('never returns the original order', () => {
    for (const seed of ['a', 'b', 'order-steps', 'zz', '1', '2', '3']) {
      expect(stableShuffle(items, seed)).not.toEqual(items);
      expect(stableShuffle(['p', 'q'], seed)).toEqual(['q', 'p']);
    }
  });
});

describe('moveItem / countInPlace', () => {
  it('moves items and ignores moves past the ends', () => {
    expect(moveItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
    expect(moveItem(['a', 'b'], 0, -1)).toEqual(['a', 'b']);
  });
  it('counts correctly placed items', () => {
    expect(countInPlace(['a', 'c', 'b'], ['a', 'b', 'c'])).toBe(1);
    expect(countInPlace(['a', 'b'], ['a', 'b'])).toBe(2);
  });
});
