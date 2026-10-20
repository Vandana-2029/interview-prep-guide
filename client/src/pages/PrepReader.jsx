import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useProgress } from '../context/ProgressContext.jsx';
import { burstHearts } from '../utils/hearts.js';

// Turns `code` and **bold** in an answer into real elements (without using dangerouslySetInnerHTML)
function Inline({ text }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part.startsWith('**') ? <b key={i}>{part.slice(2, -2)}</b> : part
  );
}

// An answer is a list of blocks: p = paragraph, l = bullet, c = code, t = interview tip
function Answer({ blocks }) {
  const out = [];
  let bullets = [];
  const flush = () => {
    if (bullets.length) out.push(<ul key={`ul${out.length}`}>{bullets}</ul>);
    bullets = [];
  };
  blocks.forEach((b, i) => {
    if (b.kind === 'l') return bullets.push(<li key={i}><Inline text={b.text} /></li>);
    flush();
    if (b.kind === 'p') out.push(<p key={i}><Inline text={b.text} /></p>);
    if (b.kind === 'c') out.push(<pre key={i}><code>{b.text}</code></pre>);
    if (b.kind === 't') out.push(<div className="tip" key={i}><b>Interview tip:</b> <Inline text={b.text} /></div>);
  });
  flush();
  return out;
}

export default function PrepReader() {
  const { id } = useParams();
  const { known, setKnownQuestion } = useProgress();
  const [topic, setTopic] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [starOnly, setStarOnly] = useState(false);

  useEffect(() => {
    api(`/prep/${id}`).then(setTopic).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="card empty">{error} <Link to="/prep">Back to topics</Link></div>;
  if (!topic) return <div className="card empty">Loading…</div>;

  const q = query.trim().toLowerCase();
  const total = topic.sections.reduce((n, s) => n + s.questions.length, 0);
  const knownCount = [...known].filter((k) => k.startsWith(topic.id + ':')).length;
  let number = 0;

  return (
    <section className="stack">
      <div className="card stack-sm">
        <div className="toolbar">
          <Link className="btn" to="/prep">← All topics</Link>
          <h1 className="h-page grow">{topic.title}</h1>
          <a className="btn" href={topic.pdf} target="_blank" rel="noopener noreferrer">Open PDF</a>
        </div>
        <p className="muted lead"><Inline text={topic.summary} /></p>
        <div className="toolbar">
          <input className="search" type="search" placeholder={`Search in ${topic.title}`} value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search questions" />
          <div className="seg" role="group" aria-label="Question filter">
            <button aria-pressed={!starOnly} onClick={() => setStarOnly(false)}>All</button>
            <button aria-pressed={starOnly} onClick={() => setStarOnly(true)}>★ Most asked</button>
          </div>
          <span className="muted small num">{knownCount}/{total} known</span>
        </div>
      </div>

      <div className="reader">
        <nav className="toc card" aria-label="Sections">
          {topic.sections.map((s, si) => (
            <a key={si} href={`#sec-${si}`}>{s.name}</a>
          ))}
        </nav>
        <div className="minw0">
          {topic.sections.map((s, si) => {
            const items = s.questions.map((qq, qi) => {
              number += 1;
              const n = number;
              if (starOnly && !qq.mostAsked) return null;
              const text = (qq.question + ' ' + qq.answer.map((a) => a.text).join(' ')).toLowerCase();
              if (q && !text.includes(q)) return null;
              const qid = `${topic.id}:${si}:${qi}`;
              const isKnown = known.has(qid);
              return (
                <details className={`qa${isKnown ? ' known' : ''}`} key={qid}>
                  <summary>
                    <span className="qn">Q{n}</span>
                    <span><Inline text={qq.question} /></span>
                    {qq.mostAsked ? <span className="star">★ most asked</span> : <span />}
                  </summary>
                  <div className="ans">
                    <Answer blocks={qq.answer} />
                    <label className="know">
                      <input
                        type="checkbox"
                        className="ck"
                        checked={isKnown}
                        onChange={(e) => {
                          const r = e.target.getBoundingClientRect();
                          if (e.target.checked) burstHearts(r.left + 11, r.top + 11, 10);
                          setKnownQuestion(qid, e.target.checked);
                        }}
                      />
                      I can explain this without looking
                    </label>
                  </div>
                </details>
              );
            });
            if (!items.some(Boolean)) return null;
            return (
              <div key={si}>
                <h3 className="sech" id={`sec-${si}`}>{s.name}</h3>
                {items}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
