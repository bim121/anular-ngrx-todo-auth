import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import {
  encodeSessionPayload,
  type SsrSessionPayload,
} from './app/core/ssr/ssr-session.codec';
import { SESSION_COOKIE_NAME } from './app/core/ssr/ssr-session.constants';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

const isProduction = process.env['NODE_ENV'] === 'production';

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: isProduction,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

app.use(express.json());

/** Mock session API — sets httpOnly cookie for SSR auth (ADR-004 / Phase 7.2.4). */
app.post('/api/session', (req, res) => {
  const body = req.body as Partial<SsrSessionPayload>;
  if (!body.user?.id || !body.token) {
    res.status(400).json({ error: 'Invalid session payload' });
    return;
  }

  res.cookie(
    SESSION_COOKIE_NAME,
    encodeSessionPayload({
      user: body.user,
      token: body.token,
    }),
    sessionCookieOptions
  );
  res.json({ ok: true });
});

app.delete('/api/session', (_req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  res.json({ ok: true });
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
