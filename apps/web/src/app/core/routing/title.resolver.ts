import { ResolveFn } from '@angular/router';
import { environment } from '../../../environments/environment';

/** Resolves document title from route `data.title` (Phase 7.1.1). */
export const titleResolver: ResolveFn<string> = (route) => {
  return (route.data['title'] as string | undefined) ?? environment.appName;
};
