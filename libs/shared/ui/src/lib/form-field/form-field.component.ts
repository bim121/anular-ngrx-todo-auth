import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [FormField],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent {
  readonly label = input.required<string>();
  readonly controlId = input.required<string>();
  /** Signal-forms field. Omit when projecting a CVA control (`app-input`). */
  readonly field = input<FieldTree<string> | undefined>(undefined);
  readonly type = input<string>('text');
  readonly placeholder = input<string>('');
  readonly hint = input<string>('');
  readonly pendingMessage = input<string>('');
  readonly showPendingHint = input(false);

  readonly fieldState = computed(() => this.field()?.());
}
