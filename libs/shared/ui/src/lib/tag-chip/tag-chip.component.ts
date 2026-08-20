import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-tag-chip',
  standalone: true,
  template: `<span class="ds-tag-chip"><ng-content /></span>`,
  styles: `
    :host {
      display: inline-flex;
    }
    .ds-tag-chip {
      display: inline-flex;
      align-items: center;
      font-size: 0.75rem;
      line-height: 1.2;
      padding: 2px var(--space-2);
      border-radius: 999px;
      background: var(--color-primary-subtle);
      color: var(--color-primary);
      font-family: var(--font-sans);
      white-space: nowrap;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagChipComponent {}
