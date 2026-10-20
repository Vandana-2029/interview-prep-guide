import { Router } from 'express';
import { steps, problems, prepTopics } from '../data/sheet.js';
import { httpError } from '../middleware/errorHandler.js';

const router = Router();

// GET /api/sheet  -> all 20 steps and 495 problems (public, same for everyone)
router.get('/sheet', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600'); // the browser can reuse it for an hour
  res.json({ steps, problems });
});

// GET /api/prep  -> the 14 topics without their answers (for the topic cards)
router.get('/prep', (req, res) => {
  res.json(
    prepTopics.map(({ sections, ...t }) => ({
      ...t,
      total: sections.reduce((n, s) => n + s.questions.length, 0),
      mostAsked: sections.reduce((n, s) => n + s.questions.filter((q) => q.mostAsked).length, 0),
    }))
  );
});

// GET /api/prep/:id  -> one topic with every question and answer
router.get('/prep/:id', (req, res) => {
  const topic = prepTopics.find((t) => t.id === req.params.id);
  if (!topic) throw httpError(404, 'Topic not found.');
  res.json(topic);
});

export default router;
