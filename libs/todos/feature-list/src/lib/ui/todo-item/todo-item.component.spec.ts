import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Todo } from '@anular-ngrx/todos-data-access';
import { TodoItemComponent } from './todo-item.component';

describe('TodoItemComponent', () => {
  let fixture: ComponentFixture<TodoItemComponent>;

  const mockTodo: Todo = {
    id: '1',
    userId: 'u1',
    task: 'Write tests',
    completed: false,
    status: 'todo',
    tags: ['dev'],
    priority: 'medium',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoItemComponent);
  });

  it('renders todo from setInput', () => {
    fixture.componentRef.setInput('todo', mockTodo);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Write tests');
    expect(fixture.nativeElement.textContent).toContain('dev');
  });

  it('emits toggled when checkbox changes', () => {
    const toggledSpy = vi.fn();
    fixture.componentRef.setInput('todo', mockTodo);
    fixture.componentInstance.toggled.subscribe(toggledSpy);
    fixture.detectChanges();

    const checkbox = fixture.nativeElement.querySelector(
      '.todo-checkbox input[type="checkbox"]'
    ) as HTMLInputElement;
    checkbox.dispatchEvent(new Event('change'));

    expect(toggledSpy).toHaveBeenCalledTimes(1);
  });

  it('does not emit toggled when disabled', () => {
    const toggledSpy = vi.fn();
    fixture.componentRef.setInput('todo', mockTodo);
    fixture.componentRef.setInput('disabled', true);
    fixture.componentInstance.toggled.subscribe(toggledSpy);
    fixture.detectChanges();

    const checkbox = fixture.nativeElement.querySelector(
      '.todo-checkbox input[type="checkbox"]'
    ) as HTMLInputElement;
    checkbox.dispatchEvent(new Event('change'));

    expect(toggledSpy).not.toHaveBeenCalled();
  });

  it('emits commentsOpened when Comments is clicked', () => {
    const openedSpy = vi.fn();
    fixture.componentRef.setInput('todo', mockTodo);
    fixture.componentRef.setInput('comments', [
      {
        id: 'c1',
        todoId: '1',
        userId: 'u1',
        authorName: 'Ada',
        body: 'Hi',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    fixture.componentInstance.commentsOpened.subscribe(openedSpy);
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector(
      '.comments-toggle'
    ) as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();

    expect(openedSpy).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.textContent).toContain('(1)');
  });
});
