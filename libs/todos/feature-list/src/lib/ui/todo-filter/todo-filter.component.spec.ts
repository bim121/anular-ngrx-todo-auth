import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoFilterComponent } from './todo-filter.component';

describe('TodoFilterComponent', () => {
  let fixture: ComponentFixture<TodoFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoFilterComponent);
  });

  it('marks active filter from setInput', () => {
    fixture.componentRef.setInput('filter', 'active');
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll(
      'button[app-button]'
    ) as NodeListOf<HTMLButtonElement>;
    expect(buttons[1].classList.contains('ds-btn--primary')).toBe(true);
    expect(buttons[0].classList.contains('ds-btn--primary')).toBe(false);
  });

  it('emits filterChange when a filter button is clicked', () => {
    const filterChangeSpy = vi.fn();
    fixture.componentRef.setInput('filter', 'all');
    fixture.componentInstance.filterChange.subscribe(filterChangeSpy);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll(
      'button[app-button]'
    ) as NodeListOf<HTMLButtonElement>;
    buttons[2].click();

    expect(filterChangeSpy).toHaveBeenCalledWith('done');
  });
});
