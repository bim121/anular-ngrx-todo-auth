import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { Injectable, Type, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ConfirmModalComponent } from './confirm-modal.component';
import { ConfirmModalData } from './confirm-modal.data';

/**
 * DS overlay (Phase 6.3.2). CDK Dialog supplies focus trap, Escape, and backdrop.
 */
@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly dialog = inject(Dialog);

  open<R>(
    component: Type<unknown>,
    config: DialogConfig = {}
  ): DialogRef<R> {
    const merged: DialogConfig = {
      role: 'dialog',
      ariaModal: true,
      hasBackdrop: true,
      disableClose: false,
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      panelClass: 'ds-modal-pane',
      ...config,
    };
    return this.dialog.open(component, merged as never) as DialogRef<R>;
  }

  confirm(data: ConfirmModalData): Observable<boolean> {
    return this.open<boolean>(ConfirmModalComponent, {
      data,
      ariaLabelledBy: 'ds-confirm-title',
      ariaDescribedBy: 'ds-confirm-message',
    }).closed.pipe(map((result) => result === true));
  }
}
