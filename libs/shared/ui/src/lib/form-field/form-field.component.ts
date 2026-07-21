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
  readonly field = input.required<FieldTree<string>>();
  readonly type = input<string>('text');
  readonly placeholder = input<string>('');
  readonly pendingMessage = input<string>('');
  readonly showPendingHint = input(false);

  readonly fieldState = computed(() => this.field()());
}
