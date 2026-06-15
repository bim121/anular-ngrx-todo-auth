import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  createTodo,
  deleteTodo,
  fetchTodos,
  updateTodo,
  type Todo,
} from '@marketing/core/api';
import { Toast } from '@marketing/shared/ui/toast';
import { applyFilter, type TodoFilter } from './apply-filter';
import './TodoList.css';

interface TodoListProps {
  userId: string;
  accessToken: string;
  userName: string;
  onLogout: () => void;
}

export function TodoList({
  userId,
  accessToken,
  userName,
  onLogout,
}: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTodos() {
      setLoading(true);
      setError(null);

      try {
        const items = await fetchTodos(userId, accessToken);
        if (!cancelled) {
          setTodos(items);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load todos';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadTodos();

    return () => {
      cancelled = true;
    };
  }, [userId, accessToken]);

  const filtered = useMemo(
    () => applyFilter(todos, filter),
    [todos, filter]
  );

  const runMutation = useCallback(
    async (action: () => Promise<void>) => {
      setMutating(true);
      setError(null);

      try {
        await action();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Todo action failed';
        setError(message);
      } finally {
        setMutating(false);
      }
    },
    []
  );

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const task = newTask.trim();
    if (!task || mutating) {
      return;
    }

    await runMutation(async () => {
      const created = await createTodo(task, userId, accessToken);
      setTodos((current) => [...current, created]);
      setNewTask('');
    });
  }

  async function handleToggle(todo: Todo) {
    if (mutating) {
      return;
    }

    await runMutation(async () => {
      const updated = await updateTodo(
        { id: todo.id, completed: !todo.completed },
        userId,
        accessToken
      );
      setTodos((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
    });
  }

  async function handleDelete(todoId: string) {
    if (mutating) {
      return;
    }

    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    await runMutation(async () => {
      await deleteTodo(todoId, userId, accessToken);
      setTodos((current) => current.filter((item) => item.id !== todoId));
    });
  }

  return (
    <main className="todo-page">
      <header className="todo-header">
        <div>
          <p className="todo-header__eyebrow">marketing-mfe</p>
          <h1>My Todos</h1>
          <p className="todo-header__user">Signed in as {userName}</p>
        </div>
        <button type="button" className="todo-header__logout" onClick={onLogout}>
          Logout
        </button>
      </header>

      {error ? (
        <Toast type="error" message={error} onDismiss={() => setError(null)} />
      ) : null}

      <section className="todo-card">
        <form className="todo-form" onSubmit={handleAdd}>
          <input
            type="text"
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
            placeholder="What needs to be done?"
            disabled={loading || mutating}
            aria-label="New task"
          />
          <button type="submit" disabled={!newTask.trim() || loading || mutating}>
            Add Task
          </button>
        </form>

        {loading ? (
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
                    filter === value ? 'todo-filter todo-filter--active' : 'todo-filter'
                  }
                  onClick={() => setFilter(value)}
                >
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>

            <p className="todo-count">{filtered.length} items</p>

            <ul className="todo-list">
              {filtered.map((todo) => (
                <li
                  key={todo.id}
                  className={todo.completed ? 'todo-item todo-item--done' : 'todo-item'}
                >
                  <label className="todo-item__label">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => void handleToggle(todo)}
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
