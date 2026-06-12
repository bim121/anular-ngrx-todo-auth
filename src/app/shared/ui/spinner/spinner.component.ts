import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  /** Visual size: sm (inline) or md (block). */
  size = input<'sm' | 'md'>('md');
}
