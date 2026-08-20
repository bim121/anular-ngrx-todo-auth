import { memo } from 'react';
import type { Todo } from '@shared/data-access';
import { Button } from '@marketing/shared/ui/button';
import { Checkbox } from '@marketing/shared/ui/checkbox';

export const TODO_ROW_HEIGHT_PX = 72;

export type TodoRowProps = {
  todo: Todo;
  disabled: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

/**
 * Memoized row so a single toggle does not re-render every visible item (R.5.2).
 * Parent must pass stable `onToggle` / `onDelete` (useCallback).
 */
export const TodoRow = memo(function TodoRow({
  todo,
  disabled,
  onToggle,
  onDelete,
}: TodoRowProps) {
  return (
    <div
      className={todo.completed ? 'todo-item todo-item--done' : 'todo-item'}
      style={{ height: TODO_ROW_HEIGHT_PX }}
      role="listitem"
    >
      <label className="todo-item__label">
        <Checkbox
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          disabled={disabled}
        />
        <span>{todo.task}</span>
      </label>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-[var(--color-danger-subtle)] text-[var(--color-danger-text)] hover:bg-[var(--color-danger-subtle)]"
        onClick={() => onDelete(todo.id)}
        disabled={disabled}
      >
        Delete
      </Button>
    </div>
  );
});
