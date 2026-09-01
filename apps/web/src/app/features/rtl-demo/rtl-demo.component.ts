import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent, ButtonComponent } from '@anular-ngrx/shared-ui';

@Component({
  selector: 'app-rtl-demo',
  standalone: true,
  imports: [CardComponent, ButtonComponent],
  template: `
    <section class="rtl-demo" dir="rtl">
      <app-card>
        <h2 i18n="@@rtl.heading">RTL layout spike</h2>
        <p i18n="@@rtl.hint">
          Page with dir="rtl" to verify design-system spacing and alignment.
        </p>
        <div class="rtl-demo__actions">
          <button app-button type="button">Primary</button>
          <button app-button type="button" variant="secondary">Secondary</button>
        </div>
      </app-card>
    </section>
  `,
  styles: `
    .rtl-demo {
      max-width: 32rem;
      margin: 0 auto;
      padding: 1rem;
    }

    .rtl-demo__actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtlDemoComponent {}
