import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext.jsx';
import ProblemRow from '../components/ProblemRow.jsx';
import { stepsThisWeek } from '../utils/dates.js';

const STATUS = [
  ['all', 'All'],
  ['todo', 'To do'],
  ['done', 'Done'],
  ['rev', 'Revise ★'],
];
const LEVELS = [
  ['all', 'Any level'],
  ['Easy', 'Easy'],
  ['Medium', 'Medium'],
  ['Hard', 'Hard'],
];

// A row of toggle buttons (only one pressed at a time)
function Segmented({ options, value, onChange, label }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} aria-pressed={value === v} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}

export default function Sheet() {
  const { sheet, progress, stats } = useProgress();
  const [params] = useSearchParams();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [level, setLevel] = useState('all');
  const [open, setOpen] = useState(() => new Set(params.get('step') ? [Number(params.get('step'))] : []));

  // Coming from a step card on Home: scroll to that step
  useEffect(() => {
    const s = params.get('step');
    if (s) document.getElementById(`step-${s}`)?.scrollIntoView({ block: 'start' });
  }, [params]);

  const filtering = query !== '' || status !== 'all' || level !== 'all';

  // Filter the 495 problems. useMemo re-runs this only when an input changes.
  const visible = useMemo(() => {
    if (!sheet) return [];
    const q = query.trim().toLowerCase();
    return sheet.problems.filter((p) => {
      const mine = progress[p.key];
      if (level !== 'all' && p.level !== level) return false;
      if (status === 'todo' && mine?.solvedOn) return false;
      if (status === 'done' && !mine?.solvedOn) return false;
      if (status === 'rev' && !mine?.revise) return false;
      if (q && !`${p.title} ${p.topic}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [sheet, progress, query, status, level]);

  if (!sheet || !stats) return <div className="card empty">Loading…</div>;
  const thisWeek = stepsThisWeek();

  function toggle(index) {
    setOpen((s) => {
      const n = new Set(s);
      n.has(index) ? n.delete(index) : n.add(index);
      return n;
    });
  }

  const steps = sheet.steps
    .map((s) => ({ ...s, rows: visible.filter((p) => p.step === s.index) }))
    .filter((s) => !filtering || s.rows.length);

  return (
    <section className="stack">
      <div className="card stack-sm">
        <div className="toolbar">
          <input
            className="search"
            type="search"
            placeholder="Search 495 problems, e.g. kadane, LCA, sliding"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search problems"
          />
          <Segmented options={STATUS} value={status} onChange={setStatus} label="Status filter" />
          <Segmented options={LEVELS} value={level} onChange={setLevel} label="Level filter" />
        </div>
        <div className="muted small">
          <b>LeetCode</b> to solve · <b>Practice</b> on takeUforward · <b>Video</b> by Striver · <b>Article</b> with C++ code · <b>Code</b> from the GitHub repo you shared · <b>Alt code</b> from a backup C++ repo · ★ = revise later
        </div>
      </div>

      {steps.length === 0 && <div className="card empty">No problems match. Clear the search or pick another filter.</div>}

      {steps.map((s) => {
        const st = stats.bySteps[s.index];
        const isOpen = filtering || open.has(s.index);
        const topics = [...new Set(s.rows.map((p) => p.topic))];
        return (
          <div className={`step${isOpen ? ' open' : ''}`} id={`step-${s.index}`} key={s.index}>
            <button className="step-head" onClick={() => toggle(s.index)} aria-expanded={isOpen}>
              <span className="snum">{s.index + 1}</span>
              <span className="stitle">
                <span className="h3">{s.name}</span>
                <span className="pbar"><i style={{ width: `${st.total ? (st.solved / st.total) * 100 : 0}%` }} /></span>
              </span>
              <span className="scount">
                <span className="num">{st.solved}/{st.total}</span>
                <span className={`plan${thisWeek.includes(s.name) ? ' now' : ''}`}>{thisWeek.includes(s.name) ? 'This week' : s.plan}</span>
              </span>
            </button>
            {/* Only render the rows of open steps: 495 rows at once would make the page slow */}
            {isOpen &&
              topics.map((t) => (
                <div className="topic" key={t}>
                  <h4>{t || s.name}</h4>
                  {s.rows.filter((p) => p.topic === t).map((p) => <ProblemRow key={p.key} problem={p} />)}
                </div>
              ))}
          </div>
        );
      })}
    </section>
  );
}
