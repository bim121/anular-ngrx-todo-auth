import { Todo } from './todo.model';

const CSV_HEADERS = [
  'id',
  'task',
  'completed',
  'priority',
  'tags',
  'createdAt',
  'completedAt',
  'userId',
] as const;

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Build CSV text for a todo list (no DOM). */
export function todosToCsv(todos: readonly Todo[]): string {
  const lines = [CSV_HEADERS.join(',')];
  for (const todo of todos) {
    lines.push(
      [
        todo.id,
        todo.task,
        String(todo.completed),
        todo.priority,
        todo.tags.join('|'),
        todo.createdAt ?? '',
        todo.completedAt ?? '',
        todo.userId,
      ]
        .map((cell) => escapeCsvCell(String(cell)))
        .join(',')
    );
  }
  return lines.join('\n');
}

/**
 * Client-side CSV download via Blob (PF-5.1).
 * Safe to call with 1000+ rows in the browser.
 */
export function exportTodos(
  todos: readonly Todo[],
  format: 'csv' | 'json' = 'csv',
  filename = `todos-${new Date().toISOString().slice(0, 10)}`
): void {
  const body =
    format === 'json'
      ? JSON.stringify(todos, null, 2)
      : todosToCsv(todos);
  const mime =
    format === 'json' ? 'application/json;charset=utf-8' : 'text/csv;charset=utf-8';
  const ext = format === 'json' ? 'json' : 'csv';
  const blob = new Blob([body], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${filename}.${ext}`;
  anchor.click();
  URL.revokeObjectURL(url);
}
