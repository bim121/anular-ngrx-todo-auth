/** Shared email validation — Angular, Vue, React. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) {
    return false;
  }
  return EMAIL_PATTERN.test(trimmed);
}

export const AUTH_VALIDATION_MESSAGES = {
  emailRequired: 'Email is required.',
  emailInvalid: 'Please enter a valid email.',
  emailTaken: 'This email is already registered.',
} as const;
