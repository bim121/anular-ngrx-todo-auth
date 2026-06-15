/**
 * Mock API middleware for json-server.
 * - Authorization: Bearer required for /todos and GET /users/me.
 * - GET /users/me: returns profile for the authenticated user.
 * - POST /users: reject duplicate email with 409.
 */

/** @param {import('lowdb').Low} db */
export function createApiMiddleware(db) {
  return {
    /** @type {import('@tinyhttp/app').RequestHandler} */
    auth(req, res, next) {
      const pathname = getPathname(req);

      if (!pathname.startsWith('/todos')) {
        next();
        return;
      }

      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({
          error: 'Missing or invalid Authorization header. Expected: Bearer <token>',
        });
        return;
      }

      next();
    },

    /** @type {import('@tinyhttp/app').RequestHandler} */
    async getCurrentUserProfile(req, res, next) {
      const pathname = getPathname(req);

      if (req.method !== 'GET' || pathname !== '/users/me') {
        next();
        return;
      }

      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({
          error: 'Missing or invalid Authorization header. Expected: Bearer <token>',
        });
        return;
      }

      const token = authHeader.slice('Bearer '.length);
      const userId = parseMockTokenUserId(token);
      if (!userId) {
        res.status(401).json({ error: 'Invalid access token' });
        return;
      }

      await db.read();
      const profile = (db.data?.profiles ?? []).find(
        (entry) => entry.userId === userId
      );

      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }

      res.json(profile);
    },

    /** @type {import('@tinyhttp/app').RequestHandler} */
    async rejectDuplicateUserEmail(req, res, next) {
      const pathname = getPathname(req);

      if (req.method !== 'POST' || pathname !== '/users') {
        next();
        return;
      }

      const email = req.body?.email?.trim?.()?.toLowerCase();
      if (!email) {
        next();
        return;
      }

      await db.read();
      const users = db.data?.users ?? [];
      const exists = users.some(
        (user) => user.email?.trim?.().toLowerCase() === email
      );

      if (exists) {
        res.status(409).json({ error: 'Email already exists' });
        return;
      }

      next();
    },
  };
}

/** @param {import('@tinyhttp/app').Request} req */
function getPathname(req) {
  const url = req.url ?? '/';
  const path = url.split('?')[0] ?? '/';
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

/** @param {string} token */
function parseMockTokenUserId(token) {
  const prefix = 'mockToken=';
  if (!token.startsWith(prefix)) {
    return null;
  }

  const payload = token.slice(prefix.length);
  const separatorIndex = payload.lastIndexOf('-');
  if (separatorIndex <= 0) {
    return null;
  }

  return payload.slice(0, separatorIndex);
}
