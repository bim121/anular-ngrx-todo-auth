import { FormEvent, useMemo, useState } from 'react';
import { applyFilter, type TodoFilter } from './apply-filter';
import {
  useAddTodoMutation,
  useDeleteTodoMutation,
  useToggleTodoMutation,
  useTodosQuery,
} from './useTodosQuery';
import { useAuthStore } from '@marketing/stores/authStore';
import { useLogout } from '@marketing/hooks/useLogout';
import { Toast } from '@marketing/shared/ui/toast';
import './TodoList.css';

export function TodoList() {
  const userName = useAuthStore((state) => state.userName) ?? 'User';
  const logout = useLogout();

  const { data: todos = [], isLoading, error: queryError } = useTodosQuery();
  const addTodoMutation = useAddTodoMutation();
  const deleteTodoMutation = useDeleteTodoMutation();
  const toggleTodoMutation = useToggleTodoMutation();

  const [filter, setFilter] = useState<TodoFilter>('all');
  const [newTask, setNewTask] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = useMemo(
    () => applyFilter(todos, filter),
    [todos, filter]
  );

  const mutating =
    addTodoMutation.isPending ||
    deleteTodoMutation.isPending ||
    toggleTodoMutation.isPending;

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
      await addTodoMutation.mutateAsync(task);
      setNewTask('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to add todo');
    }
  }

  async function handleToggle(todoId: string) {
    if (mutating) {
      return;
    }

    const todo = todos.find((item) => item.id === todoId);
    if (!todo) {
      return;
    }

    setActionError(null);

    try {
      await toggleTodoMutation.mutateAsync(todo);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to update todo'
      );
    }
  }

  async function handleDelete(todoId: string) {
    if (mutating) {
      return;
    }

    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setActionError(null);

    try {
      await deleteTodoMutation.mutateAsync(todoId);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to delete todo'
      );
    }
  }

  return (
    <main className="todo-page">
      <header className="todo-header">
        <div>
          <p className="todo-header__eyebrow">marketing-mfe</p>
          <h1>My Todos</h1>
          <p className="todo-header__user">Signed in as {userName}</p>
        </div>
        <button type="button" className="todo-header__logout" onClick={logout}>
          Logout
        </button>
      </header>

      {error ? (
        <Toast type="error" message={error} onDismiss={() => setActionError(null)} />
      ) : null}

      <section className="todo-card">
        <form className="todo-form" onSubmit={handleAdd}>
          <input
            type="text"
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
            placeholder="What needs to be done?"
            disabled={isLoading || mutating}
            aria-label="New task"
          />
          <button
            type="submit"
            disabled={!newTask.trim() || isLoading || mutating}
          >
            Add Task
          </button>
        </form>

        {isLoading ? (
          <p className="todo-status" aria-busy="true">
            Loading tasks…
          </p>
        ) : (
          <>
            <div className="todo-filters" role="group" aria-label="Filter tasks">
              {(['all', 'active', 'done'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={
                    filter === value
                      ? 'todo-filter todo-filter--active'
                      : 'todo-filter'
                  }
                  onClick={() => setFilter(value)}
                >
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>

            <p className="todo-count">{filtered.length} items</p>
            <p className="todo-hint">
              Tip: task starting with <code>[500]</code> rolls back on toggle (mock API error).
            </p>

            <ul className="todo-list">
              {filtered.map((todo) => (
                <li
                  key={todo.id}
                  className={
                    todo.completed ? 'todo-item todo-item--done' : 'todo-item'
                  }
                >
                  <label className="todo-item__label">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => void handleToggle(todo.id)}
                      disabled={mutating}
                    />
                    <span>{todo.task}</span>
                  </label>
                  <button
                    type="button"
                    className="todo-item__delete"
                    onClick={() => void handleDelete(todo.id)}
                    disabled={mutating}
                  >
                    Delete
                  </button>
                </li>
              ))}
              {filtered.length === 0 ? (
                <li className="todo-empty">No todos</li>
              ) : null}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}
