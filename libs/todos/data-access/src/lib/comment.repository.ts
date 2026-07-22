import { Observable } from 'rxjs';
import { TodoComment, CreateCommentDto } from './comment.model';

export abstract class CommentRepository {
  abstract getByTodoId(todoId: string): Observable<TodoComment[]>;
  abstract create(dto: CreateCommentDto): Observable<TodoComment>;
}
