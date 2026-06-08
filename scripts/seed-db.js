import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'db.json');

/** Canonical seed data for local json-server. */
const seedData = {
  users: [
    {
      id: 'user_1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    },
    {
      id: 'user_2',
      name: 'Other User',
      email: 'other@example.com',
      password: 'password123',
    },
  ],
  todos: [
    {
      id: 'todo_1',
      userId: 'user_1',
      task: 'Learn NgRx Effects',
      completed: false,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'todo_user2',
      userId: 'user_2',
      task: 'Other user todo',
      completed: false,
      createdAt: '2026-05-29T12:00:00.000Z',
    },
  ],
  $schema: './node_modules/json-server/schema.json',
};

writeFileSync(dbPath, `${JSON.stringify(seedData, null, 2)}\n`, 'utf8');
console.log(`db.json reset to seed state: ${dbPath}`);
