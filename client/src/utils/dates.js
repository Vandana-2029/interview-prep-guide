// Dates as "YYYY-MM-DD" in the user's own time zone (so 11:30 pm in India still counts as today).
const pad = (n) => String(n).padStart(2, '0');
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISO(new Date());

export const prettyDate = (iso, opts = { day: 'numeric', month: 'short' }) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', opts);
};

// Week of the 8-week plan. Week 1 started on Saturday 17 Oct 2026.
export const PLAN_START = new Date(2026, 9, 17);
export function planWeek(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((today - PLAN_START) / (7 * 864e5)) + 1;
}

// Which steps belong to each week of the plan
export const WEEK_STEPS = {
  1: ['Binary Trees'],
  2: ['Binary Trees', 'Binary Search Trees'],
  3: ['Binary Search', 'Sliding Window / 2 Pointer', 'Strings (Basic and Medium)'],
  4: ['Linked-List', 'Heaps', 'Stack / Queues'],
  5: ['Recursion', 'Bit Manipulation', 'Greedy Algorithms'],
  6: ['Greedy Algorithms', 'Graphs'],
  7: ['Graphs', 'Dynamic Programming'],
  8: ['Dynamic Programming'],
};
export const stepsThisWeek = () => WEEK_STEPS[planWeek()] || (planWeek() > 8 ? ['Tries', 'Strings (Advanced Algo)', 'Maths'] : WEEK_STEPS[1]);
