import {
  decodeSessionPayload,
  encodeSessionPayload,
  readSessionFromCookieHeader,
} from './ssr-session.codec';
import { SESSION_COOKIE_NAME } from './ssr-session.constants';

describe('ssr-session.codec', () => {
  const payload = {
    user: { id: 'u1', name: 'Test', email: 'test@example.com' },
    token: 'jwt-token',
  };

  it('round-trips session payload', () => {
    const encoded = encodeSessionPayload(payload);
    expect(decodeSessionPayload(encoded)).toEqual(payload);
  });

  it('reads session from cookie header', () => {
    const encoded = encodeSessionPayload(payload);
    const header = `${SESSION_COOKIE_NAME}=${encoded}; other=value`;

    expect(readSessionFromCookieHeader(header)).toEqual(payload);
  });

  it('returns null for invalid cookie payload', () => {
    expect(decodeSessionPayload('not-valid')).toBeNull();
  });
});
