import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let service: TodoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TodoService],
    });

    service = TestBed.inject(TodoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getTodos requests todos filtered by userId query param', () => {
    const userId = 'user_1';
    const todos = [{ id: '1', userId, task: 'A', completed: false }];

    service.getTodos(userId).subscribe((result) => {
      expect(result).toEqual([
        {
          id: '1',
          userId,
          task: 'A',
          completed: false,
          tags: [],
          priority: 'medium',
        },
      ]);
    });

    const req = httpMock.expectOne(
      `http://localhost:3000/todos?userId=${userId}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(todos);
  });
});
