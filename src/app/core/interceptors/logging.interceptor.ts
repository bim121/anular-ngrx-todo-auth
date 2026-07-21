import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

/** Dev-only request/response logger (phase 4.5.1). */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const started = performance.now();
  console.debug(`[HTTP] → ${req.method} ${req.urlWithParams}`);

  return next(req).pipe(
    tap({
      next: () => {
        const ms = Math.round(performance.now() - started);
        console.debug(`[HTTP] ← ${req.method} ${req.urlWithParams} (${ms}ms)`);
      },
      error: (err: unknown) => {
        const ms = Math.round(performance.now() - started);
        console.debug(
          `[HTTP] ✕ ${req.method} ${req.urlWithParams} (${ms}ms)`,
          err
        );
      },
    })
  );
};
