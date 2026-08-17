import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from './input.component';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputComponent, ReactiveFormsModule],
  template: `<app-input inputId="task" [formControl]="ctrl" />`,
})
class InputHostComponent {
  readonly ctrl = new FormControl('hello', { nonNullable: true });
}

describe('InputComponent', () => {
  let fixture: ComponentFixture<InputHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputHostComponent);
    fixture.detectChanges();
  });

  it('writes FormControl value into the native input (CVA)', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('hello');
    expect(input.id).toBe('task');
  });

  it('propagates user input back to the FormControl', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'world';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.ctrl.value).toBe('world');
  });
});
