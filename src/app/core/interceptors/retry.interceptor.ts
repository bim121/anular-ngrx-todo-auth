import { HttpInterceptorFn } from '@angular/common/http';
import { retry } from 'rxjs';

const GET_RETRY = { count: 2 } as const;

/** Retries failed GET requests only — mutations must not retry. */
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') {
    return next(req);
  }

  return next(req).pipe(retry(GET_RETRY));
};
