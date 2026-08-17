import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { ConfirmModalData } from './confirm-modal.data';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ds-modal',
    role: 'dialog',
    '[attr.aria-modal]': '"true"',
    '[attr.aria-labelledby]': '"ds-confirm-title"',
    '[attr.aria-describedby]': '"ds-confirm-message"',
  },
})
export class ConfirmModalComponent {
  private readonly dialogRef = inject(DialogRef<boolean>);
  readonly data = inject<ConfirmModalData>(DIALOG_DATA);

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}
