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

type StoredUser = User & { password: string };

export interface RegisterUserPayload {
  id: string;
  name: string;
  email: string;
  password: string;
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
