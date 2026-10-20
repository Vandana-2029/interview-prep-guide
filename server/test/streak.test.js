import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countByDay, currentStreak, bestStreak, heatLevel } from '../src/utils/streak.js';

test('counts solves per day', () => {
  assert.deepEqual(countByDay(['2026-10-18', '2026-10-19', '2026-10-19']), { '2026-10-18': 1, '2026-10-19': 2 });
});

test('streak counts consecutive days ending today', () => {
  const c = countByDay(['2026-10-17', '2026-10-18', '2026-10-19']);
  assert.equal(currentStreak(c, '2026-10-19'), 3);
});

test('streak is still alive if today is not done yet', () => {
  const c = countByDay(['2026-10-17', '2026-10-18']);
  assert.equal(currentStreak(c, '2026-10-19'), 2);
});

test('a missed day breaks the streak', () => {
  const c = countByDay(['2026-10-15', '2026-10-16', '2026-10-19']);
  assert.equal(currentStreak(c, '2026-10-19'), 1);
  assert.equal(currentStreak(c, '2026-10-21'), 0);
});

test('streak works across a month end', () => {
  const c = countByDay(['2026-10-30', '2026-10-31', '2026-11-01']);
  assert.equal(currentStreak(c, '2026-11-01'), 3);
});

test('best streak finds the longest run', () => {
  const c = countByDay(['2026-01-01', '2026-01-02', '2026-01-03', '2026-02-10', '2026-02-11']);
  assert.equal(bestStreak(c), 3);
  assert.equal(bestStreak({}), 0);
});

test('heat levels', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 9].map(heatLevel), [0, 1, 2, 2, 3, 3, 4]);
});
