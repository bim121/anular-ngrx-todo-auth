import { Provider } from '@angular/core';
import { CommentRepository } from './comment.repository';
import { JsonServerCommentRepository } from './json-server-comment.repository';

export function provideCommentRepository(): Provider {
  return { provide: CommentRepository, useClass: JsonServerCommentRepository };
}
