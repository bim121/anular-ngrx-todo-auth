import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'button[app-button]',
  standalone: true,
  imports: [SpinnerComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ds-btn',
    '[class.ds-btn--primary]': 'variant() === "primary"',
    '[class.ds-btn--secondary]': 'variant() === "secondary"',
    '[class.ds-btn--ghost]': 'variant() === "ghost"',
    '[class.ds-btn--danger]': 'variant() === "danger"',
    '[class.ds-btn--sm]': 'size() === "sm"',
    '[class.ds-btn--md]': 'size() === "md"',
    '[class.ds-btn--lg]': 'size() === "lg"',
    '[class.ds-btn--loading]': 'loading()',
    '[attr.disabled]': 'isDisabled() ? "" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly disabled = input(false);
  readonly loading = input(false);

  readonly isDisabled = computed(() => this.disabled() || this.loading());
}
