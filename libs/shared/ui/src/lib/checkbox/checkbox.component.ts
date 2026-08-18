import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  host: {
    class: 'ds-checkbox',
    '(keydown)': 'onHostKeydown($event)',
  },
})
export class CheckboxComponent implements ControlValueAccessor {
  /** Forwards to the native checkbox `id`. */
  readonly inputId = input('');
  /** Disabled from the template; CVA `setDisabledState` also applies. */
  readonly disabled = input(false);

  readonly checked = signal(false);
  readonly cvaDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private onChange: (value: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: boolean | null): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  toggle(): void {
    if (this.isDisabled()) {
      return;
    }
    const next = !this.checked();
    this.checked.set(next);
    this.onChange(next);
    this.onTouched();
  }

  onNativeChange(event: Event): void {
    if (this.isDisabled()) {
      return;
    }
    const next = (event.target as HTMLInputElement).checked;
    this.checked.set(next);
    this.onChange(next);
    this.onTouched();
  }

  markTouched(): void {
    this.onTouched();
  }

  /** Space toggles when focus is on the host (native input also handles Space). */
  onHostKeydown(event: KeyboardEvent): void {
    if (event.key !== ' ' && event.key !== 'Spacebar') {
      return;
    }
    if ((event.target as HTMLElement).tagName === 'INPUT') {
      return;
    }
    event.preventDefault();
    this.toggle();
  }
}
