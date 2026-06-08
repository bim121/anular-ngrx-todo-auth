/**
 * Mock API middleware for json-server.
 * - Authorization: Bearer required for /todos (not for /users auth endpoints).
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
