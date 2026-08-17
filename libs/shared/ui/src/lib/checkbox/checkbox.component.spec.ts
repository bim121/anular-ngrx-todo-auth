import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from './checkbox.component';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CheckboxComponent, ReactiveFormsModule],
  template: `<app-checkbox [formControl]="ctrl">Done</app-checkbox>`,
})
class CheckboxHostComponent {
  readonly ctrl = new FormControl(false, { nonNullable: true });
}

describe('CheckboxComponent', () => {
  let fixture: ComponentFixture<CheckboxHostComponent>;
  let host: HTMLElement;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxHostComponent);
    fixture.detectChanges();
    host = fixture.nativeElement.querySelector('app-checkbox');
    input = fixture.nativeElement.querySelector('input');
  });

  it('sets aria-checked from the control value', () => {
    expect(input.getAttribute('aria-checked')).toBe('false');
    fixture.componentInstance.ctrl.setValue(true);
    fixture.detectChanges();
    expect(input.getAttribute('aria-checked')).toBe('true');
    expect(input.checked).toBe(true);
  });

  it('toggles on Space when the host is focused', () => {
    host.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.ctrl.value).toBe(true);
    expect(input.getAttribute('aria-checked')).toBe('true');
  });
});
