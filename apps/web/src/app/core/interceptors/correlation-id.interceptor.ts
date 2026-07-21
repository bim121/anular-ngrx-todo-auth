import { HttpInterceptorFn } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';

/** Adds a unique correlation id to every outbound request. */
export const correlationIdInterceptor: HttpInterceptorFn = (req, next) =>
  next(
    req.clone({
      setHeaders: { 'X-Correlation-Id': uuidv4() },
    }),
  );
