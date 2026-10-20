# A2Z Journey

A full-stack **MERN** app to track Striver's A2Z DSA sheet (495 items) with a LeetCode-style daily streak and a pink activity calendar, plus an interview prep section with 743 questions across 14 topics.

**Stack:** React 19 + Vite · React Router 7 · Node.js 22 + Express 5 · MongoDB + Mongoose 8 · JWT + bcrypt · plain CSS

## Features

- Sign up / log in (JWT); every user has their own progress
- All 20 steps and 495 problems with LeetCode, takeUforward, video, article and C++ GitHub links
- Tick a problem done or star it to revise; search and filter by status and level
- Current and best streak, a 1-year calendar (darker pink = more solved), progress by step and level
- "Up next" problems from the current week of an 8-week plan
- Interview prep: read answers in the app, filter to most-asked, tick "I can explain this", open the PDF
- Download your progress as CSV; light and dark theme; works on phones

## Project structure

```
a2z-journey/
├── package.json          # root scripts: dev, build, start, test
├── render.yaml           # free deploy on Render
├── server/               # Node + Express API
│   ├── src/
│   │   ├── index.js      # entry: connect to MongoDB, start server
│   │   ├── app.js        # Express app: middleware, routes, static files
│   │   ├── config/db.js
│   │   ├── models/       # Mongoose: User, Progress, KnownQuestion
│   │   ├── middleware/   # auth (JWT), error handler
│   │   ├── routes/       # auth, sheet + prep, progress + stats
│   │   ├── utils/streak.js   # streak maths (pure functions, tested)
│   │   └── data/         # a2z.json (problems), qa.json (interview Q&A)
│   ├── public/docs/      # 14 interview PDFs
│   └── test/             # node:test unit + API tests
└── client/               # React + Vite frontend
    └── src/
        ├── main.jsx, App.jsx, api.js
        ├── context/      # AuthContext, ProgressContext, ToastContext
        ├── components/   # Navbar, Heatmap, ProblemRow, Flame
        ├── pages/        # Home, Sheet, Prep, PrepReader, Resources, AuthPage
        ├── utils/        # dates, hearts animation
        └── styles/global.css
```

## Run it on your laptop

You need **Node.js 20.19 or newer** (`node -v`) and a MongoDB database (local, or a free MongoDB Atlas cluster).

```bash
# 1. install everything
npm install
npm run install:all

# 2. settings for the server
cp server/.env.example server/.env
#    then open server/.env and set MONGO_URI and JWT_SECRET

# 3. start the API (port 5000) and React (port 5173) together
npm run dev
```

Open http://localhost:5173, create an account and tick your first problem.

## Tests

```bash
npm test
```

Runs 13 tests: streak maths, sign up / log in, protected routes, ticking a problem and reading stats, and checking Learn lessons stay out of stats. The API tests start a throwaway in-memory MongoDB (the first run downloads it). To use your own MongoDB instead: `TEST_MONGO_URI=mongodb://127.0.0.1:27017 npm test`.

## API

| Method | Route | Login? | What it does |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | no | Create account → `{ token, user }` |
| POST | `/api/auth/login` | no | Log in → `{ token, user }` |
| GET | `/api/auth/me` | yes | Who is logged in |
| GET | `/api/sheet` | no | 20 steps + 495 problems |
| GET | `/api/prep` | no | 14 interview topics (no answers) |
| GET | `/api/prep/:id` | no | One topic with all Q&As |
| GET | `/api/progress` | yes | Your ticks, stars and known questions |
| PUT | `/api/progress/:key` | yes | `{ solved, revise, today }` tick or star a problem |
| GET | `/api/progress/stats?today=YYYY-MM-DD` | yes | Streak, best streak, calendar counts, totals |
| PUT | `/api/progress/known/:qid` | yes | `{ known }` mark an interview question |
| DELETE | `/api/progress` | yes | Reset all your progress |

## Deploy (free)

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), a database user, and allow access from anywhere (`0.0.0.0/0`). Copy the connection string.
2. Push this folder to a GitHub repository.
3. On [Render](https://render.com) choose **New → Blueprint**, pick the repo (it reads `render.yaml`), and paste your `MONGO_URI` when asked.
4. Render builds the React app and starts Express, which serves both the API and the website from one URL.

## Credits

Problem list, levels and links: Striver's A2Z DSA sheet on takeuforward.org. C++ solutions: github.com/megh-bari/Striver-A2Z-DSA-Sheet and github.com/dhruv-yadav-nitj/striver-a2z-dsa-cpp.
