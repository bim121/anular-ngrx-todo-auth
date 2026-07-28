import { HttpInterceptorFn } from '@angular/common/http';

/** Adds a unique correlation id to every outbound request. */
export const correlationIdInterceptor: HttpInterceptorFn = (req, next) =>
  next(
    req.clone({
      setHeaders: { 'X-Correlation-Id': crypto.randomUUID() },
    }),
  );
