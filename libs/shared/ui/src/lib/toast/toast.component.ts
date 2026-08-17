import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { Toast } from './toast.model';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ds-toast',
    '[class.ds-toast--success]': 'toast().type === "success"',
    '[class.ds-toast--error]': 'toast().type === "error"',
    '[attr.role]': 'toast().type === "error" ? "alert" : "status"',
  },
})
export class ToastComponent {
  readonly toast = input.required<Toast>();
  readonly dismissed = output<number>();
}
