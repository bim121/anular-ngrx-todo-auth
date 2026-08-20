import { buildMonthGrid } from './calendar-view.component';
import { Todo } from '@anular-ngrx/todos-data-access';

describe('buildMonthGrid', () => {
  const todo = (id: string, dueDate: string): Todo => ({
    id,
    userId: 'u1',
    task: id,
    completed: false,
    status: 'todo',
    tags: [],
    priority: 'medium',
    dueDate,
  });

  it('returns 42 cells and places todos on matching dueDate', () => {
    const map = new Map<string, Todo[]>([
      ['2026-08-15', [todo('a', '2026-08-15')]],
    ]);
    const cells = buildMonthGrid(2026, 7, map); // August = month 7

    expect(cells).toHaveLength(42);
    const day = cells.find((c) => c.iso === '2026-08-15');
    expect(day?.inMonth).toBe(true);
    expect(day?.todos.map((t) => t.id)).toEqual(['a']);
  });

  it('starts grid on Monday', () => {
    // 2026-08-01 is Saturday → grid starts 2026-07-27 (Mon)
    const cells = buildMonthGrid(2026, 7, new Map());
    expect(cells[0].iso).toBe('2026-07-27');
    expect(cells[0].date.getUTCDay()).toBe(1);
  });
});
