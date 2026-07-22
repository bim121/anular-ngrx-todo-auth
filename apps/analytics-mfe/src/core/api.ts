import type { LoginDto } from '@shared/api-types/login.dto';
import { API_BASE_URL } from './env';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export type { Todo, CreateTodoDto } from '@shared/data-access';

type StoredUser = AuthUser & { password: string };

export async function loginUser(dto: LoginDto): Promise<{
  user: AuthUser;
  accessToken: string;
}> {
  const params = new URLSearchParams({
    email: dto.email.trim().toLowerCase(),
    password: dto.password,
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
