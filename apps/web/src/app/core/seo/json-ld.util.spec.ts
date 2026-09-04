import {
  buildWebApplicationJsonLd,
  isPublicSeoPath,
  syncJsonLdScript,
} from './json-ld.util';

describe('json-ld.util', () => {
  it('buildWebApplicationJsonLd returns WebApplication schema', () => {
    const ld = buildWebApplicationJsonLd();
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('WebApplication');
    expect(ld['name']).toBe('Todo App');
  });

  it('isPublicSeoPath matches locale-prefixed auth routes', () => {
    expect(isPublicSeoPath('/en/login')).toBe(true);
    expect(isPublicSeoPath('/ru/register')).toBe(true);
    expect(isPublicSeoPath('/en/todos')).toBe(false);
  });

  it('syncJsonLdScript upserts and removes the script tag', () => {
    const head = document.createElement('head');
    document.documentElement.appendChild(head);

    syncJsonLdScript(head, buildWebApplicationJsonLd());
    const script = head.querySelector('#app-json-ld');
    expect(script?.getAttribute('type')).toBe('application/ld+json');
    expect(script?.textContent).toContain('WebApplication');

    syncJsonLdScript(head, null);
    expect(head.querySelector('#app-json-ld')).toBeNull();

    head.remove();
  });
});
