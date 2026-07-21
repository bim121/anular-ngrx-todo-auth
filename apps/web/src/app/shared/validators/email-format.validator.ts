import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isValidEmail } from '@shared/validators/email';

export function emailFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null | undefined;
    if (!value?.trim()) {
      return null;
    }
    return isValidEmail(value) ? null : { email: true };
  };
}
