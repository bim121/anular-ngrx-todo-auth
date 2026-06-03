import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Group-level validator: `password` must equal `passwordConfirm`. */
export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control;
    const password = group.get('password')?.value;
    const passwordConfirm = group.get('passwordConfirm')?.value;

    if (!passwordConfirm) {
      return null;
    }

    return password === passwordConfirm ? null : { passwordMismatch: true };
  };
}
