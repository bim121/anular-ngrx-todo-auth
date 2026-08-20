import { todosToCsv } from './export-todos';
import { Todo } from './todo.model';

describe('exportTodos / todosToCsv', () => {
  const sample: Todo[] = Array.from({ length: 1000 }, (_, i) => ({
    id: `t${i}`,
    userId: 'u1',
    task: i % 10 === 0 ? `Task "quoted", #${i}` : `Task ${i}`,
    completed: i % 3 === 0,
    status: (i % 3 === 0 ? 'done' : 'todo') as Todo['status'],
    tags: i % 2 === 0 ? ['a', 'b'] : [],
    priority: 'medium',
    createdAt: '2026-01-01T00:00:00.000Z',
  }));

  it('builds CSV with header + 1000 rows under 50ms', () => {
    const start = performance.now();
    const csv = todosToCsv(sample);
    const elapsed = performance.now() - start;

    expect(csv.split('\n')).toHaveLength(1001);
    expect(csv).toContain('id,task,completed');
    expect(csv).toContain('"Task ""quoted"", #0"');
    expect(elapsed).toBeLessThan(50);
  });
});
