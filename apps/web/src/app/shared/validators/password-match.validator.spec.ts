import { FormBuilder } from '@angular/forms';
import { passwordMatchValidator } from './password-match.validator';

describe('passwordMatchValidator', () => {
  const fb = new FormBuilder();

  it('returns null when passwords match', () => {
    const form = fb.group(
      {
        password: ['secret123'],
        passwordConfirm: ['secret123'],
      },
      { validators: passwordMatchValidator() },
    );

    expect(form.errors).toBeNull();
  });

  it('returns passwordMismatch when passwords differ', () => {
    const form = fb.group(
      {
        password: ['secret123'],
        passwordConfirm: ['other'],
      },
      { validators: passwordMatchValidator() },
    );

    expect(form.errors).toEqual({ passwordMismatch: true });
  });
});
