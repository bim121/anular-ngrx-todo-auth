import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ds-card',
  },
})
export class CardComponent {
  /** Optional heading rendered as `<h2>`. */
  readonly title = input<string>('');
}
