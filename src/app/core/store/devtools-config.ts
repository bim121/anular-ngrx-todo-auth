import { Action } from '@ngrx/store';

type ActionWithCredentials = Action & {
  credentials?: { password?: string; email?: string; name?: string };
};

/** Masks passwords in DevTools for login/register actions (plan 3.6.1). */
export function devtoolsActionSanitizer(action: Action): Action {
  if (!action.type.toLowerCase().includes('login')) {
    return action;
  }

  const withCredentials = action as ActionWithCredentials;
  if (!withCredentials.credentials?.password) {
    return action;
  }

  return {
    ...withCredentials,
    credentials: {
      ...withCredentials.credentials,
      password: '***',
    },
  } as Action;
}

export const devtoolsConfig = {
  maxAge: 50,
  actionSanitizer: devtoolsActionSanitizer,
} as const;
