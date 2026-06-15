import { API_BASE_URL } from './env';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface Todo {
  id: string;
  userId: string;
  task: string;
  completed: boolean;
  createdAt?: string;
}

type StoredUser = User & { password: string };

export interface RegisterUserPayload {
  id: string;
  name: string;
  email: string;
  password: string;
}

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? `${fallback} (${response.status})`;
  } catch {
    return `${fallback} (${response.status})`;
  }
}

/** json-server mock login — same contract as Angular AuthService. */
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const params = new URLSearchParams({
    email: email.trim().toLowerCase(),
    password,
  });

  const response = await fetch(`${API_BASE_URL}/users?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Login failed (${response.status})`);
  }

  const users = (await response.json()) as StoredUser[];

  if (users.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = users[0];
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    accessToken: `mockToken=${user.id}-${Date.now()}`,
  };
}

/** json-server mock register — POST /users (middleware rejects duplicates with 409). */
export async function registerUser(
  payload: RegisterUserPayload
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (response.status === 409) {
    throw new Error('Email already exists');
  }

  if (!response.ok) {
    throw new Error(`Registration failed (${response.status})`);
  }

  const created = (await response.json()) as StoredUser;
  return {
    id: created.id,
    name: created.name,
    email: created.email,
  };
}

/** json-server todos — Bearer required (same as Angular TodoService). */
export async function fetchTodos(
  userId: string,
  accessToken: string
): Promise<Todo[]> {
  const response = await fetch(
    `${API_BASE_URL}/todos?userId=${encodeURIComponent(userId)}`,
    { headers: authHeaders(accessToken) }
  );

  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to load todos'));
  }

  return (await response.json()) as Todo[];
}

export async function createTodo(
  task: string,
  userId: string,
  accessToken: string
): Promise<Todo> {
  const newTodo: Todo = {
    id: crypto.randomUUID(),
    userId,
    task,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  const response = await fetch(`${API_BASE_URL}/todos`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(newTodo),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to add todo'));
  }

  return (await response.json()) as Todo;
}

export async function updateTodo(
  todo: Partial<Todo> & { id: string },
  userId: string,
  accessToken: string
): Promise<Todo> {
  const response = await fetch(`${API_BASE_URL}/todos/${todo.id}`, {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify(todo),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to update todo'));
  }

  const updated = (await response.json()) as Todo;
  if (updated.userId !== userId) {
    throw new Error('Unauthorized to update this todo');
  }

  return updated;
}

export async function deleteTodo(
  todoId: string,
  userId: string,
  accessToken: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
    method: 'DELETE',
    headers: authHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to delete todo'));
  }

  const removed = (await response.json()) as Todo;
  if (removed.userId !== userId) {
    throw new Error('Unauthorized to delete this todo');
  }
}
