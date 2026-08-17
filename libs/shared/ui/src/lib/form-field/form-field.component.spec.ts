import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormFieldComponent } from './form-field.component';
import { InputComponent } from '../input/input.component';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormFieldComponent, InputComponent],
  template: `
    <app-form-field label="Task" controlId="task" hint="Keep it short">
      <app-input inputId="task" />
      <span dsError>Required</span>
    </app-form-field>
  `,
})
class FormFieldHostComponent {}

describe('FormFieldComponent', () => {
  let fixture: ComponentFixture<FormFieldHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldHostComponent);
    fixture.detectChanges();
  });

  it('renders label, hint, projected input, and error slot', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('label')?.getAttribute('for')).toBe('task');
    expect(el.querySelector('.form-field__hint')?.textContent).toContain(
      'Keep it short'
    );
    expect(el.querySelector('app-input')).toBeTruthy();
    expect(el.querySelector('[dserror], [dsError]')?.textContent).toContain(
      'Required'
    );
  });
});
