import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TodoRepository } from './todo.repository';
import { JsonServerTodoRepository } from './json-server-todo.repository';

describe('JsonServerTodoRepository', () => {
  let repository: TodoRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: TodoRepository, useClass: JsonServerTodoRepository },
      ],
    });

    repository = TestBed.inject(TodoRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getAll requests todos filtered by userId query param', () => {
    const userId = 'user_1';
    const todos = [{ id: '1', userId, task: 'A', completed: false }];

    repository.getAll(userId).subscribe((result) => {
      expect(result).toEqual([
        {
          id: '1',
          userId,
          task: 'A',
          completed: false,
          status: 'todo',
          tags: [],
          priority: 'medium',
          dueDate: null,
        },
      ]);
    });

    const req = httpMock.expectOne(
      `http://localhost:3000/todos?userId=${userId}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(todos);
  });

  it('create posts a new todo for the user', () => {
    const userId = 'user_1';

    repository.create({ task: 'Buy milk', userId }).subscribe((todo) => {
      expect(todo.task).toBe('Buy milk');
      expect(todo.userId).toBe(userId);
      expect(todo.completed).toBe(false);
      expect(todo.status).toBe('todo');
      expect(todo.tags).toEqual([]);
      expect(todo.priority).toBe('medium');
      expect(todo.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    const req = httpMock.expectOne('http://localhost:3000/todos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.task).toBe('Buy milk');
    expect(req.request.body.userId).toBe(userId);
    expect(req.request.body.status).toBe('todo');
    req.flush(req.request.body);
  });
});
