import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { httpError } from '../middleware/errorHandler.js';
import { Progress } from '../models/Progress.js';
import { KnownQuestion } from '../models/KnownQuestion.js';
import { problemByKey, problems, steps } from '../data/sheet.js';
import { countByDay, currentStreak, bestStreak } from '../utils/streak.js';

const router = Router();
router.use(protect); // every route below needs a logged-in user

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/progress -> { progress: { key: { solvedOn, revise } }, known: [qid, ...] }
router.get('/', async (req, res) => {
  const [rows, known] = await Promise.all([
    Progress.find({ user: req.userId }).select('key solvedOn revise -_id').lean(),
    KnownQuestion.find({ user: req.userId }).select('qid -_id').lean(),
  ]);
  const progress = {};
  for (const r of rows) progress[r.key] = { solvedOn: r.solvedOn, revise: r.revise };
  res.json({ progress, known: known.map((k) => k.qid) });
});

// PUT /api/progress/:key  { solved: true|false, revise?: true|false, today: "YYYY-MM-DD" }
// "today" comes from the browser so the date is in the user's own time zone (India, not the server's).
router.put('/:key', async (req, res) => {
  const { key } = req.params;
  if (!problemByKey.has(key)) throw httpError(404, 'Unknown problem.');
  const { solved, revise, today } = req.body ?? {};

  const update = {};
  if (typeof solved === 'boolean') {
    if (solved && !ISO_DAY.test(today || '')) throw httpError(400, 'Send today as YYYY-MM-DD.');
    update.solvedOn = solved ? today : null;
  }
  if (typeof revise === 'boolean') update.revise = revise;
  if (!Object.keys(update).length) throw httpError(400, 'Nothing to update.');

  // upsert = update the document if it exists, create it if it doesn't
  const doc = await Progress.findOneAndUpdate({ user: req.userId, key }, { $set: update }, { upsert: true, new: true, runValidators: true }).lean();

  // A problem that is neither solved nor starred doesn't need a document any more
  if (!doc.solvedOn && !doc.revise) await Progress.deleteOne({ _id: doc._id });
  res.json({ key, solvedOn: doc.solvedOn, revise: doc.revise });
});

// GET /api/progress/stats?today=YYYY-MM-DD -> streaks, calendar counts, totals by level and step
router.get('/stats', async (req, res) => {
  const today = ISO_DAY.test(req.query.today || '') ? req.query.today : new Date().toISOString().slice(0, 10);
  const rows = await Progress.find({ user: req.userId, solvedOn: { $ne: null } }).select('key solvedOn -_id').lean();

  // Only practice problems count: "Learn" lessons can be ticked, but they don't move the streak, calendar or totals
  const practice = problems.filter((p) => p.type === 'practice');
  const practiceKeys = new Set(practice.map((p) => p.key));
  const solved = rows.filter((s) => practiceKeys.has(s.key));

  const byDay = countByDay(solved.map((s) => s.solvedOn));
  const solvedKeys = new Set(solved.map((s) => s.key));

  const byLevel = ['Easy', 'Medium', 'Hard'].map((level) => {
    const all = practice.filter((p) => p.level === level);
    return { level, total: all.length, solved: all.filter((p) => solvedKeys.has(p.key)).length };
  });
  const bySteps = steps.map((s) => {
    const all = practice.filter((p) => p.step === s.index);
    return { step: s.index, total: all.length, solved: all.filter((p) => solvedKeys.has(p.key)).length };
  });

  res.json({
    today,
    streak: currentStreak(byDay, today),
    bestStreak: Math.max(bestStreak(byDay), currentStreak(byDay, today)),
    solvedToday: byDay[today] || 0,
    totalSolved: practice.filter((p) => solvedKeys.has(p.key)).length,
    totalProblems: practice.length,
    byDay,
    byLevel,
    bySteps,
  });
});

// PUT /api/progress/known/:qid  { known: true|false }  (interview questions)
router.put('/known/:qid', async (req, res) => {
  const { qid } = req.params;
  if (!/^\d{2}_[a-z]+:\d+:\d+$/.test(qid)) throw httpError(400, 'Bad question id.');
  if (req.body?.known) await KnownQuestion.updateOne({ user: req.userId, qid }, { $setOnInsert: { user: req.userId, qid } }, { upsert: true });
  else await KnownQuestion.deleteOne({ user: req.userId, qid });
  res.json({ qid, known: !!req.body?.known });
});

// DELETE /api/progress -> wipe everything for this user (the Reset button)
router.delete('/', async (req, res) => {
  await Promise.all([Progress.deleteMany({ user: req.userId }), KnownQuestion.deleteMany({ user: req.userId })]);
  res.status(204).end();
});

export default router;
