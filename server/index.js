import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSONFile } from 'lowdb/node';
import { Low } from 'lowdb';
import { watch } from 'chokidar';
import chalk from 'chalk';
import { NormalizedAdapter } from 'json-server/lib/adapters/normalized-adapter.js';
import { Observer } from 'json-server/lib/adapters/observer.js';
import { createApp } from 'json-server/lib/app.js';
import { createApiMiddleware } from './middleware.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dbFile = join(rootDir, 'db.json');
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? 'localhost';

if (!existsSync(dbFile)) {
  console.error(chalk.red(`db.json not found at ${dbFile}`));
  process.exit(1);
}

const adapter = new JSONFile(dbFile);
const observer = new Observer(new NormalizedAdapter(adapter));
const db = new Low(observer, {});
await db.read();

const app = createApp(db, { logger: false });
const { auth, getCurrentUserProfile, rejectDuplicateUserEmail, mockTogglePatchError } =
  createApiMiddleware(db);

/** Insert custom middleware after body parser, before json-server routes. */
function preRouteLayer(template, handler) {
  return {
    method: undefined,
    handler,
    path: '/',
    fullPath: template.fullPath ?? '',
    type: 'mw',
    regex: template.regex,
    fullPathRegex: template.fullPathRegex,
  };
}

const firstRouteIndex = app.middleware.findIndex((layer) => layer.method !== undefined);
const templateLayer = app.middleware[firstRouteIndex - 1] ?? app.middleware[0];

if (firstRouteIndex === -1) {
  console.error(chalk.red('Failed to locate json-server route stack'));
  process.exit(1);
}

app.middleware.splice(
  firstRouteIndex,
  0,
  preRouteLayer(templateLayer, auth),
  preRouteLayer(templateLayer, getCurrentUserProfile),
  preRouteLayer(templateLayer, rejectDuplicateUserEmail),
  preRouteLayer(templateLayer, mockTogglePatchError)
);

app.listen(port, () => {
  console.log(chalk.bold(`JSON Server + middleware on http://${host}:${port}`));
  console.log(chalk.gray(`Database: ${dbFile}`));
  console.log(chalk.gray('Middleware: Authorization mock on /todos, GET /users/me profile, duplicate email guard on POST /users'));
});

if (process.env.NODE_ENV !== 'production') {
  let writing = false;
  observer.onWriteStart = () => {
    writing = true;
  };
  observer.onWriteEnd = () => {
    writing = false;
  };

  watch(dbFile).on('change', () => {
    if (!writing) {
      db.read().catch((error) => {
        console.error(chalk.red('Failed to reload db.json'), error);
      });
    }
  });
}
