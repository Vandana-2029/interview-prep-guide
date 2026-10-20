import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useProgress } from '../context/ProgressContext.jsx';

// The 14 interview topics as cards, with how many you can already explain.
export default function Prep() {
  const [topics, setTopics] = useState(null);
  const { known } = useProgress();

  useEffect(() => {
    api('/prep').then(setTopics);
  }, []);

  if (!topics) return <div className="card empty">Loading…</div>;
  const total = topics.reduce((n, t) => n + t.total, 0);
  const knownIn = (id) => [...known].filter((q) => q.startsWith(id + ':')).length;

  return (
    <section className="stack">
      <div className="card">
        <div className="eyebrow">Interview Prep</div>
        <h1 className="h-page">{total} interview questions, {topics.length} topics</h1>
        <p className="muted lead">Read the answers here, tick the ones you can say out loud without looking, and open the PDF when you want the full document. ★ means most asked in real interviews.</p>
      </div>
      <div className="prepgrid">
        {topics.map((t) => {
          const k = knownIn(t.id);
          return (
            <div className="pc" key={t.id}>
              <div className="eyebrow">{t.total} questions · {t.mostAsked} ★</div>
              <h3>{t.title}</h3>
              <div className="pbar"><i style={{ width: `${(k / t.total) * 100}%` }} /></div>
              <div className="muted small">You can explain <span className="num">{k}</span> of {t.total}</div>
              <div className="row">
                <Link className="btn primary" to={`/prep/${t.id}`}>Read</Link>
                <a className="btn" href={t.pdf} target="_blank" rel="noopener noreferrer">Open PDF</a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
