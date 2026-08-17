import { Dialog } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';
import { ConfirmModalComponent } from './confirm-modal.component';
import { ModalService } from './modal.service';

describe('ModalService', () => {
  const dialog = {
    open: vi.fn(),
  };

  beforeEach(() => {
    dialog.open.mockReset();
    dialog.open.mockReturnValue({ closed: of(true) });
    TestBed.configureTestingModule({
      providers: [ModalService, { provide: Dialog, useValue: dialog }],
    });
  });

  it('opens CDK dialog as aria-modal with Escape enabled', () => {
    const modal = TestBed.inject(ModalService);
    modal.open(ConfirmModalComponent);

    expect(dialog.open).toHaveBeenCalledWith(
      ConfirmModalComponent,
      expect.objectContaining({
        role: 'dialog',
        ariaModal: true,
        disableClose: false,
        hasBackdrop: true,
      })
    );
  });

  it('confirm maps dialog result to boolean', async () => {
    dialog.open.mockReturnValue({ closed: of(undefined) });
    const modal = TestBed.inject(ModalService);
    await expect(
      firstValueFrom(
        modal.confirm({ title: 'Delete', message: 'Are you sure?' })
      )
    ).resolves.toBe(false);
  });
});
