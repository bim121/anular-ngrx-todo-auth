import {
  buildCanonicalUrl,
  buildDocumentTitle,
  buildPageDescription,
} from './seo-meta.util';

describe('seo-meta.util', () => {
  it('builds document title from page data', () => {
    expect(
      buildDocumentTitle({
        title: 'My Todos',
        breadcrumb: 'Todos',
        description: 'Todo list',
      }),
    ).toBe('My Todos | Todo App');
  });

  it('uses default app title when page data is missing', () => {
    expect(buildDocumentTitle(null)).toBe('Todo App');
  });

  it('uses page description or default fallback', () => {
    expect(
      buildPageDescription({
        title: 'Login',
        breadcrumb: 'Login',
        description: 'Sign in to your account.',
      }),
    ).toBe('Sign in to your account.');
    expect(buildPageDescription(null)).toContain('Organize tasks');
  });

  it('builds canonical url from siteUrl and path', () => {
    expect(buildCanonicalUrl('/login')).toBe('http://localhost:4200/login');
    expect(buildCanonicalUrl('/')).toBe('http://localhost:4200');
  });
});
