import { EntityState } from '@ngrx/entity';

export interface TodoComment {
  id: string;
  todoId: string;
  userId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface CreateCommentDto {
  todoId: string;
  userId: string;
  authorName: string;
  body: string;
}

export interface CommentsState extends EntityState<TodoComment> {
  loadingTodoIds: string[];
  error: string | null;
}
