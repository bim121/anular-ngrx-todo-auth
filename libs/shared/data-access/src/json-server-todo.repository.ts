import type { CreateTodoDto, Todo } from './todo.model';
import type { TodoRepository } from './todo.repository';

export interface JsonServerTodoRepositoryOptions {
  /** Defaults to http://localhost:3000 */
  baseUrl?: string;
  getAccessToken: () => string | null;
  /** Used for ownership checks after PATCH/DELETE. */
  getUserId?: () => string | null;
}

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? `${fallback} (${response.status})`;
  } catch {
    return `${fallback} (${response.status})`;
  }
}

/**
 * json-server persistence — fetch to `:3000` (shared mock API with Angular).
 * Bearer token required (same contract as Angular TodoService).
 */
export class JsonServerTodoRepository implements TodoRepository {
  private readonly baseUrl: string;
  private readonly getAccessToken: () => string | null;
  private readonly getUserId: () => string | null;

  constructor(options: JsonServerTodoRepositoryOptions) {
    this.baseUrl = options.baseUrl ?? 'http://localhost:3000';
    this.getAccessToken = options.getAccessToken;
    this.getUserId = options.getUserId ?? (() => null);
  }

  private requireToken(): string {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    return token;
  }

  private authHeaders(extra?: HeadersInit): HeadersInit {
    return {
      Authorization: `Bearer ${this.requireToken()}`,
      'Content-Type': 'application/json',
      ...extra,
    };
  }

  async getAll(userId: string): Promise<Todo[]> {
    const response = await fetch(
      `${this.baseUrl}/todos?userId=${encodeURIComponent(userId)}`,
      { headers: this.authHeaders() }
    );

    if (!response.ok) {
      throw new Error(await readError(response, 'Failed to load todos'));
    }

    return (await response.json()) as Todo[];
  }

  async create(dto: CreateTodoDto): Promise<Todo> {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      userId: dto.userId,
      task: dto.task,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const response = await fetch(`${this.baseUrl}/todos`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(newTodo),
    });

    if (!response.ok) {
      throw new Error(await readError(response, 'Failed to add todo'));
    }

    return (await response.json()) as Todo;
  }

  async update(todo: Todo): Promise<Todo> {
    const mockToggleError = todo.task.startsWith('[500]');
    const response = await fetch(`${this.baseUrl}/todos/${todo.id}`, {
      method: 'PATCH',
      headers: this.authHeaders(
        mockToggleError ? { 'X-Mock-Toggle-Error': '1' } : undefined
      ),
      body: JSON.stringify(todo),
    });

    if (!response.ok) {
      throw new Error(await readError(response, 'Failed to update todo'));
    }

    const updated = (await response.json()) as Todo;
    const userId = this.getUserId();
    if (userId && updated.userId !== userId) {
      throw new Error('Unauthorized to update this todo');
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/todos/${id}`, {
      method: 'DELETE',
      headers: this.authHeaders(),
    });

    if (!response.ok) {
      throw new Error(await readError(response, 'Failed to delete todo'));
    }

    const removed = (await response.json()) as Todo;
    const userId = this.getUserId();
    if (userId && removed.userId !== userId) {
      throw new Error('Unauthorized to delete this todo');
    }
  }
}
