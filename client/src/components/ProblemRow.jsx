import { useProgress } from '../context/ProgressContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { burstHearts } from '../utils/hearts.js';
import { prettyDate } from '../utils/dates.js';

// One problem: checkbox, title, level, star-to-revise and all its links.
// `compact` is the short version used in "Up next" on the Home page.
export default function ProblemRow({ problem: p, compact = false }) {
  const { progress, setSolved, setRevise, stats, sheet } = useProgress();
  const toast = useToast();
  const mine = progress[p.key] || {};
  const done = !!mine.solvedOn;

  async function onTick(e) {
    const checked = e.target.checked;
    const box = e.target.getBoundingClientRect();
    const hadSolveToday = (stats?.solvedToday || 0) > 0;
    if (checked) burstHearts(box.left + 11, box.top + 11);

    const next = await setSolved(p.key, checked);
    if (!checked || !next) return;
    const step = next.bySteps[p.step];
    if (step.total && step.solved === step.total) {
      burstHearts(innerWidth / 2, innerHeight / 3, 80);
      toast(`Step ${p.step + 1} complete: ${sheet.steps[p.step].name}!`);
    } else if (!hadSolveToday && p.type === 'practice') {
      toast(`Streak: ${next.streak} day${next.streak === 1 ? '' : 's'}`);
    } else {
      toast('Nice, marked done');
    }
  }

  const link = (href, text, cls = '') => (
    <a className={`lk ${cls}`} href={href} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  );

  if (compact) {
    return (
      <div className="pick">
        <input type="checkbox" className="ck" checked={done} onChange={onTick} aria-label={`Mark ${p.title} done`} />
        <span className="t">{p.title}</span>
        {p.level && <span className={`lvl lv-${p.level}`}>{p.level}</span>}
        {p.leetcode ? link(p.leetcode, 'Solve', 'lc') : link(p.tuf, 'Practice')}
      </div>
    );
  }

  return (
    <div className={`prow${done ? ' done' : ''}`}>
      <input type="checkbox" className="ck" checked={done} onChange={onTick} aria-label={`Mark ${p.title} done`} />
      <div className="pmain">
        <div className="ptitle">{p.title}</div>
        <div className="pmeta">
          {p.type === 'learn' && <span className="learn">Learn</span>}
          {p.level && <span className={`lvl lv-${p.level}`}>{p.level}</span>}
          {done && <span className="muted small">done {prettyDate(mine.solvedOn)}</span>}
          <button
            className="rev"
            aria-pressed={!!mine.revise}
            aria-label={`Revise ${p.title}`}
            title="Mark to revise"
            onClick={() => setRevise(p.key, !mine.revise)}
          >
            ★
          </button>
        </div>
      </div>
      <div className="links">
        {p.leetcode && link(p.leetcode, 'LeetCode', 'lc')}
        {link(p.tuf, p.type === 'practice' ? 'Practice' : 'Learn')}
        {p.video
          ? link(p.video, 'Video')
          : link(`https://www.youtube.com/results?search_query=${encodeURIComponent('take u forward ' + p.title)}`, 'Find video', 'dim')}
        {p.article && link(p.article, 'Article')}
        {p.code && link(p.code, 'Code')}
        {p.altCode && link(p.altCode, 'Alt code')}
      </div>
    </div>
  );
}
