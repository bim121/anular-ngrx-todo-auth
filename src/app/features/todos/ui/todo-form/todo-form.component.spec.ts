import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoFormComponent } from './todo-form.component';

describe('TodoFormComponent', () => {
  let fixture: ComponentFixture<TodoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoFormComponent);
    fixture.detectChanges();
  });

  it('emits submitted with trimmed task and clears input', () => {
    const submittedSpy = vi.fn();
    fixture.componentInstance.submitted.subscribe(submittedSpy);

    fixture.componentInstance.task = '  Buy milk  ';
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(submittedSpy).toHaveBeenCalledWith('Buy milk');
    expect(fixture.componentInstance.task).toBe('');
  });

  it('does not emit when disabled', () => {
    const submittedSpy = vi.fn();
    fixture.componentRef.setInput('disabled', true);
    fixture.componentInstance.submitted.subscribe(submittedSpy);
    fixture.componentInstance.task = 'Ignored';
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    expect(submittedSpy).not.toHaveBeenCalled();
  });
});
