import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import authRoutes from './routes/auth.js';
import sheetRoutes from './routes/sheet.js';
import progressRoutes from './routes/progress.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const clientBuild = path.resolve(here, '../../client/dist'); // created by `npm run build` in client/

// The app is built in its own file (not index.js) so tests can import it without starting a real server.
export function createApp() {
  const app = express();

  // ---- middleware: runs on every request, in this order ----
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'style-src': ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
          'font-src': ["'self'", 'https://fonts.gstatic.com'],
        },
      },
    })
  ); // safe HTTP headers
  app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' })); // let the Vite dev server call us
  app.use(express.json({ limit: '50kb' })); // read JSON request bodies into req.body
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev')); // log each request in the terminal

  // ---- API routes ----
  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRoutes);
  app.use('/api', sheetRoutes);
  app.use('/api/progress', progressRoutes);

  // ---- files ----
  app.use('/docs', express.static(path.resolve(here, '../public/docs'))); // the 14 interview PDFs

  // In production the same server also sends the built React app
  if (existsSync(clientBuild)) {
    app.use(express.static(clientBuild));
    // Any non-API URL (like /sheet or /prep) gets index.html so React Router can show the right page
    app.get(/^\/(?!api|docs).*/, (req, res) => res.sendFile(path.join(clientBuild, 'index.html')));
  }

  // ---- errors: always last ----
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
