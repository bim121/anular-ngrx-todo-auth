import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { App } from '@tinyhttp/app';
import { cors } from '@tinyhttp/cors';
import { JSONFile } from 'lowdb/node';
import { Low } from 'lowdb';
import { json } from 'milliparsec';
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

const jsonServer = createApp(db, { logger: false });
const { auth, rejectDuplicateUserEmail } = createApiMiddleware(db);

const app = new App();

app.use((req, res, next) =>
  cors({
    allowedHeaders: req.headers['access-control-request-headers']
      ?.split(',')
      .map((h) => h.trim()),
  })(req, res, next)
);
app.options('*', cors());
app.use(json());
app.use(auth);
app.use(rejectDuplicateUserEmail);
app.use(jsonServer);

app.listen(port, () => {
  console.log(chalk.bold(`JSON Server + middleware on http://${host}:${port}`));
  console.log(chalk.gray(`Database: ${dbFile}`));
  console.log(chalk.gray('Middleware: Authorization mock on /todos, duplicate email guard on POST /users'));
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
