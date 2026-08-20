import { FormEvent, useCallback, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { applyFilter, type TodoFilter } from './apply-filter';
import { TodoRow, TODO_ROW_HEIGHT_PX } from './TodoRow';
import { useTodos } from './useTodos';
import { useAuthStore } from '@marketing/stores/authStore';
import { useLogout } from '@marketing/hooks/useLogout';
import { Toast } from '@marketing/shared/ui/toast';
import { Button } from '@marketing/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@marketing/shared/ui/card';
import { Input } from '@marketing/shared/ui/input';
import { ThemeToggle } from '@marketing/shared/ui/theme-toggle';
import './TodoList.css';

export function TodoList() {
  const userName = useAuthStore((state) => state.userName) ?? 'User';
  const logout = useLogout();
  const parentRef = useRef<HTMLDivElement>(null);

  const { todos, loading, error: queryError, mutating, add, toggle, remove } =
    useTodos();

  const [filter, setFilter] = useState<TodoFilter>('all');
  const [newTask, setNewTask] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = useMemo(
    () => applyFilter(todos, filter),
    [todos, filter]
  );

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => TODO_ROW_HEIGHT_PX,
    overscan: 8,
  });

  const error =
    actionError ??
    (queryError instanceof Error ? queryError.message : null);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const task = newTask.trim();
    if (!task || mutating) {
      return;
    }

    setActionError(null);

    try {
      await add(task);
      setNewTask('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to add todo');
    }
  }

  const handleToggle = useCallback(
    async (todoId: string) => {
      if (mutating) {
        return;
      }

      setActionError(null);

      try {
        await toggle(todoId);
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : 'Failed to update todo'
        );
      }
    },
    [mutating, toggle]
  );

  const handleDelete = useCallback(
    async (todoId: string) => {
      if (mutating) {
        return;
      }

      if (!window.confirm('Are you sure you want to delete this task?')) {
        return;
      }

      setActionError(null);

      try {
        await remove(todoId);
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : 'Failed to delete todo'
        );
      }
    },
    [mutating, remove]
  );

  return (
    <main className="todo-page">
      <header className="todo-header">
        <div>
          <p className="todo-header__eyebrow">marketing-mfe</p>
          <h1>My Todos</h1>
          <p className="todo-header__user">Signed in as {userName}</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button type="button" variant="ghost" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      {error ? (
        <Toast type="error" message={error} onDismiss={() => setActionError(null)} />
      ) : null}

      <Card className="todo-card mx-auto max-w-xl border-[var(--color-border)] shadow-[var(--shadow-md)]">
        <CardContent className="pt-6">
          <form className="todo-form mb-4 flex gap-3" onSubmit={handleAdd}>
            <Input
              type="text"
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              placeholder="What needs to be done?"
              disabled={loading || mutating}
              aria-label="New task"
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!newTask.trim() || loading || mutating}
            >
              Add Task
            </Button>
          </form>

          {loading ? (
            <p className="todo-status" aria-busy="true">
              Loading tasks…
            </p>
          ) : (
            <>
              <div className="todo-filters mb-3 flex gap-2" role="group" aria-label="Filter tasks">
                {(['all', 'active', 'done'] as const).map((value) => (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={filter === value ? 'default' : 'secondary'}
                    onClick={() => setFilter(value)}
                  >
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </Button>
                ))}
              </div>

              <p className="todo-count mb-3 text-sm text-[var(--color-muted)]">
                {filtered.length} items
              </p>
              <p className="todo-hint mb-3 text-xs text-[var(--color-muted)]">
                Tip: task starting with <code>[500]</code> rolls back on toggle
                (mock API error).
              </p>

              {filtered.length === 0 ? (
                <Card className="border-dashed bg-transparent shadow-none">
                  <CardHeader className="items-center p-8 text-center">
                    <CardTitle className="text-base font-medium text-[var(--color-muted)]">
                      No todos
                    </CardTitle>
                    <CardDescription>
                      Add a task above to get started.
                    </CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <div
                  ref={parentRef}
                  className="todo-list-viewport"
                  data-testid="todo-virtual-viewport"
                  role="list"
                  aria-label="Todo list"
                >
                  <div
                    className="todo-list todo-list--virtual"
                    style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
                  >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const todo = filtered[virtualRow.index];
                      return (
                        <div
                          key={todo.id}
                          className="todo-list__virtual-row"
                          style={{
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                        >
                          <TodoRow
                            todo={todo}
                            disabled={mutating}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
