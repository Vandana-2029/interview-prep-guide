import { useEffect, useMemo, useRef } from 'react';
import { toISO, prettyDate } from '../utils/dates.js';

// The LeetCode-style calendar: one square per day for the last year, a column per week.
// byDay = { "2026-10-19": 3, ... } from the server. Darker pink = more problems that day.
const level = (n) => (!n ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 5 ? 3 : 4);

export default function Heatmap({ byDay = {} }) {
  const scroller = useRef(null);

  // Build the list of days once per change of data (useMemo = don't redo this on every render)
  const { days, months, total, active } = useMemo(() => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(end);
    start.setDate(start.getDate() - 364);
    start.setDate(start.getDate() - start.getDay()); // begin on a Sunday so each column is one week

    const days = [];
    const months = [];
    let total = 0;
    let active = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const iso = toISO(d);
      const n = byDay[iso] || 0;
      total += n;
      if (n) active++;
      days.push({ iso, n, today: +d === +end });
      if (d.getDay() === 0) months.push(d.getDate() <= 7 ? d.toLocaleDateString('en-IN', { month: 'short' }) : '');
    }
    return { days, months, total, active };
  }, [byDay]);

  // Start scrolled to the right so today is visible on a phone
  useEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth;
  }, [days.length]);

  return (
    <div>
      <div className="hm-head">
        <div>
          <h2 className="h-card">
            <span className="num">{total}</span> {total === 1 ? 'problem' : 'problems'} in the last year
          </h2>
          <div className="muted small">
            Active days <span className="num">{active}</span>
          </div>
        </div>
        <div className="legend">
          Less {[0, 1, 2, 3, 4].map((l) => <i key={l} data-l={l} />)} More
        </div>
      </div>
      <div className="hm-scroll" ref={scroller}>
        <div className="months">
          {months.map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
        <div className="hm" role="img" aria-label={`${total} problems solved in the last year`}>
          {days.map((d) => (
            <i
              key={d.iso}
              data-l={level(d.n)}
              className={d.today ? 'today' : undefined}
              title={`${d.n} problem${d.n === 1 ? '' : 's'} on ${prettyDate(d.iso, { day: 'numeric', month: 'short', year: 'numeric' })}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
