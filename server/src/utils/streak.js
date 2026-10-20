// Pure functions (no database) so they are easy to test.
// All dates are "YYYY-MM-DD" strings in the user's own time zone.

const DAY = 24 * 60 * 60 * 1000;

// "2026-10-19" -> a number of days since 1970, so we can do date maths without time-zone surprises
export const toDayNumber = (iso) => Math.round(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / DAY);
export const fromDayNumber = (n) => new Date(n * DAY).toISOString().slice(0, 10);

// Count how many problems were solved on each day: { "2026-10-19": 3, ... }
export function countByDay(solvedDates) {
  const counts = {};
  for (const d of solvedDates) counts[d] = (counts[d] || 0) + 1;
  return counts;
}

// Current streak = days in a row, ending today, with at least one solve.
// If you haven't solved anything yet TODAY, the streak is still alive from yesterday
// (LeetCode works the same way: you have until midnight).
export function currentStreak(counts, today) {
  let day = toDayNumber(today);
  if (!counts[fromDayNumber(day)]) day -= 1;
  let streak = 0;
  while (counts[fromDayNumber(day)]) {
    streak += 1;
    day -= 1;
  }
  return streak;
}

// Best streak ever = longest run of consecutive days in the history.
export function bestStreak(counts) {
  const days = Object.keys(counts).map(toDayNumber).sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  for (let i = 0; i < days.length; i++) {
    run = i > 0 && days[i] - days[i - 1] === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}

// Shade for the calendar square: 0 = empty, 4 = darkest pink
export function heatLevel(n) {
  if (!n) return 0;
  if (n === 1) return 1;
  if (n <= 3) return 2;
  if (n <= 5) return 3;
  return 4;
}
