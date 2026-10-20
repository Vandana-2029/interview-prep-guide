import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import Heatmap from '../components/Heatmap.jsx';
import ProblemRow from '../components/ProblemRow.jsx';
import Flame from '../components/Flame.jsx';
import { planWeek, stepsThisWeek } from '../utils/dates.js';

export default function Home() {
  const { user } = useAuth();
  const { sheet, stats, progress, error } = useProgress();
  const navigate = useNavigate();

  if (error) return <div className="card empty">Could not load your data: {error}</div>;
  if (!sheet || !stats) return <div className="card empty">Loading…</div>;

  const firstName = user.name.split(' ')[0];
  const left = stats.totalProblems - stats.totalSolved;
  const pct = Math.round((stats.totalSolved / stats.totalProblems) * 100);
  const reviseCount = Object.values(progress).filter((p) => p?.revise).length;

  // "Up next": the first 3 unsolved problems from this week's steps of the plan
  const week = planWeek();
  const weekSteps = stepsThisWeek();
  const weekIdx = sheet.steps.filter((s) => weekSteps.includes(s.name)).map((s) => s.index);
  let picks = sheet.problems.filter((p) => p.type === 'practice' && weekIdx.includes(p.step) && !progress[p.key]?.solvedOn);
  if (!picks.length) picks = sheet.problems.filter((p) => p.type === 'practice' && !progress[p.key]?.solvedOn);
  picks = picks.slice(0, 3);

  const todayText =
    stats.solvedToday > 0
      ? `You solved ${stats.solvedToday} today. Streak is safe for today.`
      : stats.streak > 0
        ? `Solve one today to make it ${stats.streak + 1} days.`
        : 'No problem solved yet today. One is enough to start a streak.';

  return (
    <section className="stack">
      <div className="grid g-hero">
        <div className="card hello">
          <div className="eyebrow">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          <h1>
            {stats.totalSolved === 0 ? (
              <>Hi {firstName}, let's start the <em>pink</em> streak.</>
            ) : (
              <>Hi {firstName}, <em>{stats.totalSolved}</em> down, {left} to go.</>
            )}
          </h1>
          <p>Tick a problem when you solve it. Every day you solve at least one, your streak grows and a square on your calendar turns pink.</p>
          <div className="stats">
            <div className="stat"><b className="num">{stats.totalSolved}</b><span>of {stats.totalProblems} problems</span></div>
            <div className="stat"><b className="num">{pct}%</b><span>sheet done</span></div>
            <div className="stat"><b className="num">{reviseCount}</b><span>marked to revise</span></div>
          </div>
        </div>

        <div className="card">
          <div className="streakbox">
            <Flame />
            <div>
              <b className="num">{stats.streak}</b>
              <div className="muted">day streak · best <span className="num">{stats.bestStreak}</span></div>
            </div>
          </div>
          <div className={`today${stats.solvedToday ? ' ok' : ''}`}>{todayText}</div>
          <div className="eyebrow mt">{week >= 1 && week <= 8 ? `Up next · week ${week} of your plan (${weekSteps.join(', ')})` : 'Up next'}</div>
          <div className="picks">
            {picks.length ? picks.map((p) => <ProblemRow key={p.key} problem={p} compact />) : <div className="muted">You finished the whole sheet!</div>}
          </div>
        </div>
      </div>

      <div className="card">
        <Heatmap byDay={stats.byDay} />
      </div>

      <div className="card">
        <h2 className="h-card mb">Solved by level</h2>
        <div className="levels">
          {stats.byLevel.map((l) => (
            <div className="lv" key={l.level}>
              <div className={`lv-${l.level} strong`}>{l.level}</div>
              <div><b className="num big">{l.solved}</b><span className="muted num"> / {l.total}</span></div>
              <div className="bar"><i className={`bg-${l.level}`} style={{ width: `${(l.solved / l.total) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="hm-head">
          <h2 className="h-card">Your 20 steps</h2>
          <span className="muted small">Tap a step to open it</span>
        </div>
        <div className="steps">
          {sheet.steps.map((s) => {
            const st = stats.bySteps[s.index];
            const now = weekSteps.includes(s.name);
            return (
              <button key={s.index} className="stepc" onClick={() => navigate(`/sheet?step=${s.index}`)}>
                <span className="n">Step {s.index + 1} · <span className="num">{st.solved}/{st.total}</span></span>
                <span className="nm">{s.name}</span>
                <span className="pbar"><i style={{ width: `${st.total ? (st.solved / st.total) * 100 : 0}%` }} /></span>
                <span className={`plan${now ? ' now' : ''}`}>{now ? 'This week' : s.plan}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
