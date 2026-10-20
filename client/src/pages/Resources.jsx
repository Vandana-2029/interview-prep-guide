import { useState } from 'react';
import { useProgress } from '../context/ProgressContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const LINKS = [
  ['https://takeuforward.org/prep-hub/strivers-a2z-dsa-sheet?page=sheet', "Striver's A2Z sheet", 'The official sheet this tracker follows'],
  ['https://www.youtube.com/@takeUforward/playlists', 'takeUforward playlists', "Striver's videos by topic: arrays, trees, graphs, DP"],
  ['https://leetcode.com/problemset/', 'LeetCode', 'Where most "LeetCode" links take you'],
  ['https://github.com/megh-bari/Striver-A2Z-DSA-Sheet', 'A2Z C++ solutions (megh-bari)', 'The GitHub repo you shared'],
  ['https://github.com/dhruv-yadav-nitj/striver-a2z-dsa-cpp', 'A2Z C++ solutions (backup)', 'Also covers strings, heaps, BST, graphs and DP'],
  ['https://www.geeksforgeeks.org/interview-experiences/', 'GfG interview experiences', 'Real rounds from TCS, Infosys, startups'],
  ['https://leetcode.com/discuss/interview-experience', 'LeetCode Discuss', 'Interview experiences posted by candidates'],
  ['https://visualgo.net/en', 'VisuAlgo', 'See trees, graphs and sorting animated'],
];

// Turn your progress into a CSV file (opens in Excel or Google Sheets) and download it
function exportCsv(sheet, progress) {
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = ['#', 'Step', 'Topic', 'Problem', 'Level', 'Status', 'Date done', 'Revise', 'LeetCode', 'Video'];
  const lines = [head.map(q).join(',')];
  for (const p of sheet.problems) {
    const m = progress[p.key] || {};
    lines.push([p.n, sheet.steps[p.step].name, p.topic, p.title, p.level, m.solvedOn ? 'Done' : 'Not started', m.solvedOn || '', m.revise ? 'Yes' : '', p.leetcode, p.video].map(q).join(','));
  }
  const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `my-a2z-progress.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function Resources() {
  const { sheet, progress, resetAll } = useProgress();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="stack">
      <div className="card">
        <h2 className="h-card mb">Learn and practise</h2>
        <div className="res">
          {LINKS.map(([href, title, sub]) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer">
              <b>{title}</b>
              <span>{sub}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="h-card mb">Your rules</h2>
        <ul className="rules">
          <li><b>Minimum day:</b> on a bad day, solve one Easy and tick it. The streak only needs one.</li>
          <li><b>25-minute rule:</b> stuck for 25 minutes? Watch the video, then star the problem to revise.</li>
          <li><b>Revise on day 7:</b> open "Revise ★" in the sheet and re-solve without help.</li>
          <li><b>Say it out loud:</b> tick "I can explain this" only after saying the answer aloud.</li>
        </ul>
        <div className="row mt">
          <button className="btn primary" onClick={() => sheet && exportCsv(sheet, progress)}>Download my progress (CSV)</button>
          {!confirming ? (
            <button className="btn" onClick={() => setConfirming(true)}>Reset all progress</button>
          ) : (
            <>
              <button className="btn danger" onClick={async () => { await resetAll(); setConfirming(false); toast('Progress erased'); }}>Yes, erase everything</button>
              <button className="btn" onClick={() => setConfirming(false)}>Keep it</button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
