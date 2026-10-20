import { readFileSync } from 'node:fs';

// The A2Z sheet and the interview Q&As are fixed content, so they live in JSON files
// and are loaded into memory once when the server starts (no database needed for them).
const load = (name) => JSON.parse(readFileSync(new URL(`./${name}`, import.meta.url), 'utf8'));

const raw = load('a2z.json');
const LEVEL = { E: 'Easy', M: 'Medium', H: 'Hard', '-': '' };

// a2z.json stores each row as a short array to keep the file small; turn it into readable objects
export const steps = raw.steps.map(([name, plan], index) => ({ index, name, plan }));
export const problems = raw.rows.map((r, i) => ({
  n: i + 1,
  step: r[0],
  topic: r[1],
  title: r[2],
  type: r[3] === 'P' ? 'practice' : 'learn',
  level: LEVEL[r[4]] ?? '',
  leetcode: r[5] ? `https://leetcode.com/problems/${r[5]}${r[5].includes('/') ? '' : '/'}` : '',
  tuf: `https://takeuforward.org/${r[6]}`,
  video: r[7] || '',
  article: r[8] ? `https://takeuforward.org/blogs/data-structure-and-algorithm/${r[8]}` : '',
  code: r[9] ? `https://github.com/megh-bari/Striver-A2Z-DSA-Sheet/blob/main/${r[9]}` : '',
  altCode: r[10] ? `https://github.com/dhruv-yadav-nitj/striver-a2z-dsa-cpp/blob/main/${r[10]}` : '',
  key: r[11],
}));
export const problemByKey = new Map(problems.map((p) => [p.key, p]));

// Interview prep: 14 topics. The list view only needs titles and counts; the reader needs everything.
const PDF = { '01': '01_JavaScript', '02': '02_HTML', '03': '03_CSS', '04': '04_React', '05': '05_NodeJS', '06': '06_ExpressJS', '07': '07_NextJS', '08': '08_MongoDB', '09': '09_SQL_and_Queries', '10': '10_DSA', '11': '11_OpenCV', '12': '12_Python', '13': '13_Cpp', '14': '14_Java' };
export const prepTopics = load('qa.json').map((d) => ({
  id: d.id,
  title: d.t,
  summary: d.sub,
  pdf: `/docs/${PDF[d.id.slice(0, 2)]}_Interview_QA.pdf`,
  sections: d.secs.map((s) => ({
    name: s.n,
    questions: s.q.map((q) => ({ question: q.q, mostAsked: !!q.s, answer: q.a.map(([kind, text]) => ({ kind, text })) })),
  })),
}));
