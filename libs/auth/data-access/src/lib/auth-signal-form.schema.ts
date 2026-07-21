import {
  debounce,
  disabled,
  email,
  FieldTree,
  minLength,
  required,
  SchemaPathTree,
  validateHttp,
  validateTree,
} from '@angular/forms/signals';
import { AUTH_VALIDATION_MESSAGES } from '@shared/validators/email';
import { User } from './auth.model';

export interface LoginFormModel {
  email: string;
  password: string;
}

export interface RegisterFormModel {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

const USERS_API = 'http://localhost:3000/users';

export function applyLoginFieldRules(
  fields: SchemaPathTree<LoginFormModel>,
  isBusy: () => boolean
): void {
  required(fields.email, { message: AUTH_VALIDATION_MESSAGES.emailRequired });
  email(fields.email, { message: AUTH_VALIDATION_MESSAGES.emailInvalid });
  required(fields.password, { message: 'Password is required.' });
  minLength(fields.password, 8, {
    message: 'Password must be at least 8 characters.',
  });
  disabled(fields.email, isBusy);
  disabled(fields.password, isBusy);
}

export function applyRegisterFieldRules(
  fields: SchemaPathTree<RegisterFormModel>,
  isBusy: () => boolean
): void {
  required(fields.email, { message: AUTH_VALIDATION_MESSAGES.emailRequired });
  email(fields.email, { message: AUTH_VALIDATION_MESSAGES.emailInvalid });
  debounce(fields.email, 400);
  validateHttp<string, User[]>(fields.email, {
    request: (ctx) => {
      const value = ctx.value()?.trim().toLowerCase();
      if (!value) {
        return undefined;
      }
      return `${USERS_API}?email=${encodeURIComponent(value)}`;
    },
    onSuccess: (users) =>
      users.length > 0
        ? {
            kind: 'emailTaken',
            message: AUTH_VALIDATION_MESSAGES.emailTaken,
          }
        : undefined,
    onError: () => undefined,
  });

  required(fields.password, { message: 'Password is required.' });
  minLength(fields.password, 8, {
    message: 'Password must be at least 8 characters.',
  });
  required(fields.passwordConfirm, {
    message: 'Please confirm your password.',
  });

  validateTree(fields, (ctx) => {
    const { password, passwordConfirm } = ctx.value();
    if (!passwordConfirm) {
      return undefined;
    }
    if (password !== passwordConfirm) {
      return {
        kind: 'passwordMismatch',
        message: 'Passwords do not match.',
        fieldTree: ctx.fieldTreeOf(fields.passwordConfirm),
      };
    }
    return undefined;
  });

  disabled(fields.name, isBusy);
  disabled(fields.email, isBusy);
  disabled(fields.password, isBusy);
  disabled(fields.passwordConfirm, isBusy);
}

export function markLoginFieldsTouched(
  fields: Pick<FieldTree<LoginFormModel>, 'email' | 'password'>
): void {
  fields.email().markAsTouched();
  fields.password().markAsTouched();
}

export function markRegisterFieldsTouched(
  fields: Pick<
    FieldTree<RegisterFormModel>,
    'name' | 'email' | 'password' | 'passwordConfirm'
  >
): void {
  fields.name().markAsTouched();
  fields.email().markAsTouched();
  fields.password().markAsTouched();
  fields.passwordConfirm().markAsTouched();
}
