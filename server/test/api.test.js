// End-to-end API test with a throwaway in-memory MongoDB.
// Run: npm test   (the first run downloads a MongoDB binary, so it can take a minute)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';

let mongo;
let app;
let token;
const today = '2026-10-19';

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  // Use TEST_MONGO_URI if you have a local MongoDB running; otherwise start a throwaway one in memory
  let uri = process.env.TEST_MONGO_URI;
  if (!uri) {
    mongo = await MongoMemoryServer.create();
    uri = mongo.getUri();
  }
  await mongoose.connect(uri, { dbName: 'a2z-journey-test' });
  await mongoose.connection.dropDatabase(); // start every run from an empty database
  app = createApp();
});

after(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});

test('sign up, then log in', async () => {
  const reg = await request(app).post('/api/auth/register').send({ name: 'Vandana', email: 'v@example.com', password: 'pinkstreak1' });
  assert.equal(reg.status, 201);
  assert.ok(reg.body.token);
  assert.equal(reg.body.user.passwordHash, undefined); // never leak the hash

  const dup = await request(app).post('/api/auth/register').send({ name: 'V', email: 'v@example.com', password: 'pinkstreak1' });
  assert.equal(dup.status, 409);

  const bad = await request(app).post('/api/auth/login').send({ email: 'v@example.com', password: 'wrong-password' });
  assert.equal(bad.status, 401);

  const ok = await request(app).post('/api/auth/login').send({ email: 'V@Example.com', password: 'pinkstreak1' });
  assert.equal(ok.status, 200);
  token = ok.body.token;
});

test('progress routes need a token', async () => {
  const res = await request(app).get('/api/progress');
  assert.equal(res.status, 401);
});

test('sheet has 495 items in 20 steps', async () => {
  const res = await request(app).get('/api/sheet');
  assert.equal(res.body.steps.length, 20);
  assert.equal(res.body.problems.length, 495);
});

test('mark a problem solved, then see it in stats', async () => {
  const sheet = (await request(app).get('/api/sheet')).body;
  const p = sheet.problems.find((x) => x.type === 'practice');
  const auth = { Authorization: `Bearer ${token}` };

  const put = await request(app).put(`/api/progress/${encodeURIComponent(p.key)}`).set(auth).send({ solved: true, today });
  assert.equal(put.status, 200);
  assert.equal(put.body.solvedOn, today);

  const stats = await request(app).get(`/api/progress/stats?today=${today}`).set(auth);
  assert.equal(stats.body.totalSolved, 1);
  assert.equal(stats.body.streak, 1);
  assert.equal(stats.body.byDay[today], 1);

  // un-tick removes the document again
  await request(app).put(`/api/progress/${encodeURIComponent(p.key)}`).set(auth).send({ solved: false });
  const after = await request(app).get('/api/progress').set(auth);
  assert.deepEqual(after.body.progress, {});
});

test('a ticked Learn lesson does not count in stats', async () => {
  const sheet = (await request(app).get('/api/sheet')).body;
  const lesson = sheet.problems.find((x) => x.type === 'learn');
  const auth = { Authorization: `Bearer ${token}` };

  await request(app).put(`/api/progress/${encodeURIComponent(lesson.key)}`).set(auth).send({ solved: true, today });
  const stats = await request(app).get(`/api/progress/stats?today=${today}`).set(auth);
  assert.equal(stats.body.totalSolved, 0);
  assert.equal(stats.body.solvedToday, 0);
  assert.equal(stats.body.streak, 0);

  await request(app).put(`/api/progress/${encodeURIComponent(lesson.key)}`).set(auth).send({ solved: false });
});

test('tick an interview question as known', async () => {
  const auth = { Authorization: `Bearer ${token}` };
  const res = await request(app).put('/api/progress/known/04_react:0:0').set(auth).send({ known: true });
  assert.equal(res.status, 200);
  const all = await request(app).get('/api/progress').set(auth);
  assert.deepEqual(all.body.known, ['04_react:0:0']);
});
