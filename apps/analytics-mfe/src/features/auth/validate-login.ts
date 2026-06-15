import {
  AUTH_VALIDATION_MESSAGES,
  isValidEmail,
} from '@shared/validators/email';

export interface LoginValidationErrors {
  email?: string;
  password?: string;
}

export function validateLogin(
  email: string,
  password: string
): LoginValidationErrors {
  const errors: LoginValidationErrors = {};

  if (!email.trim()) {
    errors.email = AUTH_VALIDATION_MESSAGES.emailRequired;
  } else if (!isValidEmail(email)) {
    errors.email = AUTH_VALIDATION_MESSAGES.emailInvalid;
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  return errors;
}

export function isLoginValid(errors: LoginValidationErrors): boolean {
  return !errors.email && !errors.password;
}
