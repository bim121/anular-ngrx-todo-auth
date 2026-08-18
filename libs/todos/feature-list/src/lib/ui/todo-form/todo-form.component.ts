import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '@anular-ngrx/shared-ui';
import { InputComponent } from '@anular-ngrx/shared-ui/input/input.component';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent],
  templateUrl: './todo-form.component.html',
  styleUrl: './todo-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoFormComponent {
  readonly disabled = input(false);
  readonly submitted = output<string>();

  task = '';

  onSubmit(): void {
    const value = this.task.trim();
    if (!value || this.disabled()) return;

    this.submitted.emit(value);
    this.task = '';
  }
}
