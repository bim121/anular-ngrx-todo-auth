import { describe, expect, it, beforeEach } from 'vitest';
import { ensureAnalyticsNoIndex, setDocumentTitle } from './seo';

describe('analytics seo helpers', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
  });

  it('ensureAnalyticsNoIndex upserts robots meta', () => {
    ensureAnalyticsNoIndex();
    const robots = document.querySelector('meta[name="robots"]');
    expect(robots?.getAttribute('content')).toBe('noindex, nofollow');

    ensureAnalyticsNoIndex();
    expect(document.querySelectorAll('meta[name="robots"]').length).toBe(1);
  });

  it('setDocumentTitle updates document.title', () => {
    setDocumentTitle('Analytics dashboard');
    expect(document.title).toBe('Analytics dashboard');
  });
});
