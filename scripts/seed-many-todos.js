import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'db.json');

const COUNT = Number(process.argv[2] ?? 1000);
const USER_ID = process.argv[3] ?? 'user_1';

const priorities = ['low', 'medium', 'high'];
const tagsPool = [['perf'], ['stress'], ['ngrx', 'learning'], ['work'], []];

const db = JSON.parse(readFileSync(dbPath, 'utf8'));

/** Keep other users' todos; replace target user's list with N stress items. */
const otherTodos = (db.todos ?? []).filter((todo) => todo.userId !== USER_ID);

const now = Date.now();
const stressTodos = Array.from({ length: COUNT }, (_, index) => {
  const n = index + 1;
  return {
    id: `stress_${USER_ID}_${n}`,
    userId: USER_ID,
    task: `Stress todo #${n}`,
    completed: n % 7 === 0,
    createdAt: new Date(now - n * 60_000).toISOString(),
    ...(n % 7 === 0
      ? { completedAt: new Date(now - n * 60_000).toISOString() }
      : {}),
    tags: tagsPool[n % tagsPool.length],
    priority: priorities[n % priorities.length],
  };
});

db.todos = [...otherTodos, ...stressTodos];
if (!Array.isArray(db.comments)) {
  db.comments = [];
}

writeFileSync(dbPath, `${JSON.stringify(db, null, 2)}\n`, 'utf8');
console.log(
  `Seeded ${COUNT} todos for ${USER_ID} → ${dbPath} (total todos: ${db.todos.length})`
);
