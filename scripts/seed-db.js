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
  profiles: [
    {
      userId: 'user_1',
      displayName: 'Test User',
      bio: 'Building Angular apps with NgRx and signals.',
      avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=TU',
      memberSince: '2026-01-01',
      stats: {
        todosCompleted: 0,
        loginCount: 42,
      },
    },
    {
      userId: 'user_2',
      displayName: 'Other User',
      bio: 'Exploring zoneless Angular and httpResource.',
      avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=OU',
      memberSince: '2026-02-15',
      stats: {
        todosCompleted: 0,
        loginCount: 7,
      },
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
  comments: [],
  $schema: './node_modules/json-server/schema.json',
};

writeFileSync(dbPath, `${JSON.stringify(seedData, null, 2)}\n`, 'utf8');
console.log(`db.json reset to seed state: ${dbPath}`);
