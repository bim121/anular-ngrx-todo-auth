import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { WeeklyCompletionBucket } from '@anular-ngrx/todos-data-access';

/**
 * Simple CSS bar chart for weekly completions (PF-6.1 / Phase 6 DS prep).
 * No charting library — tokens-friendly markup for later design-system polish.
 */
@Component({
  selector: 'app-weekly-stats-chart',
  standalone: true,
  templateUrl: './weekly-stats-chart.component.html',
  styleUrl: './weekly-stats-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyStatsChartComponent {
  readonly buckets = input.required<WeeklyCompletionBucket[]>();

  maxCount(): number {
    const values = this.buckets().map((b) => b.completed);
    return Math.max(1, ...values);
  }

  shortLabel(weekLabel: string): string {
    const parts = weekLabel.split('-W');
    return parts[1] ? `W${parts[1]}` : weekLabel;
  }

  ariaSummary(): string {
    return this.buckets()
      .map((b) => `${b.weekLabel}: ${b.completed}`)
      .join(', ');
  }
}
