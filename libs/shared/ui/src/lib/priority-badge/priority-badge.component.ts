import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PriorityBadgeLevel = 'low' | 'medium' | 'high';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  template: `
    <span class="ds-priority" [attr.data-priority]="priority()">
      {{ priority() }}
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
    .ds-priority {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      padding: 2px var(--space-2);
      border-radius: var(--radius-sm);
      background: var(--color-bg);
      color: var(--color-text);
      font-family: var(--font-sans);
      font-weight: 600;
    }
    .ds-priority[data-priority='high'] {
      background: var(--color-danger-subtle);
      color: var(--color-danger-text);
    }
    .ds-priority[data-priority='medium'] {
      background: var(--color-primary-subtle);
      color: var(--color-primary);
    }
    .ds-priority[data-priority='low'] {
      background: var(--color-success-subtle);
      color: var(--color-success-text);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriorityBadgeComponent {
  readonly priority = input.required<PriorityBadgeLevel>();
}
