/** json-server mock API (shared with Angular app). */
export const API_BASE_URL =
  import.meta.env['VITE_API_URL'] ?? 'http://localhost:3000';

/** Angular shell URL stub for post-login redirect (Phase 9). */
export const ANGULAR_APP_URL =
  import.meta.env['VITE_ANGULAR_APP_URL'] ?? 'http://localhost:4200/todos';
